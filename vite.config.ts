import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
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
  ],
  assetsInclude: ['**/*.lottie'],
  resolve: {
    alias: {
      '@': resolve(dirname(fileURLToPath(import.meta.url)), './src'),
    },
    extensions: ['.json', '.ts', '.vue'],
  },
});
