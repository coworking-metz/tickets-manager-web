<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div class="relative flex flex-col items-center justify-center">
    <div
      class="ring-circle absolute size-full rounded-full"
      :style="`--value: ${progress}; --thickness: ${thickness};`" />
    <slot />
  </div>
</template>

<script setup lang="ts">
// https://stackoverflow.com/a/79103802
defineProps({
  progress: {
    type: Number,
    default: 0,
  },
  thickness: {
    type: String,
    default: '0.3rem',
  },
});
</script>

<style>
.ring-circle {
  background: conic-gradient(
    var(--progress-color, currentColor) calc(var(--value) * 1%),
    var(--mask-color, #e5e7eb) 0
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - var(--thickness)),
    white calc(100% - var(--thickness) + 1px)
  );
}
</style>
