import { Frequency } from './frequency';
import { PriceBreakdown } from './income';
import { MemberListItem } from '../members';
import { HTTP } from '@/services/http';

export type StatsUsage = {
  tickets: {
    count: number; // tickets count consumed
    amount: number; // amount in euro
    byPrice?: PriceBreakdown[]; // tickets consumed grouped by their unit price
    debt: {
      count: number; // tickets count consumed when not paid yet
      amount: number; // debt in euro
    };
  };
  subscriptions: {
    count: number; // subscriptions count
    amount: number; // amount in euro
    byPrice?: PriceBreakdown[]; // subscribed days grouped by their subscription price
    attending: {
      count: number; // attending members count
      amount: number; // amount in euro
    };
  };
  amount: number; // total amount in euro
};

export type MemberListItemWithUsage = MemberListItem & {
  usage: StatsUsage;
};

export type PeriodUsage<Frequency> = {
  date: string;
  type: Frequency;
  data: StatsUsage & {
    charges: number; // regular expenses in euro
    members: MemberListItemWithUsage[];
  };
};

export const getUsagePerFrequency = (
  frequency: Frequency,
  from?: string,
  to?: string,
): Promise<PeriodUsage<Frequency>[]> => {
  return HTTP.get(`/stats/usage/${frequency}`, {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
    timeout: 180_000,
  }).then(({ data }) => data);
};

export const computeActivityFromUsage = (usage: StatsUsage): number =>
  usage.tickets.count + usage.tickets.debt.count + usage.subscriptions.attending.count;

export const WHOLE_PERIOD_SUMMARY_ROUTE_PARAM = 'all';

export type UsageCategory = 'tickets' | 'debt' | 'subscriptions';

/**
 * A filter on a usage category, optionally restricted to a single unit price.
 */
export type UsageFilter = {
  category: UsageCategory;
  price?: number; // unit price in euro, whole category when missing
};

export const isSamePrice = (a: number, b: number) => a.toFixed(2) === b.toFixed(2);

export const isSameUsageFilter = (a: UsageFilter, b: UsageFilter) =>
  a.category === b.category &&
  (a.price === undefined || b.price === undefined
    ? a.price === b.price
    : isSamePrice(a.price, b.price));

/**
 * Prices selected for a category:
 * - `null` when the category is not filtered at all,
 * - an empty list when the whole category is selected,
 * - the selected prices otherwise.
 */
export const getFilteredPrices = (
  filters: UsageFilter[],
  category: UsageCategory,
): number[] | null => {
  const categoryFilters = filters.filter((filter) => filter.category === category);
  if (!categoryFilters.length) return null;
  if (categoryFilters.some((filter) => filter.price === undefined)) return [];
  return categoryFilters.map((filter) => filter.price as number);
};

/**
 * Count and amount of a usage category, restricted to the given prices if any.
 */
export const getUsageCategoryPart = (
  usage: StatsUsage,
  category: UsageCategory,
  prices: number[] = [],
): { count: number; amount: number } => {
  if (category === 'debt') {
    return {
      count: usage.tickets.debt?.count ?? 0,
      amount: usage.tickets.debt?.amount ?? 0,
    };
  }

  const { count, amount, byPrice } = usage[category];
  if (!prices.length) {
    return { count, amount };
  }

  return (byPrice ?? [])
    .filter((slice) => prices.some((price) => isSamePrice(price, slice.price)))
    .reduce(
      (part, slice) => ({ count: part.count + slice.count, amount: part.amount + slice.amount }),
      {
        count: 0,
        amount: 0,
      },
    );
};

/**
 * Toggle a filter:
 * - a whole category (no price) is added, or removed along with its prices,
 * - a price is added or removed (and narrows a whole category selection to it).
 */
export const toggleUsageFilter = (filters: UsageFilter[], filter: UsageFilter): UsageFilter[] => {
  const { category, price } = filter;

  if (price === undefined) {
    return getFilteredPrices(filters, category) !== null
      ? filters.filter((f) => f.category !== category)
      : [...filters, { category }];
  }

  const otherFilters = filters.filter(
    (f) => !isSameUsageFilter(f, { category }) && !isSameUsageFilter(f, filter),
  );
  return filters.some((f) => isSameUsageFilter(f, filter))
    ? otherFilters
    : [...otherFilters, filter];
};

/**
 * Whether a category (or one of its prices) is part of the filtered data.
 * Everything is active when there is no filter.
 */
export const isUsageFilterActive = (
  filters: UsageFilter[],
  category: UsageCategory,
  price?: number,
): boolean => {
  if (!filters.length) return true;
  const prices = getFilteredPrices(filters, category);
  if (prices === null) return false;
  if (price === undefined || !prices.length) return true;
  return prices.some((p) => isSamePrice(p, price));
};

/**
 * Whether a category (or one of its prices) is explicitly selected, not only the parent of a selected price:
 * a whole category highlights itself and its prices, a price only highlights itself.
 */
export const isUsageFilterSelected = (
  filters: UsageFilter[],
  category: UsageCategory,
  price?: number,
): boolean => {
  const prices = getFilteredPrices(filters, category);
  if (prices === null) return false;
  if (!prices.length) return true;
  return price !== undefined && prices.some((p) => isSamePrice(p, price));
};

const ALL_USAGE_CATEGORIES: UsageCategory[] = ['tickets', 'debt', 'subscriptions'];

/**
 * Whether a usage has any contribution matching at least one of the given filters.
 * An empty list of filters means no filter at all.
 */
export const isUsageInFilters = (usage: StatsUsage, filters: UsageFilter[]): boolean =>
  !filters.length ||
  ALL_USAGE_CATEGORIES.some((category) => {
    const prices = getFilteredPrices(filters, category);
    return prices !== null && getUsageCategoryPart(usage, category, prices).count > 0;
  });

/**
 * Amount of a usage restricted to the given filters.
 * An empty list of filters returns the whole amount.
 */
export const computeUsageAmountInFilters = (usage: StatsUsage, filters: UsageFilter[]): number =>
  filters.length
    ? ALL_USAGE_CATEGORIES.reduce((sum, category) => {
        const prices = getFilteredPrices(filters, category);
        return prices === null ? sum : sum + getUsageCategoryPart(usage, category, prices).amount;
      }, 0)
    : usage.amount;

/**
 * Merge two breakdowns by price into a new one, sorted by price.
 */
export const mergePriceBreakdowns = (
  a: PriceBreakdown[] = [],
  b: PriceBreakdown[] = [],
): PriceBreakdown[] => {
  const byPrice = new Map<string, PriceBreakdown>();
  [...a, ...b].forEach(({ price, count, amount }) => {
    const key = price.toFixed(2);
    const existing = byPrice.get(key);
    byPrice.set(key, {
      price,
      count: (existing?.count ?? 0) + count,
      amount: (existing?.amount ?? 0) + amount,
    });
  });
  return [...byPrice.values()].sort((x, y) => x.price - y.price);
};
