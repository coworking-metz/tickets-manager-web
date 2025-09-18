import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';
import colors from 'tailwindcss/colors';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
export default ({ mode }: { mode: string }) => {
  process.env.MODE = mode; // to access it in tailwind.config.ts
  return {
    envDir: resolve(dirname(fileURLToPath(import.meta.url)), './src/config'),
    envPrefix: 'VUE_',
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ['dotlottie-player'].includes(tag),
          },
        },
      }),
      // https://vue-i18n.intlify.dev/guide/advanced/optimization.html
      VueI18nPlugin({
        runtimeOnly: false, // https://stackoverflow.com/a/73857056
      }),
      {
        name: 'html-transform',
        transformIndexHtml() {
          return [
            {
              tag: 'base',
              attrs: { href: process.env.BASE_URL || '/' },
              injectTo: 'head-prepend',
            },
            mode !== 'production' && {
              tag: 'link',
              attrs: {
                rel: 'icon',
                type: 'image/svg+xml',
                // https://stackoverflow.com/a/71013173/15183871
                href: `data:image/svg+xml,${transformEnvironmentFavicon(mode)}`,
              },
              injectTo: 'head',
            },
          ].filter(Boolean);
        },
      },
    ],
    assetsInclude: ['**/*.lottie'],
    resolve: {
      alias: {
        '@': resolve(dirname(fileURLToPath(import.meta.url)), './src'),
      },
      extensions: ['.json', '.ts', '.vue'],
    },
    server: {
      host: '0.0.0.0',
    },
  };
};

/**
 * Transform the favicon svg
 * to add the first letter of the environment.
 * This should not occur in production.
 *
 * @param environment
 * @returns string
 */
const transformEnvironmentFavicon = (environment?: string): string => {
  const faviconContent = readFileSync(
    fileURLToPath(new URL('./src/assets/favicon.svg', import.meta.url)),
    'utf-8',
  );
  const initial = ((environment === 'development' ? 'local' : environment) || '')
    .slice(0, 1)
    .toUpperCase();
  const initialCircle = `
      <circle cx="23" cy="23" r="9" fill="${colors.indigo['500']}"></circle>
      <text x="19" y="28" fill="#FFFFFF">${initial}</text>
    `;

  // https://yoksel.github.io/url-encoder/
  return encodeURIComponent(faviconContent.replace(/<\/svg>/g, `${initialCircle}</svg>`));
};
