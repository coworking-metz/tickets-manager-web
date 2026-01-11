import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';
import colors from 'tailwindcss/colors';
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
            {
              tag: 'style',
              injectTo: 'head',
              children: buildLoadingBackground(),
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

/**
 * Build a spinner to be used as a placeholder
 * until the application is loaded.
 *
 * inspired by:
 * - http://david.ingledow.co.uk/blog/google-material-designs-animated-loading-spinner-svg-and-css/
 * - https://stackoverflow.com/a/41935729
 * - https://stackoverflow.com/a/21626701/15183871
 */
const buildLoadingBackground = () => {
  const spinner = `
    <svg
      fill="none"
      height="4rem"
      width="4rem"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg">
      <style>
        @media (prefers-color-scheme: dark) {
          svg {
            color: #f3f4f6;
          }
        }
      </style>
      <circle style="opacity: 0.25; animation: spin 1s linear infinite;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        style="opacity: 0.75;"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="currentColor" />
    </svg>
  `;

  const spinnerStyle = `
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  `;

  const styledSpinner = spinner.replace(/<svg viewBox=/g, `<svg style="${spinnerStyle}" viewBox=`);

  return `
    @keyframes spin {
      100% {
        transform: rotate(360deg);
      }
    }

    #app:empty {
      position: fixed;
      height: 100%;
      width: 100%;
      background: transparent;
      background-repeat: no-repeat;
      background-position: center center;
      background-image: url("data:image/svg+xml;base64,${Buffer.from(styledSpinner).toString(
        'base64',
      )}");
      animation: spin 1s linear infinite;
    }`;
};
