import { Subscription } from './subscriptions';
import { Ticket } from './tickets';
import HTTP from '../http';

export type AttendanceType = 'SUBSCRIPTION' | 'TICKET';

export interface Attendance {
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
  id: string;
  picture?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  birthdate?: string;
  created: string;
  lastSeen?: string;
  active: boolean;
}

export interface Member extends MemberListItem {
  balance: number;
  devices: Device[];
  memberships: Membership[];
}

export const getAllMembers = (): Promise<MemberListItem[]> => {
  return HTTP.get('/manager/members').then(({ data }) => data);
};

export const getMember = (id: string): Promise<Member> => {
  return HTTP.get(`/manager/members/${id}`).then(({ data }) => data);
};

export const updateMember = (id: string, member: Member): Promise<Member> => {
  return HTTP.put(`/manager/members/${id}`, member).then(({ data }) => data);
};

export const getMemberPresences = (id: string): Promise<Attendance[]> => {
  return HTTP.get(`/manager/members/${id}/presences`).then(({ data }) => data);
};
