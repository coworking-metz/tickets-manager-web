import defaultTheme from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss';

export default {
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      screens: {
        xs: '475px',
        '3xl': '1648px',
        '4xl': '1776px',
        '5xl': '1921px', // Full HD + 1 to keep things compact below FullHD
        '6xl': '2560px', // WQHD,
      },
    },
  },
} satisfies Config;
