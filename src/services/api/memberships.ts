import HTTP from '../http';

export interface Membership {
  _id: string;
  purchased: string;
  amount: number;
  orderReference?: string;
  membershipStart: string;
  membershipEnd: string;
}

export const getAllMemberMemberships = (memberId: string): Promise<Membership[]> => {
  return HTTP.get(`/api/members/${memberId}/memberships`).then(({ data }) => data);
};

export const getMemberMembership = (
  memberId: string,
  membershipId: string,
): Promise<Membership> => {
  return HTTP.get(`/api/members/${memberId}/memberships/${membershipId}`).then(({ data }) => data);
};

export type MembershipChange = Pick<Membership, 'membershipStart' | 'purchased'> & {
  orderReference?: string | null; // orderReference is optional for new memberships
  amount?: number | null;
  comment: string; // comment is mandatory to audit what happened
};

export const addMemberMembership = (
  memberId: string,
  membership: MembershipChange,
): Promise<Membership> => {
  return HTTP.post(`/api/members/${memberId}/memberships`, membership).then(({ data }) => data);
};

export const updateMemberMembership = (
  memberId: string,
  membershipId: string,
  membership: MembershipChange,
): Promise<Membership> => {
  return HTTP.put(`/api/members/${memberId}/memberships/${membershipId}`, membership).then(
    ({ data }) => data,
  );
};

export const deleteMemberMembership = (
  memberId: string,
  membershipId: string,
  comment: string,
): Promise<void> => {
  return HTTP.delete(`/api/members/${memberId}/memberships/${membershipId}`, {
    data: { comment },
  });
};
