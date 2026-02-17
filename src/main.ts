import '@/styles/main.css';
import 'floating-vue/dist/style.css';
import 'typeface-inter';
import App from './App.vue';
import { AppError, AppErrorCode } from './helpers/errors';
import { i18nInstance } from './i18n';
import router from './router';
import { ROUTE_NAMES } from './router/names';
import { HTTP } from './services/http';
import createHttpInterceptors from './services/interceptors';
import { defaultVueQueryPluginOptions } from './services/query';
import pinia from './store';
import { useAuthStore } from './store/auth';
import { useHttpStore } from './store/http';
import { useNotificationsStore } from './store/notifications';
import { useSettingsStore } from './store/settings';
import SvgIcon from '@jamescoyle/vue-icon';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createHead } from '@unhead/vue/client';
import FloatingVue from 'floating-vue';
import { includes } from 'lodash';
import { createApp } from 'vue';
import VueNumberAnimation from 'vue-number-animation';

const app = createApp(App);
const head = createHead();

app.use(pinia);
app.use(router);
app.use(head);
app.use(VueQueryPlugin, defaultVueQueryPluginOptions);
app.use(FloatingVue);
app.component('AnimatedCounter', VueNumberAnimation);
app.component('SvgIcon', SvgIcon);

createHttpInterceptors(HTTP);

const httpStore = useHttpStore();
const authStore = useAuthStore();
const notificationStore = useNotificationsStore();

router.beforeEach(async (to, from, next) => {
  // cancel all requests on route name change
  // @see https://stackoverflow.com/questions/51439338/abort-all-axios-requests-when-change-route-use-vue-router
  // do not on hash change
  if (from.name !== to.name) {
    httpStore.cancelAllRequests('Route has changed');
  }

  const { refreshToken, accessToken, redirect, ...otherQueryParams } = to.query;

  await (async () => {
    // retrieve tokens from query params
    if (accessToken) {
      await authStore.setAccessToken(accessToken as string);
    }

    if (refreshToken) {
      authStore.refreshToken = refreshToken as string;
    }

    if (!to.meta.allowAnonymous) {
      // fetch an access token if it's not present
      // on fail, redirect to login page
      if (!authStore.accessToken && authStore.refreshToken) {
        await authStore.fetchTokens();
      }

      if (!authStore.user) {
        return next({
          name: ROUTE_NAMES.LOGIN,
          query: { ...otherQueryParams, redirect: to.path },
        });
      }

      if (!includes(authStore.user.roles, 'admin')) {
        const error = new Error('Missing admin role') as AppError;
        error.code = AppErrorCode.FORBIDDEN;
        throw error;
      }
    }

    if (redirect && to.name !== ROUTE_NAMES.LOGIN) {
      const targetRoute = router.resolve({ path: redirect as string });
      if (targetRoute) return next({ path: targetRoute.path, query: otherQueryParams });
    }

    next();
  })().catch(async (error) => {
    // When user has invalid session,
    // set redirectPath to allow loging page to redirect user on desired page afterwards
    next({
      name: ROUTE_NAMES.LOGIN,
      query: { ...otherQueryParams, redirect: to.path },
    });

    setTimeout(() => notificationStore.addErrorNotification(error), 300);
  });
});

app.use(i18nInstance);
useSettingsStore()
  .setLocale(i18nInstance.global.locale.value)
  .finally(() => {
    app.mount('#app');
  });
