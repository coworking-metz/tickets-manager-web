<template>
  <div
    :class="[
      'flex gap-2',
      horizontal ? 'flex-row items-start' : 'max-w-xs flex-col items-center text-center',
    ]">
    <dotlottie-player
      autoplay="true"
      :class="[horizontal ? 'max-h-[12rem] w-auto max-w-[12rem]' : 'mb-6 h-64']"
      :loop="loop"
      :src="animation" />
    <div
      :class="['flex flex-col', horizontal ? 'my-auto items-start' : 'items-center text-center']">
      <slot name="title">
        <h3 v-if="title" class="whitespace-pre-line text-base font-medium text-gray-900">
          {{ title }}
        </h3>
      </slot>
      <slot name="description">
        <p v-if="description" class="mt-2 whitespace-pre-line text-sm text-gray-500">
          {{ description }}
        </p>
      </slot>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import EmptyBox from '@/assets/animations/empty-box.lottie';

defineProps({
  title: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  animation: {
    type: String,
    default: EmptyBox,
  },
  loop: {
    type: Boolean,
    default: false,
  },
  horizontal: {
    type: Boolean,
    default: false,
  },
});
</script>
