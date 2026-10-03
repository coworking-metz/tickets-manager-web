import { Frequency } from './frequency';
import { MemberListItem } from '../members';
import { HTTP } from '@/services/http';

export type PriceBreakdown = {
  price: number; // unit price in euro
  count: number; // count sold at this price
  amount: number; // amount in euro
};

export type StatsIncome = {
  tickets: {
    count: number; // tickets count sold
    amount: number; // amount in euro
  };
  subscriptions: {
    count: number; // subscriptions count sold
    amount: number; // amount in euro
  };
  memberships: {
    count: number; // memberships count sold
    amount: number; // amount in euro
  };
  amount: number; // total amount in euro
};

export type MemberListItemWithIncome = MemberListItem & {
  income: StatsIncome;
};

export type ChargeLabel =
  | 'poulaillerRent'
  | 'ptiPoulaillerRent'
  | 'insurance'
  | 'internet'
  | 'transactionFees'
  | 'bankFees'
  | 'other';

export type ChargeBreakdown = {
  label: ChargeLabel;
  amount: number; // amount in euro
};

export type IncomePeriod<Frequency> = {
  date: string;
  type: Frequency;
  data: {
    charges: number; // regular expenses in euro
    chargesBreakdown: ChargeBreakdown[];
    income: number; // total income in euro
    tickets: StatsIncome['tickets'] & { byPrice: PriceBreakdown[] };
    subscriptions: StatsIncome['subscriptions'] & { byPrice: PriceBreakdown[] };
    memberships: StatsIncome['memberships'];
    members: MemberListItemWithIncome[];
  };
};

export const getIncomePerPeriod = (
  period: Frequency,
  from?: string,
  to?: string,
): Promise<IncomePeriod<Frequency>[]> => {
  return HTTP.get(`/stats/income/${period}`, {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
    timeout: 60_000,
  }).then(({ data }) => data);
};

export const WHOLE_PERIOD_SUMMARY_ROUTE_PARAM = 'all';
