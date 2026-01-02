import { AppErrorCode, parseErrorText } from '@/helpers/errors';
import { AxiosError } from 'axios';
import { isNil } from 'lodash';
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_NOTIFICATION_TIMEOUT = 3_000;

export type NotificationAction = {
  label: string;
  onClick: () => void;
};

export type AppNotification = {
  message?: string;
  description?: string;
  actions?: NotificationAction[];
  icon?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timeout?: number;
  errorCode?: string | AppErrorCode;
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
    lastOpen: (state) => {
      const allNotificationsNotDismissed = state.history.filter(({ dismissed }) =>
        isNil(dismissed),
      );
      const allNotificationsNotDismissedSorted = allNotificationsNotDismissed.sort(
        (first, second) => new Date(first.created).getTime() - new Date(second.created).getTime(),
      );
      const [last] = allNotificationsNotDismissedSorted.slice(-1);
      return last;
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
    addSuccessNotification(message: string, options?: Omit<AppNotification, 'type' | 'message'>) {
      return this.addNotification({
        message,
        type: 'success',
        timeout: DEFAULT_NOTIFICATION_TIMEOUT,
        ...options,
      });
    },
    async addErrorNotification(
      error: AxiosError | (Error & { code?: AppErrorCode }),
      message?: string,
      options?: Omit<AppNotification, 'type' | 'message' | 'description' | 'errorCode'>,
    ) {
      const errorText = await parseErrorText(error);
      return this.addNotification({
        type: 'error',
        message: message,
        description: errorText,
        errorCode: error.code,
        ...options,
      });
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
      // because toast.dismissALl() does not work in sonner-toaster
      // we need to manually close all toasts by clicking on their close button
      const closeButtons = document.querySelectorAll(
        'ol[data-sonner-toaster] li button[id^="notification-"]',
      );
      closeButtons.forEach((link) => (link as HTMLAnchorElement).click());
    },
  },
});
