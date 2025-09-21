<template>
  <AppButton :class="colors" v-bind="props">
    <slot />
  </AppButton>
</template>

<script setup lang="ts">
import AppButton from './AppButton.vue';
import { buttonProps } from './buttonProps';
import { PropType, computed } from 'vue';

const props = defineProps({
  ...buttonProps,
  color: {
    type: String as PropType<'indigo' | 'red' | 'amber' | 'gray'>,
    default: 'indigo',
  },
});

const colors = computed(() => {
  switch (props.color) {
    case 'amber':
      return 'bg-amber-100 hover:bg-amber-200 focus:ring-amber-500 dark:bg-amber-950 dark:text-amber-500 dark:hover:bg-amber-900 dark:hover:text-amber-300';
    case 'indigo':
      return 'bg-indigo-100 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 focus:ring-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-300';
    case 'red':
      return 'bg-red-100 text-red-800 dark:text-red-500 hover:bg-red-200 focus:ring-red-500 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:hover:text-rose-300';
    default:
      return 'bg-gray-100 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-950 dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-300';
  }
});
</script>
