<template>
  <RouterLink
    :aria-current="active ? 'page' : undefined"
    :class="[
      'group flex w-full flex-col items-center rounded-md p-3 text-xs font-medium no-underline transition-colors [corner-shape:squircle] active:bg-amber-700 dark:active:bg-amber-900/50',
      active
        ? 'bg-amber-600 text-white dark:bg-amber-900'
        : 'text-amber-100 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-900',
    ]"
    :to="to">
    <slot>
      <SvgIcon
        aria-hidden="true"
        :class="['size-6', active ? 'text-white' : 'text-amber-100 group-hover:text-white']"
        :path="icon"
        type="mdi" />
      <span class="mt-2">{{ label }}</span>
    </slot>
  </RouterLink>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { RouteLocationRaw } from 'vue-router';

defineProps({
  to: {
    type: Object as PropType<RouteLocationRaw>,
    required: true,
  },
  icon: {
    type: String,
    default: null,
  },
  label: {
    type: String,
    default: null,
  },
  active: {
    type: Boolean,
    default: false,
  },
});
</script>
