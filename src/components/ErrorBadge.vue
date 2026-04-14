<template>
  <button
    class="group relative size-6 rounded-full"
    type="button"
    @click="isErrorSheetVisible = true">
    <i class="absolute inset-[16%] size-2/3 rounded-full bg-black" />
    <AppIcon
      class="size-full text-amber-500 group-hover:text-amber-600 group-active:text-amber-700"
      :icon="icon" />

    <AppDialogConfirm
      v-model="isErrorSheetVisible"
      :confirming="retrying"
      :icon="icon === mdiAlertCircle ? mdiExclamationThick : icon"
      :title="title"
      type="warning"
      @confirm="emit('retry')">
      <template v-for="(_, slot) of $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>

      <template #confirm="{ loading, color }">
        <AppButtonPlain
          v-if="!isNil(onRetry)"
          class="w-full sm:w-auto sm:text-sm dark:focus:ring-offset-neutral-900/80"
          :color="color"
          :loading="loading"
          type="submit">
          {{ $t('action.retry') }}
        </AppButtonPlain>
        <template v-else>{{ '' }}</template>
      </template>

      <pre v-if="isJSON(description)" class="mt-6 p-3">{{ description }}</pre>
      <p v-else class="mt-2 text-gray-500 sm:text-sm dark:text-gray-400">{{ description }}</p>
    </AppDialogConfirm>
  </button>
</template>

<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import AppButtonPlain from './form/AppButtonPlain.vue';
import AppDialogConfirm from './layout/AppDialogConfirm.vue';
import { mdiAlertCircle, mdiExclamationThick } from '@mdi/js';
import { isNil, isObjectLike } from 'lodash';
import { PropType } from 'vue';

const isErrorSheetVisible = defineModel({
  type: Boolean,
  default: false,
});

const emit = defineEmits<{
  (e: 'retry'): void;
}>();
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String as PropType<string | null>,
    default: null,
  },
  icon: {
    type: String,
    default: mdiAlertCircle,
  },
  retrying: {
    type: Boolean,
    default: false,
  },
  onRetry: {
    type: [Function, null] as PropType<(() => void) | null>,
    default: null,
  },
});

const isJSON = (str: any): boolean => {
  if (!str) return false;
  try {
    const json = JSON.parse(str);
    return isObjectLike(json);
  } catch (e) {
    return false;
  }
};
</script>
