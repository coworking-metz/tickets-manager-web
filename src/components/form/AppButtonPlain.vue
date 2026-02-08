<template>
  <AppButton
    :class="['shadow-sm outline-none transition-all', colors, $attrs.disabled && 'opacity-50']"
    v-bind="props">
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
    type: String as PropType<'indigo' | 'red' | 'amber' | 'gray' | 'emerald' | 'blue' | 'neutral'>,
    default: 'neutral',
  },
});

const colors = computed(() => {
  switch (props.color) {
    case 'indigo':
      return 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-500';
    case 'amber':
      return 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 focus:ring-amber-500';
    case 'red':
      return 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500';
    case 'emerald':
      return 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500';
    case 'blue':
      return 'bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 focus:ring-sky-500';
    case 'neutral':
      return 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500 border border-gray-300 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700/50 dark:active:bg-neutral-700/80 dark:focus:ring-neutral-700 dark:border-neutral-600';
    default:
      return 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400 border border-gray-300 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700/50 dark:active:bg-zinc-700/80 dark:border-neutral-600';
  }
});
</script>
