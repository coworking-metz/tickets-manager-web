import App from './App.vue';
import { i18nInstance } from './i18n';
import router from './router';
import { ROUTE_NAMES } from './router/names';
import HTTP from './services/http';
import createHttpInterceptors from './services/interceptors';
import pinia from './store';
import { useAuthStore } from './store/auth';
import { useHttpStore } from './store/http';
import { useNotificationsStore } from './store/notifications';
import { useSettingsStore } from './store/settings';
import SvgIcon from '@jamescoyle/vue-icon';
import { DotLottiePlayer } from '@johanaarstein/dotlottie-player-light';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createHead } from '@unhead/vue';
import { createApp } from 'vue';
import * as VueI18n from 'vue-i18n';
import Vue3Autocounter from 'vue3-autocounter';
import '@/styles/main.css';
import 'typeface-inter';

const app = createApp(App);
const head = createHead();

app.use(pinia);
app.use(router);
app.use(head);
app.use(VueQueryPlugin);
app.component('DotLottiePlayer', DotLottiePlayer);
app.component('AnimatedCounter', Vue3Autocounter);
app.component('SvgIcon', SvgIcon);

createHttpInterceptors(HTTP);

router.beforeEach(async (to, from, next) => {
  const httpStore = useHttpStore();
  const authStore = useAuthStore();
  const notificationsStore = useNotificationsStore();

  // cancel all requests on route name change
  // @see https://stackoverflow.com/questions/51439338/abort-all-axios-requests-when-change-route-use-vue-router
  // don't it on hash change
  if (from.name !== to.name) {
    httpStore.cancelAllRequests('Route has changed');
  }

  const { refreshToken, accessToken, redirect, ...otherQueryParams } = to.query;

  await (async () => {
    // retrieve tokens from query params
    if (accessToken) {
      await authStore.setAccessToken(accessToken as string).catch((error) => {
        notificationsStore.addErrorNotification(error);
        return Promise.reject(error);
      });
    }

    if (refreshToken) {
      authStore.setRefreshToken(refreshToken as string);
    }

    if (!to.meta.allowAnonymous) {
      // fetch an access token if it's not present
      // on fail, redirect to login page
      if (!authStore.accessToken) {
        await authStore.fetchTokens();
      }
    }

    if (redirect && to.name !== ROUTE_NAMES.LOGIN) {
      const targetRoute = router.resolve({ path: redirect as string });
      if (targetRoute) return next({ path: targetRoute.path, query: otherQueryParams });
    }

    next();
  })().catch(() => {
    // When user has invalid session,
    // set redirectPath to allow loging page to redirect user on desired page afterwards
    next({
      name: ROUTE_NAMES.LOGIN,
      query: { ...otherQueryParams, redirect: to.path },
    });
  });
});

app.use(i18nInstance);
useSettingsStore()
  .setLocale(i18nInstance.global.locale.value)
  .finally(() => {
    app.mount('#app');
  });
