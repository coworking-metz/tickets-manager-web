<template>
  <section class="flex flex-col items-start">
    <slot name="title">
      <h2 v-if="title" class="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {{ title }}
      </h2>
    </slot>

    <AppDivider class="my-3 w-full" />

    <div class="flex w-full flex-row flex-wrap gap-3">
      <aside class="flex min-w-48 shrink grow basis-0 flex-col">
        <slot name="description">
          <p
            v-if="description"
            class="mt-1 whitespace-pre-line text-sm text-gray-500 dark:text-gray-400">
            {{ description }}
          </p>
        </slot>
      </aside>
      <div class="flex w-full max-w-2xl shrink-0 grow flex-col">
        <slot />
      </div>
      <aside class="relative flex min-w-48 shrink grow basis-0 flex-row flex-wrap">
        <!-- one hell of a trick -->
        <div class="mr-3 max-h-0 min-w-48 shrink grow basis-0" />
        <div class="size-full max-w-2xl shrink-0 grow">
          <slot name="append" />
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import AppDivider from '@/components/layout/AppDivider.vue';

defineProps({
  title: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
});
</script>
