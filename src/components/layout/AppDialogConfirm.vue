<template>
  <AppDialog v-model="isVisible">
    <template #dialog>
      <DialogPanel
        as="form"
        class="relative overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg dark:bg-neutral-800"
        @submit.prevent="emit('confirm')">
        <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-neutral-800">
          <div class="sm:flex sm:items-start">
            <div
              v-if="icon"
              :class="[
                'mx-auto flex size-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:size-10',
                iconColors,
              ]">
              <SvgIcon aria-hidden="true" class="size-6" :path="icon" type="mdi" />
            </div>
            <div class="max-sm:mt-4 sm:ml-4">
              <DialogTitle
                v-if="title"
                as="h3"
                class="flex flex-row items-center text-lg font-medium leading-6 text-gray-900 max-sm:justify-center max-sm:text-center sm:min-h-10 sm:pr-6 dark:text-gray-100">
                {{ title }}
              </DialogTitle>

              <slot />
            </div>
          </div>
        </div>

        <footer
          class="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row-reverse sm:px-6 dark:border-neutral-950 dark:bg-neutral-900/80">
          <slot name="confirm">
            <AppButtonPlain
              class="w-full sm:w-auto sm:text-sm dark:focus:ring-offset-neutral-900/80"
              :color="confirmColor"
              :loading="confirming"
              type="submit">
              {{ $t('action.confirm') }}
            </AppButtonPlain>
          </slot>
        </footer>

        <AppButtonIcon
          class="absolute right-3 top-3 sm:right-4 dark:ring-offset-neutral-800"
          :icon="mdiClose"
          :title="$t('action.close')"
          @click="isVisible = false" />
      </DialogPanel>
    </template>
  </AppDialog>
</template>

<script setup lang="ts">
import AppDialog from './AppDialog.vue';
import AppButtonIcon from '../form/AppButtonIcon.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import { DialogPanel, DialogTitle } from '@headlessui/vue';
import { mdiClose } from '@mdi/js';
import { computed } from 'vue';

const isVisible = defineModel({
  type: Boolean,
  default: false,
});

const emit = defineEmits<{
  (e: 'confirm'): void;
}>();
const props = defineProps({
  icon: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    default: null,
  },
  type: {
    type: String as () => 'critical' | 'warning' | 'info' | 'success' | '',
    default: '',
  },
  confirming: {
    type: Boolean,
    default: false,
  },
});

const iconColors = computed(() => {
  switch (props.type) {
    case 'critical':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
    case 'warning':
      return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20';
    case 'info':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    case 'success':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
  }
});

const confirmColor = computed(() => {
  switch (props.type) {
    case 'critical':
      return 'red';
    case 'warning':
      return 'amber';
    case 'info':
      return 'indigo';
    case 'success':
      return 'emerald';
    default:
      return 'indigo';
  }
});
</script>
