<template>
  <div
    v-if="notification"
    :class="[
      'app-notification group pointer-events-auto relative w-screen max-w-96 max-sm:mx-auto',
      notification.type === 'error' && '2xl:max-w-[512px]',
    ]"
    @animationend="() => onTimeoutAnimationEnd(notification)">
    <div
      class="flex flex-row items-start rounded-lg bg-slate-800 p-4 shadow-lg dark:border dark:border-gray-700 dark:bg-gray-950"
      :style="{
        ...(notification.timeout && {
          ['--notification-timeout']: `${notification.timeout}ms`,
          // ['--notification-progress-color']: getProgressColorFromType(notification.type),
        }),
      }"
      :temporary="!!notification.timeout">
      <SvgIcon
        aria-hidden="true"
        :class="['mt-1 size-6 shrink-0', getIconColorFromType(notification.type)]"
        :path="notification.icon || getIconFromType(notification.type)"
        type="mdi" />
      <div class="ml-3 w-0 flex-1 pt-1.5">
        <p class="text-sm font-medium text-gray-100">
          {{ getMessage(notification) }}
        </p>
        <p
          v-if="notification.description"
          class="mt-1 whitespace-pre-line pb-1.5 text-sm text-gray-400">
          {{ notification.description }}
        </p>
        <div v-if="notification.actions?.length" class="-ml-2 flex flex-row gap-6">
          <AppButtonText
            v-for="(action, index) in notification.actions"
            :key="`notification-${notification.id}-action-${action.label}`"
            :class="[
              'whitespace-nowrap !px-2 !py-1',
              index === 0
                ? `text-sky-600 hover:bg-sky-950 hover:text-sky-500 focus:ring-sky-500
                  focus:ring-offset-sky-950`
                : `text-gray-400 hover:bg-gray-700 hover:text-gray-300 focus:ring-gray-500
                  focus:ring-offset-sky-950`,
            ]"
            color="none"
            type="button"
            @click="
              () => {
                emit('closeToast');
                action.onClick?.();
              }
            ">
            {{ action.label }}
          </AppButtonText>
        </div>
      </div>
      <AppButtonIcon
        :id="`notification-${notification.id}-close`"
        class="ml-4 shrink-0 rounded-md !text-gray-400 hover:!bg-gray-400/30 hover:!text-gray-300 active:!bg-gray-400/40 active:!text-gray-100"
        :icon="mdiClose"
        :title="$t('action.close')"
        @click="
          () => {
            notificationsStore.dismissNotification(notificationId);
            emit('closeToast');
          }
        " />
    </div>
    <AppButtonIcon
      v-if="
        notificationsStore?.openCount > 1 && notificationsStore.lastOpen?.id === notification.id
      "
      :id="`notification-close-all`"
      class="absolute -right-2.5 -top-2.5 z-10 !bg-slate-800 !text-gray-400 opacity-0 transition hover:!bg-slate-700 hover:!text-gray-300 active:!bg-slate-900 active:!text-gray-100 group-hover:opacity-100"
      :icon="mdiNotificationClearAll"
      :title="$t('action.closeAll')"
      type="button"
      @click="notificationsStore.dismissAllNotifications" />
  </div>
</template>

<script setup lang="ts">
import AppButtonIcon from './form/AppButtonIcon.vue';
import AppButtonText from './form/AppButtonText.vue';
import { AppErrorCode } from '@/helpers/errors';
import { AppNotification, StoreNotification, useNotificationsStore } from '@/store/notifications';
import {
  mdiAlert,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiClose,
  mdiHelpCircle,
  mdiInformation,
  mdiNotificationClearAll,
} from '@mdi/js';
import { sample } from 'lodash';
// import colors from 'tailwindcss/colors';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
const notificationsStore = useNotificationsStore();

// https://github.com/xiaoluoboding/vue-sonner/issues/63#issuecomment-2060782447
const emit = defineEmits(['closeToast']);
const props = defineProps({
  notificationId: {
    type: String,
    required: true,
  },
});

const notification = computed(() =>
  notificationsStore.history.find(({ id }) => id === props.notificationId),
);

const getIconFromType = (type: AppNotification['type']) => {
  switch (type) {
    case 'info':
      return mdiInformation;
    case 'success':
      return mdiCheckCircle;
    case 'warning':
      return mdiAlert;
    case 'error':
      return mdiAlertCircle;
    default:
      return mdiHelpCircle;
  }
};

const getIconColorFromType = (type: AppNotification['type']) => {
  switch (type) {
    case 'info':
      return 'text-blue-500';
    case 'success':
      return 'text-emerald-500';
    case 'warning':
      return 'text-amber-400';
    case 'error':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
};

// const getProgressColorFromType = (type: AppNotification['type']) => {
//   switch (type) {
//     case 'info':
//       return colors['blue'][500];
//     case 'success':
//       return colors['emerald'][500];
//     case 'warning':
//       return colors['amber'][400];
//     case 'error':
//       return colors['red'][500];
//     default:
//       return colors['gray'][400];
//   }
// };

const onTimeoutAnimationEnd = (notification?: StoreNotification) => {
  if (!!notification?.timeout && !notification?.dismissed) {
    notificationsStore.dismissNotification(notification.id);
    emit('closeToast');
  }
};

const getMessage = (notification: AppNotification) => {
  if (notification.message) {
    return notification.message;
  }

  if (notification.type === 'error') {
    switch (notification.errorCode) {
      case AppErrorCode.DISCONNECTED:
        return i18n.t('errors.onDisconnect.message');
      case AppErrorCode.FORBIDDEN:
        return i18n.t('errors.onForbidden.message');
      default:
        return sample(i18n.tm('errors.onUnknown.message'));
    }
  }
};
</script>

<style scoped>
[temporary='true'] {
  position: relative;
  overflow: hidden;
}

[temporary='true']::after {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0.25rem;
  z-index: 1;
  background: var(--notification-progress-color, #bdc3c7);
  overflow: hidden;
  animation-name: decrease;
  animation-duration: var(--notification-timeout, 5s);
  animation-timing-function: linear;
  animation-iteration-count: 1;
  animation-fill-mode: both;
}

.app-notification:hover [temporary='true']::after {
  animation-play-state: paused;
}

.app-notification:not(:hover) [temporary='true'] button[id$='-close'] {
  opacity: 0;
}

@keyframes decrease {
  0% {
    width: 100%;
  }
  100% {
    width: 0;
  }
}
</style>
