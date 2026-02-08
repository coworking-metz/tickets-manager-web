import { DEFAULT_LOCALE } from '@/i18n';

export const DEFAULT_CURRENCY = 'EUR';

export const formatAmount = (
  amount: number,
  options?: Intl.NumberFormatOptions,
  locale: string = DEFAULT_LOCALE,
) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    ...options,
  }).format(amount);
};

// https://stackoverflow.com/a/62688921/15183871
export const fractionAmount = (
  amount: number,
  options?: Intl.NumberFormatOptions,
  ...args: string[]
): string => {
  const shouldFraction = Boolean(amount % 1);
  const decimals = shouldFraction ? 2 : 0;
  return formatAmount(
    amount,
    {
      ...options,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    },
    ...args,
  );
};

export const fractionNumber = (
  value: number,
  locale: string = DEFAULT_LOCALE,
  options?: Intl.NumberFormatOptions,
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    ...options,
  }).format(value);
};

export const fractionPercentage = (
  value: number,
  locale: string = DEFAULT_LOCALE,
  options?: Intl.NumberFormatOptions,
): string => {
  const shouldFraction = Boolean(value % 1);
  const decimals = shouldFraction ? 2 : 0;
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    ...options,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const getCurrencySymbol = (
  locale: string = DEFAULT_LOCALE,
  currency: string = DEFAULT_CURRENCY,
): string => {
  return (
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    })
      .formatToParts(1)
      .find((x) => x.type === 'currency')?.value || ''
  );
};
