import colors from 'tailwindcss/colors';
import defaultTheme from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'selector',
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/vue-tailwind-datepicker/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'vtd-primary': colors.indigo, // Light mode Datepicker color
        'vtd-secondary': colors.gray, // Dark mode Datepicker color
      },
      screens: {
        xs: '475px',
        '3xl': '1648px',
        '4xl': '1776px',
        '5xl': '1921px', // Full HD + 1 to keep things compact below FullHD
        '6xl': '2560px', // WQHD
      },
    },
  },
} satisfies Config;
