import HTTP from '../http';
import axios from 'axios';

export interface MemberListItem {
  id: number;
  picture: string;
  email: string;
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

export interface Member extends MemberListItem {
  tickets: {
    purchaseDate: string;
    tickets: number;
  }[];
  presences: {
    date: string;
    amount: number;
    type: 'SUBSCRIPTION' | 'BALANCE';
  }[];
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
