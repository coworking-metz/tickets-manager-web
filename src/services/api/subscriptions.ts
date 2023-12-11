import HTTP from '../http';

export const SUBSCRIPTION_UNIT_COST_IN_EUR = 60 as const;

export interface Subscription {
  id: string;
  startDate: string;
  endDate: string;
  purchased: string;
}

export const getAllMemberSubscriptions = (memberId: string): Promise<Subscription[]> => {
  return HTTP.get(`/manager/members/${memberId}/subscriptions`).then(({ data }) => data);
};

export const getMemberSubscription = (
  memberId: string,
  subscriptionId: string,
): Promise<Subscription> => {
  return HTTP.get(`/manager/members/${memberId}/subscriptions/${subscriptionId}`).then(
    ({ data }) => data,
  );
};

export const updateMemberSubscription = (
  memberId: string,
  subscriptionId: string,
  subscription: Subscription,
): Promise<Subscription> => {
  return HTTP.put(
    `/manager/members/${memberId}/subscriptions/${subscriptionId}`,
    subscription,
  ).then(({ data }) => data);
};

export const deleteMemberSubscription = (
  memberId: string,
  subscriptionId: string,
): Promise<void> => {
  return HTTP.delete(`/manager/members/${memberId}/subscriptions/${subscriptionId}`);
};
