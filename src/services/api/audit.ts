import HTTP from '../http';

export enum AuditAction {
  MEMBER_ACTIVITY_ADD = 'MEMBER_ACTIVITY_ADD',
  MEMBER_ACTIVITY_UPDATE = 'MEMBER_ACTIVITY_UPDATE',
  MEMBER_BADGE_ID_UPDATE = 'MEMBER_BADGE_ID_UPDATE',
  MEMBER_SUBSCRIPTION_UPDATE = 'MEMBER_SUBSCRIPTION_UPDATE',
  MEMBER_TICKET_UPDATE = 'MEMBER_TICKET_UPDATE',
  MEMBER_TICKET_ADD = 'MEMBER_TICKET_ADD',
  MEMBER_MAC_ADDRESSES_UPDATE = 'MEMBER_MAC_ADDRESSES_UPDATE',
  MEMBER_DEVICE_UPDATE = 'MEMBER_DEVICE_UPDATE',
  MEMBER_DEVICE_ADD = 'MEMBER_DEVICE_ADD',
  MEMBER_DEVICE_REMOVE = 'MEMBER_DEVICE_REMOVE',
  MEMBER_CAPABILITIES_UPDATE = 'MEMBER_CAPABILITIES_UPDATE',
  MEMBER_MEMBERSHIP_UPDATE = 'MEMBER_MEMBERSHIP_UPDATE',
  MEMBER_MEMBERSHIP_ADD = 'MEMBER_MEMBERSHIP_ADD',
  KEYS_ACCESS = 'KEYS_ACCESS',
  KEYS_ACCESS_DECK = 'KEYS_ACCESS_DECK',
  UNLOCK_DECK_DOOR = 'UNLOCK_DECK_DOOR',
  UNLOCK_GATE = 'UNLOCK_GATE',
  PARKING_ACCESS = 'PARKING_ACCESS',
}

export interface AuditEvent {
  _id: string;
  author?: {
    _id?: string;
    wpUserId: number;
    name: string;
    email: string;
  };
  action: AuditAction;
  context?: any;
  occurred: string;
}

export const getAllAuditEvents = (from?: string, to?: string): Promise<AuditEvent[]> => {
  return HTTP.get('/api/audit', {
    params: {
      ...(from && { from }),
      ...(to && { to }),
    },
  }).then(({ data }) => data);
};
