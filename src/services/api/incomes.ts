import HTTP from '@/services/http';

export type PeriodType = 'year' | 'month' | 'week' | 'day';

export type IncomePeriod<PeriodType> = {
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

export type IncomePeriodWithTotal<PeriodType> = IncomePeriod<PeriodType> & {
  data: IncomePeriod<PeriodType>['data'] & {
    incomes: number; // total incomes in euro
  };
};

export const getIncomesPerPeriod = (
  period: PeriodType,
  from?: string,
  to?: string,
): Promise<IncomePeriodWithTotal<PeriodType>[]> => {
  return HTTP.get(`/stats/incomes/${period}/from-orders`, {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
    timeout: 60_000,
  }).then(({ data }) =>
    data.map((income: IncomePeriod<PeriodType>) => ({
      ...income,
      data: {
        ...income.data,
        incomes: income.data.tickets.amount + income.data.subscriptions.amount,
      },
    })),
  );
};
