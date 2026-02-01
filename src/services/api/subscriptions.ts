import { HTTP } from '../http';
import dayjs from 'dayjs';

export interface Subscription {
  _id: string;
  started: string;
  ended: string;
  purchased: string;
  amount: number;
  dailyAmount: number;
  durationInDays: number;
  orderReference?: string | null;
}

export const getAllMemberSubscriptions = (memberId: string): Promise<Subscription[]> => {
  return HTTP.get(`/api/members/${memberId}/subscriptions`).then(({ data }) => data);
};

export const getMemberSubscription = (
  memberId: string,
  subscriptionId: string,
): Promise<Subscription> => {
  return HTTP.get(`/api/members/${memberId}/subscriptions/${subscriptionId}`).then(
    ({ data }) => data,
  );
};

export type SubscriptionChange = Pick<
  Subscription,
  'started' | 'ended' | 'orderReference' | 'purchased'
> & {
  amount?: number | null;
  comment: string; // comment is mandatory to audit what happened
};

export const addMemberSubscription = (
  memberId: string,
  subscription: SubscriptionChange,
): Promise<Subscription> => {
  return HTTP.post(`/api/members/${memberId}/subscriptions`, subscription).then(({ data }) => data);
};

export const updateMemberSubscription = (
  memberId: string,
  subscriptionId: string,
  subscription: SubscriptionChange,
): Promise<Subscription> => {
  return HTTP.put(`/api/members/${memberId}/subscriptions/${subscriptionId}`, subscription).then(
    ({ data }) => data,
  );
};

export const deleteMemberSubscription = (
  memberId: string,
  subscriptionId: string,
  comment: string,
): Promise<void> => {
  return HTTP.delete(`/api/members/${memberId}/subscriptions/${subscriptionId}`, {
    data: { comment },
  });
};

/**
 * Add (1 month - 1 day) to the starting date
 * ensure that 12 subscriptions are equivalent to 1 year
 * @see https://github.com/coworking-metz/tickets-backend/pull/54#discussion_r1438295181
 */
export const computeDefaultEndDate = (started?: string | null) => {
  return started
    ? dayjs
        .tz(started, 'Europe/Paris')
        .add(1, 'month')
        .subtract(1, 'day')
        .toISOString()
        .slice(0, 10)
    : null;
};
