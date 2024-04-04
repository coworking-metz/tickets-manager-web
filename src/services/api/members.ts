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
  attending: boolean;
  wpUserId?: number;
}

export interface Member extends MemberListItem {
  activity: number;
  totalActivity: number;
  macAddresses: string[];
  memberships: Membership[];
  trustedUser: boolean; // with at least 10 days of totalActivity
  activeUser: boolean; // with at least 20 days of activity (in the last 180 days)
}

export const isMembershipNonCompliant = (member: Member | MemberListItem) => {
  return Boolean(
    !member.membershipOk &&
      member.lastSeen &&
      (!member.lastMembership ||
        dayjs(member.lastSeen).isAfter(dayjs().year(member.lastMembership).endOf('year'), 'year')),
  );
};

export const getAllMembers = (): Promise<MemberListItem[]> => {
  return HTTP.get('/api/members').then(({ data }) => data);
};

export const getVotingMembers = (): Promise<MemberListItem[]> => {
  return HTTP.get('/api/voting-members').then(({ data }) => data);
};

export const getMember = (id: string): Promise<Member> => {
  return HTTP.get(`/api/members/${id}`).then(({ data }) => data);
};

export const updateMember = (id: string, member: Member): Promise<Member> => {
  return HTTP.put(`/api/members/${id}`, member).then(({ data }) => data);
};

export const updateMemberMacAddresses = (id: string, macAddresses: string[]): Promise<Member> => {
  return HTTP.put(`/api/members/${id}/mac-addresses`, macAddresses).then(({ data }) => data);
};

export const getMemberActivity = (id: string): Promise<Attendance[]> => {
  return HTTP.get(`/api/members/${id}/activity`).then(({ data }) => data);
};

export const updateMemberActivity = (
  memberId: string,
  activityId: string,
  activity: Attendance & { reason: string },
): Promise<Attendance> => {
  return HTTP.put(`/api/members/${memberId}/activity/${activityId}`, activity).then(
    ({ data }) => data,
  );
};

export const syncMember = (id: string): Promise<Member> => {
  return HTTP.post(`/api/members/${id}/sync-wordpress`).then(({ data }) => data);
};

export const buildMemberPictureUrl = (wordpressUserId: number) => {
  return new URL(
    `/polaroid/${wordpressUserId}-raw-small.jpg`,
    import.meta.env.VUE_APP_WORDPRESS_BASE_URL,
  ).toString();
};

export const buildMemberWordpressProfileUrl = (wordpressUserId: number) => {
  return new URL(
    `/wp-admin/user-edit.php?user_id=${wordpressUserId}`,
    import.meta.env.VUE_APP_WORDPRESS_BASE_URL,
  ).toString();
};
