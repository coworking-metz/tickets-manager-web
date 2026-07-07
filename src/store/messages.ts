import { ApiMessageChange } from '@/services/api/messages';
import { useSessionStorage } from '@vueuse/core';
import { defineStore } from 'pinia';

const SESSION_STORAGE_NEW_MESSAGE_NAME = 'tickets-manager-web-new-message';

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    isNewMessageDialogVisible: false,
    newMessage: useSessionStorage(
      SESSION_STORAGE_NEW_MESSAGE_NAME,
      null as ApiMessageChange | null,
    ),
  }),
  actions: {
    async setNewMessage(message: ApiMessageChange | null) {
      this.newMessage = message;
    },
    async openNewMessageDialog() {
      this.isNewMessageDialogVisible = true;
    },
    async closeNewMessageDialog() {
      this.isNewMessageDialogVisible = false;
    },
  },
});
