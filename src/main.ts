import App from './App.vue';
import { i18nInstance } from './i18n';
import router from './router';
import { ROUTE_NAMES } from './router/names';
import HTTP from './services/http';
import createHttpInterceptors from './services/interceptors';
import pinia from './store';
import { useAuthStore } from './store/auth';
import { useHttpStore } from './store/http';
import { DotLottiePlayer } from '@johanaarstein/dotlottie-player-light';
import { createHead } from '@unhead/vue';
import { createApp } from 'vue';
import Vue3Autocounter from 'vue3-autocounter';
import '@/styles/main.css';
import 'typeface-inter';

const app = createApp(App);
const head = createHead();

app.use(pinia);
app.use(router);
app.use(i18nInstance);
app.use(head);
app.component('DotLottiePlayer', DotLottiePlayer);
app.component('AnimatedCounter', Vue3Autocounter);

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

  // retrieve tokens from query params
  if (to.query.refreshToken) {
    authStore.setRefreshToken(to.query.refreshToken as string);
  }

  if (to.query.accessToken) {
    authStore.setAccessToken(to.query.accessToken as string);
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
