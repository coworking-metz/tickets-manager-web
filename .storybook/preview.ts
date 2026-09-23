import '@/styles/main.css';
import 'floating-vue/dist/style.css';
import 'typeface-inter';
import { i18nInstance } from '@/i18n';
import FloatingVue from 'floating-vue';
import type { Preview } from '@storybook/vue3-vite';

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
  setup(app) {
    app.use(i18nInstance);
    app.use(FloatingVue);
  },
};

export default preview;
