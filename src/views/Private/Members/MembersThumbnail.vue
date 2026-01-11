<template>
  <div
    ref="thumbnailRef"
    class="relative size-12 overflow-hidden rounded-full bg-slate-200 dark:bg-stone-700"
    role="figure">
    <img
      v-if="state.shouldLoadThumbnail"
      class="size-full object-cover object-center"
      loading="lazy"
      :src="thumbnail"
      :title="`${$t('members.detail.profile.picture.label')} - ${name || email}`"
      @error="onLoadingThumbnailFail"
      @load="state.isLoadingThumbnail = false"
      @loadstart="state.isLoadingThumbnail = true" />
    <span
      v-if="areInitialsVisible"
      class="absolute inset-0 flex items-center justify-center font-medium text-gray-900 dark:text-gray-100">
      {{ initials }}
    </span>
    <LoadingSpinner v-if="state.isLoadingThumbnail" class="absolute inset-0" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { getInitials } from '@/helpers/text';
import { useElementVisibility } from '@vueuse/core';
import { computed, reactive, ref, watch } from 'vue';

const props = defineProps({
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
  shouldLoadThumbnail: false,
});

const onLoadingThumbnailFail = () => {
  state.isLoadingThumbnail = false;
  state.hasFailedLoadingThumbnail = true;
};

const thumbnailRef = ref<HTMLElement | null>(null);
const isPartiallyVisible = useElementVisibility(thumbnailRef, {
  threshold: 0.1, // 10% visible
});

const initials = computed(() => getInitials(props.name, props.email));

const areInitialsVisible = computed(() => {
  return (
    initials.value &&
    (!state.shouldLoadThumbnail || state.hasFailedLoadingThumbnail || state.isLoadingThumbnail)
  );
});

watch(
  [isPartiallyVisible, () => props.thumbnail, () => state.hasFailedLoadingThumbnail],
  ([isVisible, thumbnail, hasFailedLoadingThumbnail]) => {
    if (isVisible) {
      if (!state.shouldLoadThumbnail && thumbnail && !hasFailedLoadingThumbnail) {
        state.shouldLoadThumbnail = true;
      } else {
        state.isLoadingThumbnail = false;
      }
    }
  },
  { immediate: true },
);
</script>
