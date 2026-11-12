import { findPriceBreakdown, getPriceShade } from './priceBreakdown';
import { PriceBreakdown } from '@/services/api/stats/income';

export interface StatsTooltipRow {
  /** Any CSS background: a color, or a pattern (e.g. the hatched debt) */
  color: string;
  label: string;
  sublabel?: string;
  amount: string;
  /** Displayed with a lighter text, for amounts not counted in the total */
  muted?: boolean;
  children?: StatsTooltipRow[];
  /** Payload emitted when the row is clicked (in an interactive summary) */
  data?: unknown;
  /** Highlighted as part of the current selection */
  selected?: boolean;
  /** Faded as excluded from the current selection */
  dimmed?: boolean;
}

/**
 * Rows of a breakdown by price, colored like the bar chart series of these prices.
 * Empty when there is a single price: the breakdown would only repeat the total.
 *
 * @param prices Every price displayed in the chart (see getDistinctPrices()), to get matching shades.
 */
export const buildPriceRows = ({
  byPrice,
  prices,
  color,
  ramp,
  formatLabel,
  formatAmount,
}: {
  byPrice: PriceBreakdown[] | undefined;
  prices: number[];
  color: string;
  /** Ordinal ramp of the prices, see getPriceShade() */
  ramp: string[];
  formatLabel: (slice: PriceBreakdown) => string;
  formatAmount: (amount: number) => string;
}): StatsTooltipRow[] => {
  const rows = prices.flatMap((price, index) => {
    const slice = findPriceBreakdown(byPrice, price);
    return slice && slice.amount > 0
      ? [
          {
            color: getPriceShade(ramp, index, prices.length, color),
            label: formatLabel(slice),
            amount: formatAmount(slice.amount),
            data: slice.price,
          },
        ]
      : [];
  });

  return rows.length > 1 ? rows : [];
};
