<template>
  <Teleport to="body">
    <div
      aria-live="assertive"
      class="pointer-events-none fixed inset-0 z-[100] flex items-start px-4 py-6 sm:items-end sm:p-6">
      <div class="flex w-full flex-col-reverse items-center gap-4 sm:items-start">
        <!-- Notification panel, dynamically insert this into the live region when it needs to be displayed -->
        <TransitionGroup
          enter-active-class="transform ease-out duration-300 transition"
          enter-from-class="max-sm:-translate-y-2 opacity-0 sm:-translate-x-2"
          enter-to-class="max-sm:translate-y-0 opacity-100 sm:translate-x-0"
          leave-active-class="transform ease-out duration-150 transition"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="-translate-y-2 sm:translate-y-2 opacity-0">
          <div
            v-for="notification in notificationsStore.history.filter(({ dismissed }) => !dismissed)"
            :key="`notification-${notification.id}`"
            class="app-notification pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-[5%]"
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
                :class="['h-6 w-6 shrink-0', getIconColorFromType(notification.type)]"
                :path="notification.icon || getIconFromType(notification.type)"
                type="mdi" />
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-medium text-gray-900">{{ notification.message }}</p>
                <p
                  v-if="notification.description"
                  class="mt-1 whitespace-pre-line text-sm text-gray-500">
                  {{ notification.description }}
                </p>
                <div v-if="notification.actions?.length" class="mt-3 flex space-x-7">
                  <button
                    v-for="(action, index) in notification.actions"
                    :key="`notification-${notification.id}-action-${action.label}`"
                    :class="[
                      'rounded-md bg-white text-sm font-medium  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                      index === 0
                        ? 'text-indigo-600 hover:text-indigo-500'
                        : 'text-gray-700 hover:text-gray-500',
                    ]"
                    type="button"
                    @click="action.onClick">
                    {{ action.label }}
                  </button>
                </div>
              </div>
              <button
                :id="`notification-${notification.id}-close`"
                class="ml-4 inline-flex shrink-0 rounded-md bg-white text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                type="button"
                @click="notificationsStore.dismissNotification(notification.id)">
                <span class="sr-only">{{ $t('action.close') }}</span>
                <SvgIcon aria-hidden="true" class="h-6 w-6" :path="mdiClose" type="mdi" />
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { AppNotification, StoreNotification, useNotificationsStore } from '@/store/notifications';
import {
  mdiAlert,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiClose,
  mdiHelpCircle,
  mdiInformation,
} from '@mdi/js';

const notificationsStore = useNotificationsStore();

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
  bottom: 0;
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
