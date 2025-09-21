<template>
  <ul :class="['min-h-[1.4rem] px-3 pt-0.5 text-xs']">
    <li v-if="!errors.length && hint" class="text-gray-500 dark:text-gray-400">
      {{ hint }}
    </li>
    <li
      v-for="error in uniq(compact(errors))"
      :key="`error-${error}`"
      class="text-red-600 dark:text-red-500/75">
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { compact, uniq } from 'lodash';
import { PropType, Ref } from 'vue';

export type ErrorMessage = string | Ref<string> | boolean | undefined | null;

defineProps({
  errors: {
    type: Array as PropType<ErrorMessage[]>,
    default: () => [],
  },
  hint: {
    type: String,
    default: '',
  },
});
</script>
