<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <RouterLink
    :aria-current="active ? 'page' : undefined"
    :class="[
      'navigation-drawer-link',
      'group flex w-full flex-col items-center rounded-xl p-3 text-xs font-medium no-underline outline-none transition-colors focus:ring-2 focus:ring-white  focus:ring-offset-amber-600 active:bg-amber-700 dark:active:bg-amber-950/50',
      active
        ? 'bg-amber-600 text-white dark:bg-amber-950/80'
        : 'text-amber-100 hover:bg-amber-600 hover:text-white dark:text-zinc-200 dark:hover:bg-amber-950/80',
    ]"
    :to="to">
    <slot>
      <AppIcon
        :class="[
          'size-6 transition-colors',
          active ? 'text-white' : 'text-amber-100 group-hover:text-white dark:text-zinc-200',
        ]"
        :icon="icon" />
      <span class="mt-2">{{ label }}</span>
    </slot>
  </RouterLink>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue';
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

<style scoped>
@supports (corner-shape: squircle) {
  .navigation-drawer-link {
    corner-shape: squircle;
    border-radius: 9999px;
  }
}
</style>
