import HTTP from '../http';
import dayjs from 'dayjs';

export const MONTHLY_MINIMUM_INCOME = 1500 as const;
export const CHARGES_PER_YEAR_IN_EUR = {
  2014: 3_240.73,
  2015: 9_877.77,
  2017: 9_795.03,
  2018: 10_772.51,
  2019: 12_052.23,
  2020: 19_022.58,
  2021: 18_509.5,
  2022: 18_769.51,

  // estimations
  2016: 9_877.77,
  2023:
    1_384.8 * 12 + // rent
    208.35 + // insurance
    60 * 12 + // internet
    700 + // transactions fees
    100 + // bank fees
    2_000, // other
  2024:
    1_645.3 * 12 + // rent
    208.35 + // insurance
    60 * 12 + // internet
    700 + // transactions fees
    100 + // bank fees
    2_000, // other
};

export const INCOME_PER_TICKET = 6 as const;
export const INCOME_PER_SUBSCRIPTION_DAY = 2 as const;

export const getCharges = (date: string, period: 'year' | 'month' | 'week' | 'day'): number => {
  const day = dayjs(date);
  const year = day.year();
  // @ts-ignore
  const yearCharges = CHARGES_PER_YEAR_IN_EUR[year] ?? 0;
  switch (period) {
    case 'year':
      return yearCharges;
    case 'month':
      return yearCharges / 12;
    case 'week':
      return yearCharges / 52;
    case 'day':
      return yearCharges / 12 / day.daysInMonth();
    default:
      throw new Error(`Unknown period ${period}`);
  }
};

export type IncomePeriod<PeriodType extends 'year' | 'month' | 'week' | 'day'> = {
  date: string;
  type: PeriodType;
  data: {
    usedTickets: number; // tickets count consumed
    daysAbo: number; // days count consumed from subscriptions
    incomes: number; // amount in euro
  };
};

export type IncomePeriodWithCharges<PeriodType extends 'year' | 'month' | 'week' | 'day'> =
  IncomePeriod<PeriodType> & {
    data: IncomePeriod<PeriodType>['data'] & {
      charges: number; // regular expenses in euro
    };
  };

export const getIncomesPerYear = (
  from?: string,
  to?: string,
): Promise<IncomePeriodWithCharges<'year'>[]> => {
  return HTTP.get('/stats/incomes/year', {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
  }).then(({ data }) =>
    data.map((income: IncomePeriod<'year'>) => ({
      ...income,
      data: {
        ...income.data,
        charges: getCharges(income.date, 'year'),
      },
    })),
  );
};

export const getIncomesPerMonth = (
  from?: string,
  to?: string,
): Promise<IncomePeriodWithCharges<'month'>[]> => {
  return HTTP.get('/stats/incomes/month', {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
  }).then(({ data }) =>
    data.map((income: IncomePeriod<'month'>) => ({
      ...income,
      data: {
        ...income.data,
        charges: getCharges(income.date, 'month'),
      },
    })),
  );
};

export const getIncomesPerWeek = (
  from?: string,
  to?: string,
): Promise<IncomePeriodWithCharges<'week'>[]> => {
  return HTTP.get('/stats/incomes/week', {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
  }).then(({ data }) =>
    data.map((income: IncomePeriod<'week'>) => ({
      ...income,
      data: {
        ...income.data,
        charges: getCharges(income.date, 'week'),
      },
    })),
  );
};

export const getIncomesPerDay = (
  from?: string,
  to?: string,
): Promise<IncomePeriodWithCharges<'day'>[]> => {
  return HTTP.get('/stats/incomes/day', {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
  }).then(({ data }) =>
    data.map((income: IncomePeriod<'day'>) => ({
      ...income,
      data: {
        ...income.data,
        charges: getCharges(income.date, 'day'),
      },
    })),
  );
};
