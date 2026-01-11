import { AuditEvent } from './audit';
import { HTTP } from '@/services/http';

export interface ApiMessage {
  _id: string;
  title?: string;
  body: string;
  fromMemberId: string;
  published?: string | null;
  created: string;
  updated: string;
  type: ApiMessageType;
  to: ApiMessageAcknowledgement[];
}

// what can be changed when adding or updating a message
export type ApiMessageChange = Pick<
  ApiMessage,
  'title' | 'body' | 'fromMemberId' | 'type' | 'to' | 'published'
>;

export interface ApiMessageAcknowledgement {
  memberId: string;
  delivered: string | null;
  read: string | null;
}

export enum ApiMessageType {
  USER_GENERATED = 'USER_GENERATED',
}

export const getAllMessages = (): Promise<ApiMessage[]> => {
  return HTTP.get(`/api/messages`).then(({ data }) => data);
};

export const addMessage = (message: ApiMessageChange): Promise<ApiMessage> => {
  return HTTP.post(`/api/messages/`, message).then(({ data }) => data);
};

export const getMessage = (messageId: string): Promise<ApiMessage> => {
  return HTTP.get(`/api/messages/${messageId}`).then(({ data }) => data);
};

export const getMessageHistory = (messageId: string): Promise<AuditEvent[]> => {
  return HTTP.get(`/api/messages/${messageId}/history`).then(({ data }) => data);
};

export const updateMessage = (
  messageId: string,
  message: Partial<ApiMessageChange>,
): Promise<ApiMessage> => {
  return HTTP.put(`/api/messages/${messageId}`, message).then(({ data }) => data);
};

export const deleteMessage = (messageId: string): Promise<ApiMessage> => {
  return HTTP.delete(`/api/messages/${messageId}`).then(({ data }) => data);
};
