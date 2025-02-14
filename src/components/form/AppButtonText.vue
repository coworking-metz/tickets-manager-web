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

export type TextColor = 'sky' | 'amber' | 'gray' | 'none';

const props = defineProps({
  color: {
    type: String as PropType<TextColor>,
    default: 'sky',
  },
});

const colors = computed(() => {
  switch (props.color) {
    case 'none':
      return '';
    case 'sky':
      return 'text-sky-600 hover:bg-sky-50 hover:text-sky-700 focus:ring-sky-500 dark:hover:bg-sky-950 dark:hover:text-sky-500';
    case 'amber':
      return 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 focus:ring-amber-500 dark:hover:bg-amber-950 dark:hover:text-amber-500';
    case 'gray':
    default:
      return 'text-gray-600 hover:bg-gray-50 hover:text-gray-700 focus:ring-gray-500 dark:hover:bg-gray-950 dark:hover:text-gray-500';
  }
});
</script>
