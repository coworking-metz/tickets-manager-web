import tailwindcss from '@tailwindcss/vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/vue3-vite',
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          '@': resolve(dirname(fileURLToPath(import.meta.url)), '../src'),
          // work around a Rolldown (Vite 8) dep-optimizer crash when resolving
          // react's conditional exports map for @storybook/addon-docs's internal
          // react-dom-shim (used even in Vue projects) — point straight at the files.
          // @see https://github.com/storybookjs/storybook/issues/33789
          'react-dom/client': resolve(
            dirname(fileURLToPath(import.meta.url)),
            '../node_modules/react-dom/client.js',
          ),
          'react/jsx-runtime': resolve(
            dirname(fileURLToPath(import.meta.url)),
            '../node_modules/react/jsx-runtime.js',
          ),
        },
      },
    });
  },
};
export default config;
