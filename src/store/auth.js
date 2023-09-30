import { useHttpStore } from './http.js';
import { defineStore } from 'pinia';
import { logout, refreshToken } from '@/services/api/auth.js';

/**
 * In order to avoid asking for multiple refresh tokens at the same time when it has expired,
 * this singleton holds the http request Promise until a new token is fetched.
 */
let refreshPromise = null;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    user: null,
  }),
  actions: {
    fetchTokens() {
      if (!refreshPromise) {
        refreshPromise = refreshToken(false)
          .then(({ access_token, user }) => {
            this.accessToken = access_token;
            this.user = user;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }
      return refreshPromise;
    },
    logout() {
      this.accessToken = null;
      this.user = null;
      // TODO: clear other resources in other stores (settings, history, etc.)
      return logout().finally(() => {
        // whatever happens, everything should be reset at the end
        // even if the user has cancelled the logout
        const http = useHttpStore();
        http.cancelAllRequests();
        http.$reset();
      });
    },
  },
});