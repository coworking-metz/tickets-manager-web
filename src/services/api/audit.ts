import HTTP from '../http';

export enum AuditAction {
  MEMBER_SUBSCRIPTION_UPDATE = 'MEMBER_SUBSCRIPTION_UPDATE',
  MEMBER_TICKET_UPDATE = 'MEMBER_TICKET_UPDATE',
  MEMBER_DEVICE_UPDATE = 'MEMBER_DEVICE_UPDATE',
  KEYS_ACCESS = 'KEYS_ACCESS',
  UNLOCK_DECK_DOOR = 'UNLOCK_DECK_DOOR',
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
  context?: any;
  occurred: string;
}

export const getAllAuditEvents = (): Promise<AuditEvent[]> => {
  return HTTP.get('/api/audit').then(({ data }) => data);
};
