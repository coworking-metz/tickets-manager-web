import HTTP from '../http';

export interface Ticket {
  _id: string;
  purchased: string;
  amount: number;
  count: number;
}

export const getAllMemberTickets = (memberId: string): Promise<Ticket[]> => {
  return HTTP.get(`/api/members/${memberId}/tickets`).then(({ data }) => data);
};

export const getMemberTicket = (memberId: string, ticketId: string): Promise<Ticket> => {
  return HTTP.get(`/api/members/${memberId}/tickets/${ticketId}`).then(({ data }) => data);
};

export const addMemberTicket = (memberId: string, ticket: Ticket): Promise<Ticket> => {
  return HTTP.post(`/api/members/${memberId}/tickets`, ticket).then(({ data }) => data);
};

export const updateMemberTicket = (
  memberId: string,
  ticketId: string,
  ticket: Ticket,
): Promise<Ticket> => {
  return HTTP.put(`/api/members/${memberId}/tickets/${ticketId}`, ticket).then(({ data }) => data);
};

export const deleteMemberTicket = (memberId: string, ticketId: string): Promise<void> => {
  return HTTP.delete(`/api/members/${memberId}/tickets/${ticketId}`);
};
