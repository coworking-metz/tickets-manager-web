<template>
  <div class="relative size-12 rounded-full bg-slate-200" role="figure">
    <img
      v-if="thumbnail && !state.hasFailedLoadingThumbnail"
      :alt="`${$t('members.detail.profile.picture.label')} - ${name || email}`"
      class="size-full rounded-full object-cover object-top"
      loading="lazy"
      :src="thumbnail"
      @error="onLoadingThumbnailFail"
      @load="state.isLoadingThumbnail = false"
      @loadstart="state.isLoadingThumbnail = true" />
    <span
      v-if="(name || email) && (state.hasFailedLoadingThumbnail || state.isLoadingThumbnail)"
      class="absolute inset-0 flex items-center justify-center text-base font-medium text-gray-900">
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
