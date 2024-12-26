import { MemberListItem } from './members';
import HTTP from '../http';

export const MAX_ATTENDANCE = 40;

export type AttendingMember = MemberListItem & {
  attendance: {
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
    };
  };
};

export type AttendancePeriod<PeriodType extends 'year' | 'month' | 'week' | 'day'> = {
  date: string;
  type: PeriodType;
  data: {
    members: AttendingMember[];
  };
};

export const getAttendancePerDay = (
  from?: string,
  to?: string,
): Promise<AttendancePeriod<'day'>[]> => {
  return HTTP.get('/stats/attendance/day', {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
    timeout: 30_000,
  }).then(({ data }) => data);
};
