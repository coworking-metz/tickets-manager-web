import HTTP from '../http';

export interface Subscription {
  _id: string;
  started: string;
  ended: string;
  purchased: string;
  amount: number;
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

export const addMemberSubscription = (
  memberId: string,
  subscription: Subscription,
): Promise<Subscription> => {
  return HTTP.post(`/api/members/${memberId}/subscriptions`, subscription).then(({ data }) => data);
};

export type SubscriptionChange = Pick<Subscription, 'started'> & {
  comment: string; // comment is mandatory to audit what happened
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
): Promise<void> => {
  return HTTP.delete(`/api/members/${memberId}/subscriptions/${subscriptionId}`);
};
