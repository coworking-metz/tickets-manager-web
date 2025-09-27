<template>
  <div
    class="relative size-12 overflow-hidden rounded-full bg-slate-200 text-base dark:bg-slate-800"
    role="figure">
    <img
      v-if="thumbnail && !state.hasFailedLoadingThumbnail"
      class="size-full object-cover object-center"
      loading="lazy"
      :src="thumbnail"
      :title="`${$t('members.detail.profile.picture.label')} - ${name || email}`"
      @error="onLoadingThumbnailFail"
      @load="state.isLoadingThumbnail = false"
      @loadstart="state.isLoadingThumbnail = true" />
    <span
      v-if="(name || email) && (state.hasFailedLoadingThumbnail || state.isLoadingThumbnail)"
      class="absolute inset-0 flex items-center justify-center font-medium text-gray-900 dark:text-gray-100">
      {{ getInitials(name, email) }}
    </span>
    <LoadingSpinner v-if="thumbnail && state.isLoadingThumbnail" class="absolute inset-0" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { getInitials } from '@/helpers/text';
import { reactive } from 'vue';

defineProps({
  name: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    default: null,
  },
  thumbnail: {
    type: String,
    default: null,
  },
});

const state = reactive({
  isLoadingThumbnail: true,
  hasFailedLoadingThumbnail: false,
});

const onLoadingThumbnailFail = () => {
  state.isLoadingThumbnail = false;
  state.hasFailedLoadingThumbnail = true;
};
</script>
