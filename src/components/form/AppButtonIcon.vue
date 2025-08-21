<template>
  <button
    class="flex items-center justify-center overflow-hidden rounded-full p-1 text-gray-400 outline-none transition-all hover:bg-gray-200 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 active:bg-gray-300 active:text-gray-900 dark:hover:bg-gray-200/5 dark:hover:text-gray-100 dark:focus:ring-offset-slate-900 dark:active:bg-gray-200/15 dark:active:text-white"
    :disabled="loading"
    type="button">
    <LoadingSpinner v-if="loading" class="max-h-full max-w-full grow" :stroke-width="4" />
    <slot v-else>
      <SvgIcon aria-hidden="true" class="size-full grow" :path="icon" type="mdi" />
      <span v-if="$attrs.title" class="sr-only">{{ $attrs.title }}</span>
    </slot>
  </button>
</template>

<script setup lang="ts">
import LoadingSpinner from '../LoadingSpinner.vue';

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    required: true,
  },
});
</script>
