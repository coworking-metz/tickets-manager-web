import { version } from '../../package.json';
import * as Sentry from '@sentry/vue';
import { App } from 'vue';
import { Router } from 'vue-router';

const initSentry = (app: App, router: Router) => {
  Sentry.init({
    app,
    dsn: import.meta.env.VUE_APP_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration({ router })],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
  Sentry.setContext('app', {
    version,
  });
};

export default initSentry;
