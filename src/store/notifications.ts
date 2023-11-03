import { parseErrorText } from '@/helpers/errors';
import { mdiAlertCircle } from '@mdi/js';
import { AxiosError } from 'axios';
import { isNil } from 'lodash';
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export type AppNotification = {
  message: string;
  action?: unknown;
  icon?: string;
  iconColor?: string;
  timeout?: number;
};

export type StoreNotification = AppNotification & {
  id: string;
  created: string;
  dismissed: string | null;
};

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    history: [] as StoreNotification[],
  }),
  getters: {
    firstOpen: (state) => {
      const allNotificationsNotDismissed = state.history.filter(({ dismissed }) =>
        isNil(dismissed),
      );
      const allNotificationsNotDismissedSorted = allNotificationsNotDismissed.sort(
        (first, second) => new Date(first.created).getTime() - new Date(second.created).getTime(),
      );
      const [first] = allNotificationsNotDismissedSorted;
      return first;
    },
    openCount: (state) => state.history.filter(({ dismissed }) => isNil(dismissed)).length,
  },
  actions: {
    addNotification(notification: AppNotification) {
      const storeNotification = {
        ...notification,
        id: uuidv4(),
        created: new Date().toISOString(),
        dismissed: null,
      } as StoreNotification;
      this.history.push(storeNotification);
      return storeNotification;
    },
    async addErrorNotification(error: AxiosError | Error) {
      const message = await parseErrorText(error);
      const errorNotification = {
        icon: mdiAlertCircle,
        iconColor: 'error darken-1',
        message,
      };
      return this.addNotification(errorNotification);
    },
    removeNotification(notificationId: string) {
      this.history = this.history.filter(({ id }) => id !== notificationId);
    },
    dismissNotification(notificationId: string) {
      const notificationIndex = this.history.findIndex(({ id }) => id === notificationId);
      if (notificationIndex >= 0) {
        const dismissedNotification = {
          ...this.history[notificationIndex],
          dismissed: new Date().toISOString(),
        };
        this.history.splice(notificationIndex, 1, dismissedNotification);
        return dismissedNotification;
      }
      throw new Error(`Notification with id ${notificationId} not found`);
    },
    dismissAllNotifications() {
      this.history = this.history.map((notification) => ({
        ...notification,
        dismissed: notification.dismissed || new Date().toISOString(),
      }));
    },
  },
});
