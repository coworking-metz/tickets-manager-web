import { useHttpStore } from './http';
import { AppError, AppErrorCode } from '@/helpers/errors';
import { User, decodeToken, refreshTokens } from '@/services/api/auth';
import dayjs from 'dayjs';
import { includes } from 'lodash';
import { defineStore } from 'pinia';

const LOCAL_STORAGE_REFRESH_TOKEN_NAME = 'rt';

/**
 * In order to avoid asking for multiple refresh tokens at the same time when it has expired,
 * this singleton holds the http request Promise until a new token is fetched.
 */
let refreshPromise: Promise<void> | null = null;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    user: null as User | null,
  }),
  actions: {
    setRefreshToken(refreshToken: string) {
      localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_NAME, refreshToken);
    },
    async setAccessToken(accessToken: string) {
      const user = decodeToken(accessToken);
      if (!user || !includes(user.roles, 'admin')) {
        const error = new Error('Missing admin role') as AppError;
        error.code = AppErrorCode.FORBIDDEN;
        throw error;
      }

      this.user = user;
      this.accessToken = accessToken || null;
    },
    async getOrRefreshAccessToken() {
      if (this.accessToken) {
        const { exp } = decodeToken(this.accessToken);
        if (exp && dayjs().isAfter(dayjs.unix(exp))) {
          await this.fetchTokens();
        }
      }

      return this.accessToken;
    },
    fetchTokens() {
      if (!refreshPromise) {
        const refreshToken = localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN_NAME);
        refreshPromise = refreshTokens(refreshToken)
          .then(async ({ accessToken: newAccessToken, refreshToken: newRefresToken }) => {
            await this.setAccessToken(newAccessToken);
            this.setRefreshToken(newRefresToken);
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      return refreshPromise;
    },
    disconnect() {
      this.accessToken = null;
      this.user = null;
      localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_NAME);
      const http = useHttpStore();
      http.cancelAllRequests();
      http.$reset();
    },
    logout() {
      this.disconnect();
      localStorage.clear();
    },
  },
});
