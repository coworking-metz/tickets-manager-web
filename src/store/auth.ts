import { useHttpStore } from './http';
import { AppError, AppErrorCode } from '@/helpers/errors';
import { User, refreshTokens } from '@/services/api/auth';
import { defineStore } from 'pinia';

const LOCAL_STORAGE_REFRESH_TOKEN_NAME = 'rt';

/**
 * In order to avoid asking for multiple refresh tokens at the same time when it has expired,
 * this singleton holds the http request Promise until a new token is fetched.
 */
let refreshPromise: Promise<void> | null = null;

// https://stackoverflow.com/a/38552302
const parseJwt = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
};

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
      const user: User | null = parseJwt(accessToken) || null;
      if (!user || !user.roles.includes('admin')) {
        const error = new Error('Missing admin role') as AppError;
        error.code = AppErrorCode.FORBIDDEN;
        throw error;
      }

      this.user = user;
      this.accessToken = accessToken || null;
    },
    fetchTokens() {
      if (!refreshPromise) {
        const refreshToken = localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN_NAME);

        refreshPromise = refreshTokens(refreshToken, false)
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
