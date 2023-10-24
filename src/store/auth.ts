import { useHttpStore } from './http';
import { User, refreshTokens } from '@/services/api/auth';
import { defineStore } from 'pinia';

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
      localStorage.setItem('rt', refreshToken);
    },
    fetchTokens() {
      if (!refreshPromise) {
        refreshPromise = refreshTokens(false)
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
      localStorage.clear();
      // TODO: clear other resources in other stores (settings, history, etc.)
      // return logout().finally(() => {
      // whatever happens, everything should be reset at the end
      // even if the user has cancelled the logout
      const http = useHttpStore();
      http.cancelAllRequests();
      http.$reset();
      // });
    },
  },
});
