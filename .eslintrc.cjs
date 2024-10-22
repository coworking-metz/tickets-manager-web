const path = require('path');
// @see https://github.com/eslint/eslint/issues/2309#issuecomment-286649686
const isTruthy = (value) => {
  if (!value) return false;
  return ['1', 'true'].indexOf(value.toLowerCase()) >= 0;
};

// Warnings are errors in CI
const OFF = 'off';
const ERROR = 'error';
const WARNING = isTruthy(process.env.CI) ? ERROR : 'warn';

module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
  },
  plugins: [
    'vue',
    'vuejs-accessibility',
    '@typescript-eslint', // @see https://stackoverflow.com/a/66525357/15183871
    'import',
    'prettier',
  ],
  extends: [
    'plugin:@intlify/vue-i18n/recommended',
    '@vue/eslint-config-prettier',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:vue/vue3-recommended',
    'plugin:tailwindcss/recommended',
    'eslint-config-prettier', // to turn off all Prettier rules that might conflict
    'plugin:prettier/recommended',
    'prettier',
  ],
  rules: {
    'import/prefer-default-export': OFF,
    '@intlify/vue-i18n/no-raw-text': [ERROR],
    // as long as the project doesn't support split namespaces structure
    // https://github.com/intlify/eslint-plugin-vue-i18n/issues/331
    '@intlify/vue-i18n/no-missing-keys': OFF,
    'vue/component-tags-order': [
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
    'import/order': [
      ERROR,
      {
        alphabetize: {
          order: 'asc',
        },
        groups: ['index', 'sibling', 'parent', 'internal', 'external', 'builtin', 'object', 'type'],
      },
    ],
    'tailwindcss/no-custom-classname': [
      WARNING,
      {
        whitelist: ['(app\\-).*'],
      },
    ],
  },
  overrides: [
    {
      files: ['*.vue', '*.ts'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: require.resolve('@typescript-eslint/parser'),
        extraFileExtensions: ['.vue'],
        ecmaFeatures: {
          jsx: true,
          noImplicitAny: false,
        },
      },
    },
    {
      files: ['*.json'],
      parser: 'jsonc-eslint-parser',
      extends: ['plugin:jsonc/recommended-with-json'],
      rules: {
        'jsonc/sort-keys': [
          'error',
          {
            pathPattern: '.*', // Hits the all properties
            order: { type: 'asc' },
          },
        ],
      },
    },
    {
      files: ['package.json'],
      parser: 'jsonc-eslint-parser',
      extends: ['plugin:jsonc/recommended-with-json'],
      rules: {
        'jsonc/sort-keys': [
          'error',
          {
            pathPattern: '^(?:dev|peer|optional|bundled)?[Dd]ependencies|scripts$',
            order: { type: 'asc' },
          },
        ],
      },
    },
  ],
  settings: {
    'vue-i18n': {
      localeDir: `${path.resolve(__dirname, 'src/locales/**/*.{json,json5,yaml,yml}')}`,
      // Specify the version of `vue-i18n` you are using.
      // If not specified, the message will be parsed twice.
      messageSyntaxVersion: '^9.0.0',
    },
    'import/resolver': {
      typescript: {
        // @see https://stackoverflow.com/a/71699452/15183871
        project: [`${path.resolve(__dirname, 'tsconfig.json')}`],
      },
    },
  },
  ignorePatterns: ['**/*.scss', 'node_modules', 'build', 'dist', 'yarn.lock'],
};
