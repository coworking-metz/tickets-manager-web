import vueI18n from '@intlify/eslint-plugin-vue-i18n';
import vuePrettierConfig from '@vue/eslint-config-prettier';
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import eslintConfigPrettier from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importX from 'eslint-plugin-import-x';
import jsonc from 'eslint-plugin-jsonc';
import prettierPlugin from 'eslint-plugin-prettier';
import tailwindcss from 'eslint-plugin-tailwindcss';
import pluginVue from 'eslint-plugin-vue';
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility';
import globals from 'globals';
import { fileURLToPath } from 'node:url';

// @see https://github.com/eslint/eslint/issues/2309#issuecomment-286649686
const isTruthy = (value) => {
  if (!value) return false;
  return ['1', 'true'].indexOf(value.toLowerCase()) >= 0;
};

// Warnings are errors in CI
const OFF = 'off';
const ERROR = 'error';
const WARNING = isTruthy(process.env.CI) ? ERROR : 'warn';

const tsconfigPath = fileURLToPath(new URL('./tsconfig.json', import.meta.url));
const srcPath = fileURLToPath(new URL('./src', import.meta.url));
const localeDir = fileURLToPath(
  new URL('./src/i18n/locales/**/*.{json,json5,yaml,yml}', import.meta.url),
);

export default withVueTs(
  {
    ignores: ['**/*.scss', 'node_modules', 'build', 'dist'],
  },
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  pluginVue.configs['flat/recommended'],
  vuejsAccessibility.configs['flat/recommended'],
  vueTsConfigs.base,
  vueTsConfigs.eslintRecommended,
  vueI18n.configs['flat/recommended'],
  tailwindcss.configs.recommended,
  vuePrettierConfig,
  eslintConfigPrettier,
  {
    plugins: {
      'import-x': importX,
      prettier: prettierPlugin,
    },
    settings: {
      'vue-i18n': {
        localeDir,
        // Specify the version of `vue-i18n` you are using.
        // If not specified, the message will be parsed twice.
        messageSyntaxVersion: '^9.0.0',
      },
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: [tsconfigPath],
          // unrs-resolver fails to resolve tsconfig `paths` when `baseUrl` is relative,
          // so the `@/*` alias is also declared explicitly here
          alias: { '@': [srcPath] },
        }),
      ],
      tailwindcss: {
        cssConfigPath: fileURLToPath(new URL('./src/styles/main.css', import.meta.url)),
      },
    },
    rules: {
      // TODO: fix the accessibility issues these rules report across the app, then remove this
      // override so they go back to their "error" severity from eslint-plugin-vuejs-accessibility's
      // recommended config (this plugin was previously registered but never actually enabled).
      ...Object.fromEntries(
        Object.keys(vuejsAccessibility.rules).map((rule) => [
          `vuejs-accessibility/${rule}`,
          'warn',
        ]),
      ),
      'import-x/prefer-default-export': OFF,
      '@intlify/vue-i18n/no-raw-text': [ERROR],
      // as long as the project doesn't support split namespaces structure
      // https://github.com/intlify/eslint-plugin-vue-i18n/issues/331
      '@intlify/vue-i18n/no-missing-keys': OFF,
      'vue/block-order': [
        ERROR,
        {
          order: ['docs', 'template', 'script:not([setup])', 'script[setup]', 'style'],
        },
      ],
      'vue/attributes-order': [
        ERROR,
        {
          order: [
            ['LIST_RENDERING', 'CONDITIONALS', 'RENDER_MODIFIERS'],
            ['DEFINITION', 'GLOBAL', 'UNIQUE'],
            'TWO_WAY_BINDING',
            'OTHER_DIRECTIVES',
            'OTHER_ATTR',
            'EVENTS',
            'CONTENT',
          ],
          alphabetical: true,
        },
      ],
      'vue/component-api-style': [ERROR, ['script-setup', 'composition']],
      'vue/block-tag-newline': ERROR,
      'vue/block-lang': [
        ERROR,
        {
          script: {
            lang: 'ts',
          },
        },
      ],
      'no-console': [WARNING, { allow: ['warn', 'error', 'info'] }],
      'no-debugger': WARNING,
      'no-shadow': OFF,
      // @see https://stackoverflow.com/a/63767419/15183871
      'no-unused-vars': OFF,
      '@typescript-eslint/no-unused-vars': OFF,
      'prettier/prettier': [
        ERROR,
        {
          endOfLine: 'auto',
          arrowParens: 'always',
          bracketSameLine: true,
          htmlWhitespaceSensitivity: 'ignore',
          printWidth: 100,
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'all',
        },
      ],
      'import-x/order': [
        ERROR,
        {
          alphabetize: {
            order: 'asc',
          },
          groups: [
            'index',
            'sibling',
            'parent',
            'internal',
            'external',
            'builtin',
            'object',
            'type',
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.vue'],
    rules: {
      'tailwindcss/no-custom-classname': [
        WARNING,
        {
          whitelist: ['(app\\-).*'],
        },
      ],
    },
  },
  ...jsonc.configs['flat/recommended-with-json'].map((config) => ({
    ...config,
    files: ['**/*.json'],
  })),
  {
    files: ['**/*.json'],
    rules: {
      'jsonc/sort-keys': [
        ERROR,
        {
          pathPattern: '.*', // Hits the all properties
          order: { type: 'asc' },
        },
      ],
    },
  },
  {
    files: ['package.json'],
    rules: {
      'jsonc/sort-keys': [
        ERROR,
        {
          pathPattern: '^(?:dev|peer|optional|bundled)?[Dd]ependencies|scripts$',
          order: { type: 'asc' },
        },
      ],
    },
  },
);
