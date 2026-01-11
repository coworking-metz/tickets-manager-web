import { Frequency } from './frequency';
import { HTTP } from '@/services/http';

export type IncomePeriod<Frequency> = {
  date: string;
  type: Frequency;
  data: {
    charges: number; // regular expenses in euro
    income: number; // total income in euro
    tickets: {
      count: number; // tickets count consumed
      amount: number; // amount in euro
    };
    subscriptions: {
      count: number; // subscriptions count
      amount: number; // amount in euro
    };
    memberships: {
      count: number; // memberships count
      amount: number; // amount in euro
    };
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
