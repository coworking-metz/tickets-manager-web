import HTTP from '../http';
import axios from 'axios';

export const COUPON_UNIT_COST_IN_EUR = 6 as const;
export const SUBSCRIPTION_UNIT_COST_IN_EUR = 60 as const;

export interface MemberListItem {
  id: number;
  picture: string;
  email: string;
  phone: string;
  firstname: string;
  lastname: string;
  lastSeen: string;
  balance: number;
  subscription: {
    startDate: string;
    endDate: string;
    purchased: string;
  };
  memberships: {
    purchaseDate: string;
    membershipStart: string;
  }[];
  macAddresses: string[];
}

export interface Coupon {
  purchaseDate: string;
  tickets: number;
}

export interface Subscription {
  startDate: string;
  endDate: string;
  purchased: string;
}

export interface Attendance {
  date: string;
  amount: number;
  type: 'SUBSCRIPTION' | 'COUPON';
}

export interface Member extends MemberListItem {
  created: string;
  tickets: Coupon[];
  presences: Attendance[];
  subscriptions: Subscription[];
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
