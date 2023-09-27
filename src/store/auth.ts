import { useHttpStore } from './http';
import { User, getProfile, login, logout, refreshToken } from '@/services/api/auth';
import { defineStore } from 'pinia';

/**
 * In order to avoid asking for multiple refresh tokens at the same time when it has expired,
 * this singleton holds the http request Promise until a new token is fetched.
 */
let refreshPromise: Promise<User> | null = null;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    user: null as User | null,
  }),
  actions: {
    fetchTokens() {
      if (!refreshPromise) {
        refreshPromise = refreshToken(false)
          .then((tokens) => {
            this.accessToken = tokens.access_token;
            return getProfile();
          })
          .finally(() => {
            refreshPromise = null;
          });
      }
      return refreshPromise;
    },
    login() {
      return login();
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
