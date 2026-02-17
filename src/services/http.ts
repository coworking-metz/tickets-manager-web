import { API_BASE_URL, APP_NAME, APP_VERSION } from '@/helpers/environment';
import axios, { AxiosRequestConfig } from 'axios';

export const httpBaseConfig = {
  baseURL: API_BASE_URL,
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
