import HTTP from '../http';

export const MONTHLY_MINIMUM_INCOME = 1500 as const;
export const INCOME_PER_TICKET = 6 as const;
export const INCOME_PER_SUBSCRIPTION_DAY = 2 as const;

export type IncomePeriod<PeriodType extends 'year' | 'month' | 'week' | 'day'> = {
  date: string;
  type: PeriodType;
  data: {
    usedTickets: number; // tickets count consumed
    daysAbo: number; // days count consumed from subscriptions
    incomes: number; // amount in euro
  };
};

export const getIncomesPerYear = (from?: string, to?: string): Promise<IncomePeriod<'year'>[]> => {
  return HTTP.get('/stats/incomes/year', {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
  }).then(({ data }) => data);
};

export const getIncomesPerMonth = (
  from?: string,
  to?: string,
): Promise<IncomePeriod<'month'>[]> => {
  return HTTP.get('/stats/incomes/month', {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
  }).then(({ data }) => data);
};

export const getIncomesPerWeek = (from?: string, to?: string): Promise<IncomePeriod<'week'>[]> => {
  return HTTP.get('/stats/incomes/week', {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
  }).then(({ data }) => data);
};

export const getIncomesPerDay = (from?: string, to?: string): Promise<IncomePeriod<'day'>[]> => {
  return HTTP.get('/stats/incomes/day', {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
  }).then(({ data }) => data);
};
