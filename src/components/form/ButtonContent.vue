<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <template v-if="icon">
    <LoadingSpinner v-if="loading" class="size-5 shrink-0" :stroke-width="4" />
    <SvgIcon v-else aria-hidden="true" class="size-5 shrink-0" :path="icon" type="mdi" />
    <slot />
  </template>
  <template v-else>
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center rounded-md backdrop-blur-md">
      <LoadingSpinner aria-hidden="true" class="size-5" :stroke-width="4" />
    </div>

    <slot />
  </template>
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

<style scoped>
.single-spinner ~ * {
  opacity: 0;
}
</style>
