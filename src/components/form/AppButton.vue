<template>
  <button
    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    :disabled="loading">
    <LoadingSpinner v-if="loading" class="mr-2 h-5 w-5" />
    <SvgIcon
      v-else-if="icon"
      aria-hidden="true"
      class="mr-2 h-5 w-5 text-white"
      :path="icon"
      type="mdi" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue';
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: null,
  },
});
</script>
