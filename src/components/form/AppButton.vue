<template>
  <button
    class="inline-flex items-center justify-center rounded-md px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm"
    :disabled="loading"
    :type="type">
    <LoadingSpinner v-if="loading" class="mr-2 size-5" />
    <SvgIcon v-else-if="icon" aria-hidden="true" class="mr-2 size-5" :path="icon" type="mdi" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { PropType } from 'vue';

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: null,
  },
  type: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: 'button',
  },
});
</script>
