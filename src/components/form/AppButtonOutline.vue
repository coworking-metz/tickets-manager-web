<template>
  <AppButton :class="colors" v-bind="props">
    <slot />
  </AppButton>
</template>

<script setup lang="ts">
import AppButton from './AppButton.vue';
import { buttonProps } from './buttonProps';
import { computed, PropType } from 'vue';

const props = defineProps({
  ...buttonProps,
  color: {
    type: String as PropType<'indigo' | 'red' | 'amber' | 'gray'>,
    default: 'indigo',
  },
});

const colors = computed(() => {
  switch (props.color) {
    case 'indigo':
      return 'border border-indigo-300 text-indigo-500 dark:border-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:ring-indigo-500';
    case 'red':
      return 'border border-red-300 text-red-500 dark:border-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-red-500';
    case 'amber':
      return 'border border-amber-300 text-amber-500 dark:border-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:ring-amber-500';
    default:
      return 'border border-gray-300 text-gray-500 dark:border-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20 focus:ring-gray-500';
  }
});
</script>
