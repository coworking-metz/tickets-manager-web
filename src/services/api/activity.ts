import HTTP from '../http';

export const MAX_ATTENDANCE = 40;

export type ActivityPeriod<PeriodType extends 'year' | 'month' | 'week' | 'day'> = {
  date: string;
  type: PeriodType;
  data: {
    coworkersCount: number; // total number of coworkers over the period
    coworkedDaysCount: number; // each time a coworker has attended the location over the period
    newCoworkersCount: number; // onboarded coworkers over the period
    coworkedDaysAmount: number; // sum of coworked days over the period
  };
};

export const getActivityPerYear = (
  from?: string,
  to?: string,
): Promise<ActivityPeriod<'year'>[]> => {
  return HTTP.get('/stats/year', {
    params: {
      includesCurrent: 1,
      ...(from && { from }),
      ...(to && { to }),
    },
  }).then(({ data }) => data);
};

export const getActivityPerMonth = (
  from?: string,
  to?: string,
): Promise<ActivityPeriod<'month'>[]> => {
  return HTTP.get('/stats/month', {
    params: {
      includesCurrent: 1,
      ...(from && { from }),
      ...(to && { to }),
    },
  }).then(({ data }) => data);
};

export const getActivityPerWeek = (
  from?: string,
  to?: string,
): Promise<ActivityPeriod<'week'>[]> => {
  return HTTP.get('/stats/week', {
    params: {
      includesCurrent: 1,
      ...(from && { from }),
      ...(to && { to }),
    },
  }).then(({ data }) => data);
};

export const getActivityPerDay = (from?: string, to?: string): Promise<ActivityPeriod<'day'>[]> => {
  return HTTP.get('/stats/day', {
    params: {
      includesCurrent: 1,
      ...(from && { from }),
      ...(to && { to }),
    },
  }).then(({ data }) => data);
};
