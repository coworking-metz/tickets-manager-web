import App from './App.vue';
import { i18nInstance } from './i18n/i18n.js';
import { ROUTE_NAMES } from './router/names.js';
import router from './router/routes.js';
import HTTP from './services/http.js';
import createHttpInterceptors from './services/interceptors.js';
import { useAuthStore } from './store/auth.js';
import { useHttpStore } from './store/http.js';
import pinia from './store/pinia.js';
import { createApp } from 'vue';

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(i18nInstance);

createHttpInterceptors(HTTP);

router.beforeEach(async (to, from, next) => {
  const httpStore = useHttpStore();
  const authStore = useAuthStore();
  // cancel all requests on route name change
  // @see https://stackoverflow.com/questions/51439338/abort-all-axios-requests-when-change-route-use-vue-router
  // don't it on hash change
  if (from.name !== to.name) {
    httpStore.cancelAllRequests('Route has changed');
  }

  if (!to.matched.some((route) => route.meta.allowAnonymous)) {
    // fetch an access token if it's not present
    // on fail, redirect to login page
    if (!authStore.accessToken) {
      return authStore
        .fetchTokens()
        .then(() => next())
        .catch(() => {
          // When user has invalid session,
          // set redirectPath to allow loging page to redirect user on desired page afterwards
          next({
            name: ROUTE_NAMES.LOGIN,
            query: { ...to.query, redirect: to.path },
          });
        });
    }
  }

  return next();
});

app.mount('#app');
