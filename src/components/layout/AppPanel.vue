<template>
  <component :is="tag" class="overflow-hidden rounded-lg shadow" v-bind="$attrs">
    <slot name="header">
      <header
        v-if="title || $slots['title:append']"
        class="flex flex-row items-start justify-between gap-3 border-b border-gray-200 bg-white px-4 py-5 transition-colors sm:p-6 dark:border-neutral-700 dark:bg-neutral-800">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
          {{ title }}
        </h3>

        <slot name="title:append" />
      </header>
    </slot>

    <slot name="body">
      <div
        :class="[
          'grow bg-white px-4 py-5 transition-colors sm:p-6 dark:bg-neutral-800',
          bodyClass,
        ]">
        <slot />
      </div>
    </slot>

    <footer
      v-if="$slots.footer"
      class="flex flex-row gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 dark:border-neutral-950 dark:bg-neutral-800/50">
      <slot name="footer" />
    </footer>
  </component>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

defineProps({
  tag: {
    type: String as PropType<keyof HTMLElementTagNameMap>,
    default: 'section',
  },
  title: {
    type: String,
    default: '',
  },
  bodyClass: {
    type: String,
    default: '',
  },
});
</script>
