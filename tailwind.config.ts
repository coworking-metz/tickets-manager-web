import defaultTheme from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss';

export default {
  plugins: [require('@tailwindcss/forms')],
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
} satisfies Config;
