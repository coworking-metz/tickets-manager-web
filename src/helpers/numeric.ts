import { DEFAULT_LOCALE } from '@/i18n';

export type NumericFormatOptions = Intl.NumberFormatOptions & {
  locale?: string;
};

export const formatNumber = (number: number, options?: NumericFormatOptions): string => {
  return Number(number).toLocaleString(options?.locale ?? DEFAULT_LOCALE, {
    style: 'decimal',
    ...options,
  });
};
