import { useHttpStore } from './http';
import { AppError, AppErrorCode } from '@/helpers/errors';
import { User, decodeToken, refreshTokens } from '@/services/api/auth';
import { useSessionStorage } from '@vueuse/core';
import dayjs from 'dayjs';
import { includes } from 'lodash';
import { defineStore } from 'pinia';

const LOCAL_STORAGE_REFRESH_TOKEN_NAME = 'rt';
const SESSION_STORAGE_ACCESS_TOKEN_NAME = 'at';

/**
 * In order to avoid asking for multiple refresh tokens at the same time when it has expired,
 * this singleton holds the http request Promise until a new token is fetched.
 */
let refreshPromise: Promise<void> | null = null;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: useSessionStorage(SESSION_STORAGE_ACCESS_TOKEN_NAME, null as string | null),
  }),
  getters: {
    user: (state) => (state.accessToken ? decodeToken(state.accessToken) : null) as User | null,
  },
  actions: {
    setRefreshToken(refreshToken: string) {
      localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_NAME, refreshToken);
    },
    getRefreshToken() {
      return localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN_NAME);
    },
    async setAccessToken(accessToken: string) {
      this.accessToken = accessToken || null;

      if (!this.user || !includes(this.user.roles, 'admin')) {
        const error = new Error('Missing admin role') as AppError;
        error.code = AppErrorCode.FORBIDDEN;
        throw error;
      }
    },
    async getOrRefreshAccessToken() {
      if (this.user) {
        const { exp } = this.user;
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
