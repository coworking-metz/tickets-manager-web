import { PriceBreakdown } from '@/services/api/stats/income';

const toPriceKey = (price: number) => price.toFixed(2);

/**
 * Shade of the price at the given index, picked in an ordinal ramp
 * (from the cheapest / lightest to the most expensive / darkest), spread over the whole ramp.
 * A single price keeps the category color.
 */
export const getPriceShade = (
  ramp: string[],
  index: number,
  count: number,
  categoryColor: string,
) =>
  count <= 1 || !ramp.length
    ? categoryColor
    : ramp[Math.round((index * (ramp.length - 1)) / (count - 1))];

/**
 * Every price with an amount in at least one of the given breakdowns, sorted by price.
 * Use the same list everywhere (series, tooltip) so a price always gets the same shade.
 */
export const getDistinctPrices = (breakdowns: (PriceBreakdown[] | undefined)[]): number[] => {
  const prices = new Map<string, number>();
  breakdowns.forEach((byPrice) =>
    (byPrice ?? [])
      .filter(({ amount }) => amount > 0)
      .forEach(({ price }) => prices.set(toPriceKey(price), price)),
  );
  return [...prices.values()].sort((a, b) => a - b);
};

export const findPriceBreakdown = (byPrice: PriceBreakdown[] | undefined, price: number) =>
  (byPrice ?? []).find((slice) => toPriceKey(slice.price) === toPriceKey(price));

/**
 * Part of a total which is not explained by its breakdown by price
 * (missing breakdown, orders without quantity, ...).
 */
export const getUnbreakdownAmount = (total: number, byPrice: PriceBreakdown[] | undefined) => {
  const remaining = total - (byPrice ?? []).reduce((sum, { amount }) => sum + amount, 0);
  return remaining > 0.005 ? remaining : 0;
};

/**
 * Stacked bar series of a category, one per price (and one for the unexplained part, if any).
 */
export const buildPriceSeries = <T>({
  name,
  stack,
  color,
  ramp,
  periods,
  getTotal,
  getByPrice,
  disabled,
}: {
  name: string;
  stack: string;
  color: string;
  /** Ordinal ramp of the prices, see getPriceShade() */
  ramp: string[];
  periods: T[];
  getTotal: (period: T) => number;
  getByPrice: (period: T) => PriceBreakdown[] | undefined;
  disabled: boolean;
}) => {
  const prices = getDistinctPrices(periods.map(getByPrice));
  const hasUnbreakdown = periods.some((period) =>
    getUnbreakdownAmount(getTotal(period), getByPrice(period)),
  );

  return [
    ...prices.map((price, index) => ({
      silent: disabled,
      name: `${name}-${toPriceKey(price)}`,
      type: 'bar' as const,
      stack,
      triggerLineEvent: true,
      itemStyle: { color: getPriceShade(ramp, index, prices.length, color) },
      data: periods.map((period) => findPriceBreakdown(getByPrice(period), price)?.amount ?? 0),
    })),
    ...(hasUnbreakdown || !prices.length
      ? [
          {
            silent: disabled,
            name,
            type: 'bar' as const,
            stack,
            triggerLineEvent: true,
            itemStyle: { color },
            data: periods.map((period) =>
              prices.length
                ? getUnbreakdownAmount(getTotal(period), getByPrice(period))
                : getTotal(period),
            ),
          },
        ]
      : []),
  ];
};
