import { Frequency } from './frequency';
import HTTP from '@/services/http';

export const MAX_ATTENDANCE = 40;

export type ActivityPeriod<Frequency> = {
  date: string;
  type: Frequency;
  data: {
    coworkersCount: number; // total number of coworkers over the period
    coworkedDaysCount: number; // each time a coworker has attended the location over the period
    newCoworkersCount: number; // onboarded coworkers over the period
    coworkedDaysAmount: number; // sum of coworked days over the period
  };
};

export const getActivityPerPeriod = (
  period: Frequency,
  from?: string,
  to?: string,
): Promise<ActivityPeriod<Frequency>[]> => {
  return HTTP.get(`/stats/activity/${period}`, {
    params: {
      includesCurrent: 1,
      ...(from && { from }),
      ...(to && { to }),
    },
    timeout: 60_000,
  }).then(({ data }) => data);
};
