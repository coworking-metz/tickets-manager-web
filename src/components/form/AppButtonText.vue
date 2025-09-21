<template>
  <AppButton
    :class="[
      `border border-transparent px-4 py-2 font-medium outline-none transition-all
      focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900`,
      colors,
    ]">
    <slot />
  </AppButton>
</template>

<script setup lang="ts">
import AppButton from './AppButton.vue';
import { PropType, computed } from 'vue';

const props = defineProps({
  color: {
    type: String as PropType<'indigo' | 'amber' | 'gray' | 'none'>,
    default: 'indigo',
  },
});

const colors = computed(() => {
  switch (props.color) {
    case 'indigo':
      return 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 focus:ring-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-950 dark:hover:text-indigo-300';
    case 'amber':
      return 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 focus:ring-amber-500 dark:text-amber-400 dark:hover:bg-amber-950 dark:hover:text-amber-300';
    case 'none':
      return '';
    default:
      return 'text-gray-600 hover:bg-gray-50 hover:text-gray-700 focus:ring-gray-500 dark:text-gray-400 dark:hover:bg-gray-950 dark:hover:text-gray-300';
  }
});
</script>
