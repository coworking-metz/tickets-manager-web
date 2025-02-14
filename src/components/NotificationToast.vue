<template>
  <div
    class="app-notification pointer-events-auto w-96 overflow-hidden rounded-lg bg-slate-800 p-4 shadow-lg max-sm:mx-auto dark:border dark:border-gray-700 dark:bg-gray-950"
    :style="{
      ...(notification.timeout && {
        ['--notification-timeout']: `${notification.timeout}ms`,
      }),
    }"
    :temporary="!!notification.timeout"
    @animationend="() => onTimeoutAnimationEnd(notification)">
    <div class="flex items-start">
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
        class="ml-4 shrink-0 rounded-md text-gray-400 hover:bg-gray-400/30 hover:text-gray-300 active:bg-gray-400/40 active:text-gray-100"
        :icon="mdiClose"
        :title="$t('action.close')"
        type="button"
        @click="
          () => {
            notificationsStore.dismissNotification(notification.id);
            emit('closeToast');
          }
        " />
    </div>
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
} from '@mdi/js';
import { random } from 'lodash';
import { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
const notificationsStore = useNotificationsStore();

// https://github.com/xiaoluoboding/vue-sonner/issues/63#issuecomment-2060782447
const emit = defineEmits(['closeToast']);
defineProps({
  notification: {
    type: Object as PropType<StoreNotification>,
    required: true,
  },
});

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
      return 'text-green-500';
    case 'warning':
      return 'text-orange-400';
    case 'error':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
};

const onTimeoutAnimationEnd = (notification: StoreNotification) => {
  if (!!notification.timeout && !notification.dismissed) {
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
        const defaultErrorMessages = [
          i18n.t('errors.onUnknown.message.corporate'),
          i18n.t('errors.onUnknown.message.funny'),
          i18n.t('errors.onUnknown.message.oops'),
        ];
        return defaultErrorMessages[random(0, defaultErrorMessages.length - 1)];
    }
  }
};
</script>

<style scoped>
.app-notification[temporary='true'] {
  position: relative;
  overflow: hidden;
}

.app-notification[temporary='true']::after {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0.25rem;
  border-radius: 0.125rem;
  z-index: 1;
  background: #bdc3c7;
  overflow: hidden;
  animation-name: decrease;
  animation-duration: var(--notification-timeout, 5s);
  animation-timing-function: linear;
  animation-iteration-count: 1;
  animation-fill-mode: both;
}

.app-notification[temporary='true']:hover::after {
  animation-play-state: paused;
}

.app-notification[temporary='true']:not(:hover) button[id$='-close'] {
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
