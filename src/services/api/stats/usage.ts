import { Frequency } from './frequency';
import { MemberListItem } from '../members';
import { HTTP } from '@/services/http';

export type StatsUsage = {
  tickets: {
    count: number; // tickets count consumed
    amount: number; // amount in euro
    debt: {
      count: number; // tickets count consumed when not paid yet
      amount: number; // debt in euro
    };
  };
  subscriptions: {
    count: number; // subscriptions count
    amount: number; // amount in euro
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
 * Whether a usage has any contribution in at least one of the given categories.
 * An empty list of categories means no filter at all.
 */
export const isUsageInCategories = (usage: StatsUsage, categories: UsageCategory[]): boolean =>
  !categories.length ||
  categories.some((category) => {
    switch (category) {
      case 'tickets':
        return usage.tickets.count > 0;
      case 'debt':
        return (usage.tickets.debt?.count ?? 0) > 0;
      case 'subscriptions':
        return usage.subscriptions.count > 0;
      default:
        return false;
    }
  });

/**
 * Amount of a usage restricted to the given categories.
 * An empty list of categories returns the whole amount.
 */
export const computeUsageAmountInCategories = (
  usage: StatsUsage,
  categories: UsageCategory[],
): number =>
  categories.length
    ? (categories.includes('tickets') ? usage.tickets.amount : 0) +
      (categories.includes('debt') ? (usage.tickets.debt?.amount ?? 0) : 0) +
      (categories.includes('subscriptions') ? usage.subscriptions.amount : 0)
    : usage.amount;
