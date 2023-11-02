import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';
import { PrimeVueResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
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
    vue(),
    // https://vue-i18n.intlify.dev/guide/advanced/optimization.html
    VueI18nPlugin({}),
    Components({
      dts: true,
      resolvers: [
        PrimeVueResolver({
          prefix: 'P',
          // importTheme: 'soho-light',
        }),
      ],
    }),
    viteStaticCopy({
      targets: [
        {
          src:
            resolve(
              dirname(fileURLToPath(import.meta.url)),
              './node_modules/primevue/resources/themes',
            ) + '/soho-[!.]*', // 1️⃣
          dest: './prime-vue-assets', // 2️⃣
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(dirname(fileURLToPath(import.meta.url)), './src'),
    },
    extensions: ['.json', '.ts', '.vue'],
  },
});
