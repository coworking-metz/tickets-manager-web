import HTTP from '../http';

export type IncomePeriod<PeriodType extends 'year' | 'month' | 'week' | 'day'> = {
  date: string;
  type: PeriodType;
  data: {
    charges: number; // regular expenses in euro
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
      attending: number; // when the member was attending
    };
  };
};

export type IncomePeriodWithTotal<PeriodType extends 'year' | 'month' | 'week' | 'day'> =
  IncomePeriod<PeriodType> & {
    data: IncomePeriod<PeriodType>['data'] & {
      incomes: number; // total incomes in euro
    };
  };

export const getIncomesPerYear = (
  from?: string,
  to?: string,
): Promise<IncomePeriodWithTotal<'year'>[]> => {
  return HTTP.get('/stats/incomes/year/from-orders', {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
    timeout: 60_000,
  }).then(({ data }) =>
    data.map((income: IncomePeriod<'year'>) => ({
      ...income,
      data: {
        ...income.data,
        incomes: income.data.tickets.amount + income.data.subscriptions.amount,
      },
    })),
  );
};

export const getIncomesPerMonth = (
  from?: string,
  to?: string,
): Promise<IncomePeriodWithTotal<'month'>[]> => {
  return HTTP.get('/stats/incomes/month/from-orders', {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
    timeout: 60_000,
  }).then(({ data }) =>
    data.map((income: IncomePeriod<'month'>) => ({
      ...income,
      data: {
        ...income.data,
        incomes: income.data.tickets.amount + income.data.subscriptions.amount,
      },
    })),
  );
};

export const getIncomesPerWeek = (
  from?: string,
  to?: string,
): Promise<IncomePeriodWithTotal<'week'>[]> => {
  return HTTP.get('/stats/incomes/week/from-orders', {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
    timeout: 60_000,
  }).then(({ data }) =>
    data.map((income: IncomePeriod<'week'>) => ({
      ...income,
      data: {
        ...income.data,
        incomes: income.data.tickets.amount + income.data.subscriptions.amount,
      },
    })),
  );
};

export const getIncomesPerDay = (
  from?: string,
  to?: string,
): Promise<IncomePeriodWithTotal<'day'>[]> => {
  return HTTP.get('/stats/incomes/day/from-orders', {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
    timeout: 60_000,
  }).then(({ data }) =>
    data.map((income: IncomePeriod<'day'>) => ({
      ...income,
      data: {
        ...income.data,
        incomes: income.data.tickets.amount + income.data.subscriptions.amount,
      },
    })),
  );
};
