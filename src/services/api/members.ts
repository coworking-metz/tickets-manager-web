import HTTP from '../http';

export const COUPON_UNIT_COST_IN_EUR = 6 as const;
export const SUBSCRIPTION_UNIT_COST_IN_EUR = 60 as const;

export interface Coupon {
  id: string;
  purchaseDate: string;
  tickets: number;
}

export interface Subscription {
  id: string;
  startDate: string;
  endDate: string;
  purchased: string;
}

export type AttendanceType = 'SUBSCRIPTION' | 'TICKET';

export interface Attendance {
  id: string;
  date: string;
  amount: number;
  type: AttendanceType;
}

export interface Membership {
  id: string;
  purchaseDate: string;
  membershipStart: string;
}

export interface Device {
  id: string;
  macAddress: string;
}

export interface MemberListItem {
  id: number;
  picture: string;
  email: string;
  phone: string;
  firstname: string;
  lastname: string;
  lastSeen: string;
  balance: number;
  subscription: Subscription;
}

export interface Member extends MemberListItem {
  created: string;
  tickets: Coupon[];
  presences: Attendance[];
  subscriptions: Subscription[];
  devices: Device[];
  memberships: Membership[];
}

export const getAllMembers = (): Promise<MemberListItem[]> => {
  return HTTP.get('/members').then(({ data }) => data);
};

export const getMember = (id: string): Promise<Member> => {
  return HTTP.get(`/members/${id}`).then(({ data }) => data);
};

export const updateMember = (id: string, member: Member): Promise<Member> => {
  return HTTP.put(`/members/${id}`, member).then(({ data }) => data);
};
