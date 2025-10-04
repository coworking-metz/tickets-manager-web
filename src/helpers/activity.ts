import { AttendanceDuration } from '@/services/api/members';

export enum ActivityDuration {
  'NONE' = 0,
  'HALF' = 0.5,
  'FULL' = 1,
}

export const getActivityDuration = (value: AttendanceDuration): ActivityDuration => {
  return value === 1
    ? ActivityDuration.FULL
    : value === 0.5
      ? ActivityDuration.HALF
      : ActivityDuration.NONE;
};
