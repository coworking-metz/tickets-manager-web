import { parseErrorText } from '@/helpers/errors';
import { i18nInstance } from '@/i18n';
import { useAuthStore } from '@/store/auth';
import { useHttpStore } from '@/store/http';
import { useNotificationsStore } from '@/store/notifications';
import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosResponse,
  CancelToken,
  InternalAxiosRequestConfig,
} from 'axios';
import axiosRetry from 'axios-retry';
import { compact } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

export interface AppAxiosRequestConfig<D = unknown> extends InternalAxiosRequestConfig<D> {
  id?: string;
  cancelToken?: CancelToken;
}

const MAX_REQUEST_RETRIES = 2;

// to avoid dependency cycle @see https://stackoverflow.com/a/51048400/15183871
const createHttpInterceptors = (httpInstance: AxiosInstance) => {
  httpInstance.interceptors.request.use(async (config: AppAxiosRequestConfig) => {
    const accessToken = await useAuthStore()
      .getOrRefreshAccessToken()
      .catch(async (error) => {
        // prefix a descriptive error message
        // to let the user know that refreshing tokens failed
        const errorMessage = await parseErrorText(error);

        const prefixedError = new Error(
          compact([i18nInstance.global.t('auth.onRefreshToken.fail'), errorMessage]).join('\n'),
        );
        return Promise.reject(prefixedError);
      });
    const headers = {
      ...config.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    } as AxiosHeaders;

    return {
      ...config,
      headers,
    };
  });

  httpInstance.interceptors.request.use((config: AppAxiosRequestConfig) => {
    // do not add it to the store if it already has a cancelToken
    // meaning: it doesn't want to be managed by the store
    // example: for requests like /entities/me or /auth/token
    if (config.cancelToken) return config;

    // dispatch a new request in the store with the cancelToken source
    const cancelTokenSource = axios.CancelToken.source();
    const uuid = uuidv4();

    const httpStore = useHttpStore();

    httpStore.addRequest({
      id: uuid,
      cancelTokenSource,
    });

    return {
      ...config,
      id: uuid,
      cancelToken: cancelTokenSource.token,
    };
  });

  axiosRetry(httpInstance, {
    retries: MAX_REQUEST_RETRIES,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: async (error: AxiosError) => {
      // check if the access token has been expired
      const axiosError = error as AxiosError;

      const is401 = axiosError.response?.status === 401;
      if (!is401) return false;

      const hadAccessToken = !!(axiosError.response?.config?.headers as AxiosHeaders).get(
        'Authorization',
      );
      if (!hadAccessToken) return false;

      const responseContentType = axiosError.response?.headers?.['content-type'];
      const isResponseContentJson = ((responseContentType || '') as string).includes(
        'application/json',
      );
      if (!isResponseContentJson) return false;

      // if the expected response type was blob, the data won't be parsed as JSON by axios
      // we need to do it ourselves
      const content = axiosError.response?.data as any;
      const parsedError =
        typeof content?.text === 'function' ? JSON.parse(await content.text()) : content;
      const isTokenExpired = parsedError.code === 'EXPIRED_ACCESS_TOKEN';
      if (isTokenExpired) {
        // should fetch another access token and retry
        const authStore = useAuthStore();
        await authStore.fetchTokens();
        return true;
      }

      return false;
    },
  });

  httpInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const authStore = useAuthStore();
      // disconnect the user on 401
      if (error.response && error.response.status === 401 && authStore.accessToken) {
        // cancel all requests
        const disconnectedError = new Error('User has been logged out');
        const httpStore = useHttpStore();
        httpStore.cancelAllRequests(disconnectedError.message);

        // the user should be properly logged out of the platform
        await authStore.disconnect();

        const notificationsStore = useNotificationsStore();
        notificationsStore.addErrorNotification(
          error,
          i18nInstance.global.t('errors.onDisconnect.message'),
        );

        return Promise.reject(disconnectedError);
      }

      return Promise.reject(error);
    },
  );

  httpInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // remove request from the store once it has ended
      const { id } = response.config as AppAxiosRequestConfig;
      if (id) {
        const httpStore = useHttpStore();
        httpStore.removeRequest(id);
      }
      return Promise.resolve(response);
    },
    (error: AxiosError & { config: AppAxiosRequestConfig }) => {
      // remove request from the store once it has ended
      // unless it has been aborted: therefore it won't have a config
      if (error.config?.id) {
        const httpStore = useHttpStore();
        httpStore.removeRequest(error.config.id);
      }
      return Promise.reject(error);
    },
  );
};

export default createHttpInterceptors;
