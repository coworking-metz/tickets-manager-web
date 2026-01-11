import { APP_NAME, APP_VERSION } from '@/helpers/environment';
import axios, { AxiosRequestConfig } from 'axios';

export const httpBaseConfig = {
  baseURL: import.meta.env.VUE_APP_API_URL,
  timeout: 10_000,
  headers: {
    'X-APP-NAME': APP_NAME,
    'X-APP-VERSION': APP_VERSION,
  },
} as AxiosRequestConfig;

export const HTTP = axios.create(httpBaseConfig);

// differentiate the public HTTP client from the private HTTP client
// to avoid conflicts with interceptors or other configurations
export const PUBLIC_HTTP_CLIENT = axios.create(httpBaseConfig);
