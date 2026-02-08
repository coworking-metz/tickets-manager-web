<template>
  <a
    v-if="href"
    :class="[
      `relative inline-flex min-h-10 justify-center gap-x-2 rounded-md px-4 py-2.5 font-medium
      transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none
      disabled:cursor-not-allowed sm:text-sm`,
      icon ? 'items-start text-left' : 'items-center text-center',
      loading && 'pointer-events-none',
    ]"
    :href="href"
    :target="target">
    <ButtonContent :icon="icon" :loading="loading">
      <slot />
    </ButtonContent>
  </a>
  <RouterLink
    v-else-if="to"
    :class="[
      `relative inline-flex min-h-10 justify-center gap-x-2 rounded-md px-4 py-2.5 font-medium
      transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none
      sm:text-sm`,
      icon ? 'items-start text-left' : 'items-center text-center',
      loading && 'pointer-events-none',
    ]"
    :to="to">
    <ButtonContent :icon="icon" :loading="loading">
      <slot />
    </ButtonContent>
  </RouterLink>
  <button
    v-else
    :class="[
      `relative inline-flex min-h-10 justify-center gap-x-2 rounded-md px-4 py-2.5 font-medium
      transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none
      sm:text-sm`,
      icon ? 'items-start text-left' : 'items-center text-center',
      loading && 'pointer-events-none',
    ]"
    :disabled="loading || disabled"
    :type="type">
    <ButtonContent :icon="icon" :loading="loading">
      <slot />
    </ButtonContent>
  </button>
</template>

<script setup lang="ts">
import ButtonContent from './ButtonContent.vue';
import { buttonProps } from './buttonProps';

defineProps(buttonProps);
</script>
