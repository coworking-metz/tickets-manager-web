import HTTP from '../http';
import dayjs from 'dayjs';

export type AttendanceType = 'subscription' | 'ticket';

export interface Attendance {
  date: string;
  value: number;
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
  _id: string;
  picture?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  birthDate?: string;
  created: string;
  lastSeen?: string;
  active: boolean;
  balance: number;
  membershipOk: boolean;
  lastMembership: number;
}

export interface Member extends MemberListItem {
  macAddresses: string[];
  memberships: Membership[];
}

export const isMembershipNonCompliant = (member: Member | MemberListItem) => {
  return Boolean(
    member.membershipOk === false &&
      member.lastSeen &&
      !dayjs(member.lastSeen).isSame(dayjs().year(member.lastMembership), 'year'),
  );
};

export const getAllMembers = (): Promise<MemberListItem[]> => {
  return HTTP.get('/members').then(({ data }) => data);
};

export const getMember = (id: string): Promise<Member> => {
  return HTTP.get(`/members/${id}`).then(({ data }) => data);
};

export const updateMember = (id: string, member: Member): Promise<Member> => {
  return HTTP.put(`/members/${id}`, member).then(({ data }) => data);
};

export const updateMemberMacAddresses = (id: string, macAddresses: string[]): Promise<Member> => {
  return HTTP.put(`/members/${id}/mac-addresses`, macAddresses).then(({ data }) => data);
};

export const getMemberActivity = (id: string): Promise<Attendance[]> => {
  return HTTP.get(`/members/${id}/activity`).then(({ data }) => data);
};

export const updateMemberActivity = (
  memberId: string,
  activityId: string,
  activity: Attendance & { reason: string },
): Promise<Attendance> => {
  return HTTP.put(`/members/${memberId}/activity/${activityId}`, activity).then(({ data }) => data);
};

export const syncMember = (id: string): Promise<Member> => {
  return HTTP.post(`/members/${id}/sync-wordpress`).then(({ data }) => data);
};

export const buildMemberPictureUrl = (id: string) => {
  return HTTP.getUri({ url: `/members/${id}/avatar` });
};

export const buildMemberWordpressProfileUrl = (id: string) => {
  return HTTP.getUri({ url: `/members/${id}/wordpress-profile` });
};
