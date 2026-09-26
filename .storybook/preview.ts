import '@/styles/main.css';
import 'floating-vue/dist/style.css';
import 'typeface-inter';
import { DEFAULT_LOCALE, i18nInstance } from '@/i18n';
import pinia from '@/store';
import { setup, type Preview } from '@storybook/vue3-vite';
import dayjs from 'dayjs';
import FloatingVue from 'floating-vue';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  loaders: [
    // in the app, messages are lazy-loaded by the settings store
    async () => {
      if (!Object.keys(i18nInstance.global.messages).includes(DEFAULT_LOCALE)) {
        const messages = await import(`@/i18n/locales/${DEFAULT_LOCALE}/index.ts`);
        i18nInstance.global.setLocaleMessage(DEFAULT_LOCALE, messages.default);
      }
      dayjs.locale(DEFAULT_LOCALE.substring(0, 2));
      i18nInstance.global.locale.value = DEFAULT_LOCALE;
      return {};
    },
  ],
};

setup((app) => {
  app.use(pinia);
  app.use(i18nInstance);
  app.use(FloatingVue);
});

export default preview;
