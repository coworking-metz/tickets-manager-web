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
