<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div :class="['flex min-h-10 flex-row gap-x-3 rounded-md px-4 py-2.5', backgroundColor]">
    <SvgIcon
      aria-hidden="true"
      :class="['size-5 shrink-0', titleColor]"
      :path="icon || typeIcon"
      type="mdi" />
    <slot>
      <div class="flex flex-col gap-2">
        <h3 v-if="title || $slots.title" :class="['font-medium sm:text-sm', titleColor]">
          <slot name="title">
            {{ title }}
          </slot>
        </h3>
        <p
          v-if="description || $slots.description"
          :class="['text-sm font-normal', descriptionColor]">
          <slot name="description">
            {{ description }}
          </slot>
        </p>
        <slot name="action" />
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import {
  mdiAlertCircleOutline,
  mdiAlertOutline,
  mdiCheckCircleOutline,
  mdiHelpCircleOutline,
  mdiInformationOutline,
} from '@mdi/js';
import { PropType, computed } from 'vue';

const props = defineProps({
  type: {
    type: String as PropType<'info' | 'success' | 'warning' | 'error'>,
    default: '',
  },
  title: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
});

const backgroundColor = computed(() => {
  switch (props.type) {
    case 'info':
      return 'bg-blue-50 dark:bg-blue-900/20';
    case 'success':
      return 'bg-green-50 dark:bg-green-600/20';
    case 'warning':
      return 'bg-amber-50 dark:bg-amber-600/20';
    case 'error':
      return 'bg-red-50 dark:bg-red-600/20';
    default:
      return 'bg-gray-50 dark:bg-gray-600/20';
  }
});

const titleColor = computed(() => {
  switch (props.type) {
    case 'info':
      return 'text-sky-700 dark:text-sky-500';
    case 'success':
      return 'text-green-800 dark:text-green-500';
    case 'warning':
      return 'text-amber-800 dark:text-amber-500';
    case 'error':
      return 'text-red-800 dark:text-red-500';
    default:
      return 'text-gray-800 dark:text-gray-500';
  }
});

const descriptionColor = computed(() => {
  switch (props.type) {
    case 'info':
      return 'text-sky-600/90 dark:text-sky-400/50';
    case 'success':
      return 'text-green-700';
    case 'warning':
      return 'text-amber-700';
    case 'error':
      return 'text-red-700';
    default:
      return 'text-gray-700';
  }
});

const typeIcon = computed(() => {
  switch (props.type) {
    case 'info':
      return mdiInformationOutline;
    case 'success':
      return mdiCheckCircleOutline;
    case 'warning':
      return mdiAlertOutline;
    case 'error':
      return mdiAlertCircleOutline;
    default:
      return mdiHelpCircleOutline;
  }
});
</script>
