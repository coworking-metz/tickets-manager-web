import HTTP from '../http';

export enum AuditAction {
  MEMBER_SUBSCRIPTION_UPDATE = 'MEMBER_SUBSCRIPTION_UPDATE',
}

export interface AuditEvent {
  _id: string;
  author: {
    _id?: string;
    wpUserId: number;
    name: string;
    email: string;
  };
  action: AuditAction;
  context: any;
  occurred: string;
}

export const getAllAuditEvents = (): Promise<AuditEvent[]> => {
  return HTTP.get('/api/audit').then(({ data }) => data);
};
