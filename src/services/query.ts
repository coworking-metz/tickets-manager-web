import { Frequency } from './api/stats/frequency';
import { isSilentError, parseErrorText } from '@/helpers/errors';
import { useQuery, UseQueryOptions, VueQueryPluginOptions } from '@tanstack/vue-query';
import { computedAsync } from '@vueuse/core';

export const DEFAULT_STALE_TIME = 300_000; // 5 minutes

export const defaultVueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  },
};

export const useAppQuery = <TData = unknown>(options: UseQueryOptions<TData>) => {
  const query = useQuery(options);

  const errorText = computedAsync(() => {
    if (query.isError && query.error.value && !isSilentError(query.error.value)) {
      return parseErrorText(query.error.value);
    }
    return null;
  });

  return {
    ...query,
    errorText,
  };
};

export const membersQueryKeys = {
  all: () => ['members'] as const,
  allVoting: () => ['voting-members'] as const,
  byId: (id: string | number) => [...membersQueryKeys.all(), `${id}`] as const,
  profileById: (id: string | number) => [...membersQueryKeys.byId(id), 'profile'] as const,
  activityById: (id: string | number) => [...membersQueryKeys.byId(id), 'activity'] as const,
  historyById: (id: string | number) => [...membersQueryKeys.byId(id), 'history'] as const,
  capabilitiesById: (id: string | number) =>
    [...membersQueryKeys.byId(id), 'capabilities'] as const,
  ticketsById: (id: string | number) => [...membersQueryKeys.byId(id), 'tickets'] as const,
  subscriptionsById: (id: string | number) =>
    [...membersQueryKeys.byId(id), 'subscriptions'] as const,
  membershipsById: (id: string | number) => [...membersQueryKeys.byId(id), 'memberships'] as const,
  devicesById: (id: string | number) => [...membersQueryKeys.byId(id), 'devices'] as const,
};

export const auditEventsQueryKeys = {
  allInPeriod: (from: string, to: string) => ['audit', from, to] as const,
};

export const statsQueryKeys = {
  allUsagePeriods: () => ['stats', 'usage'] as const,
  usageInPeriod: (frequency: Frequency, from: string, to: string) =>
    [...statsQueryKeys.allUsagePeriods(), frequency, from, to] as const,
  allIncomePeriods: () => ['stats', 'income'] as const,
  incomeInPeriod: (frequency: Frequency, from: string, to: string) =>
    [...statsQueryKeys.allIncomePeriods(), frequency, from, to] as const,
  allActivityPeriods: () => ['stats', 'activity'] as const,
  activityInPeriod: (frequency: Frequency, from: string, to: string) =>
    [...statsQueryKeys.allActivityPeriods(), frequency, from, to] as const,
  allAttendancePeriods: () => ['stats', 'attendance'] as const,
  attendanceInPeriod: (frequency: Frequency, from: string, to: string) =>
    [...statsQueryKeys.allAttendancePeriods(), frequency, from, to] as const,
};
