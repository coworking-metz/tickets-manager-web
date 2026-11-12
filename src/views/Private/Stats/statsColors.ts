import { useTheme } from '@/services/theme';
import { theme } from '@/styles/colors';
import { computed } from 'vue';

const DEBT_HATCH_COLOR = '#2563eb99'; // blue-600, translucent

/**
 * ECharts decal (pattern) of the debt: diagonal hatching.
 * @see https://echarts.apache.org/en/option.html#series-bar.itemStyle.decal
 */
const DEBT_DECAL = {
  symbol: 'rect',
  symbolSize: 1,
  color: DEBT_HATCH_COLOR,
  dashArrayX: [1, 0],
  dashArrayY: [2, 4],
  rotation: -Math.PI / 4,
};

export const useStatsColors = () => {
  const currentTheme = useTheme();

  return computed(() => ({
    // Palettes validated with the dataviz skill (validate_palette.js) on light and dark surfaces
    subscription:
      currentTheme.value === 'dark'
        ? '#eab308' // yellow-500
        : '#ca8a04', // yellow-600
    ticket:
      currentTheme.value === 'dark'
        ? '#3b82f6' // blue-500
        : '#2563eb', // blue-600
    // A lighter blue (debt of tickets), always drawn with DEBT_DECAL / debtPattern so it
    // cannot be mistaken for the cheapest tickets price of the ramp below
    debt:
      currentTheme.value === 'dark'
        ? '#dbeafe' // blue-100
        : '#bfdbfe', // blue-200
    /**
     * Ordinal ramps for prices, from the cheapest (lightest) to the most expensive (darkest),
     * validated with validate_palette.js --ordinal against each surface.
     */
    ticketPrices:
      currentTheme.value === 'dark'
        ? ['#bfdbfe', '#93c5fd', '#60a5fa', '#2563eb']
        : ['#60a5fa', '#3b82f6', '#1d4ed8', '#1e3a8a'],
    subscriptionPrices:
      currentTheme.value === 'dark'
        ? ['#fef9c3', '#fde047', '#eab308', '#a16207']
        : ['#ca8a04', '#a16207', '#854d0e', '#5c3a0a'],
    // Hatching of the debt, as a CSS background (legend dots) and as an ECharts decal (charts)
    debtPattern: `repeating-linear-gradient(-45deg, ${DEBT_HATCH_COLOR} 0 1.5px, ${
      currentTheme.value === 'dark' ? '#dbeafe' : '#bfdbfe'
    } 1.5px 4px)`,
    debtDecal: DEBT_DECAL,
    charges: currentTheme.value === 'dark' ? '#78716c' : theme.charlestonGreen,

    subscriptionOrder:
      currentTheme.value === 'dark'
        ? '#eab308' // yellow-500
        : '#ca8a04', // yellow-600
    ticketOrder:
      currentTheme.value === 'dark'
        ? '#3b82f6' // sky-500
        : '#93c5fd', // sky-300
    membershipOrder: '#14b8a6', // teal-500

    member:
      currentTheme.value === 'dark'
        ? '#4338ca' // indigo-700
        : '#6366f1', // indigo-500
    newMember:
      currentTheme.value === 'dark'
        ? '#a78bfa' // indigo-400
        : '#a5b4fc', // indigo-300'
    activity: '#10b981', // emerald-500
  }));
};

const DARK_TEXT_COLOR = '#111827'; // gray-900
const LIGHT_TEXT_COLOR = '#ffffff';

/**
 * Relative luminance of a hex color (#RRGGBB), see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
const getLuminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.040_45 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getContrastRatio = (a: string, b: string) => {
  const [lighter, darker] = [getLuminance(a), getLuminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Text color (dark or white) with the best contrast on the given background color (#RRGGBB).
 */
export const getReadableTextColor = (backgroundColor: string) =>
  getContrastRatio(backgroundColor, DARK_TEXT_COLOR) >=
  getContrastRatio(backgroundColor, LIGHT_TEXT_COLOR)
    ? DARK_TEXT_COLOR
    : LIGHT_TEXT_COLOR;
