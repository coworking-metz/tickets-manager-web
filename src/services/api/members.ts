import HTTP from '../http';

export type AttendanceType = 'A' | 'T'; // 'A' = Abonnement, 'T' = Ticket

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
  firstName?: string;
  lastName?: string;
  email?: string;
  birthdate?: string;
  created: string;
  lastSeen?: string;
  active: boolean;
}

export interface Member extends MemberListItem {
  balance: number;
  macAddresses: string[];
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

export const updateMemberMacAddresses = (id: string, macAddresses: string[]): Promise<Member> => {
  return HTTP.put(`/members/${id}/mac-addresses`, macAddresses).then(({ data }) => data);
};

export const getMemberPresences = (id: string): Promise<Attendance[]> => {
  return HTTP.get(`/members/${id}/presences`).then(({ data }) => data);
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
