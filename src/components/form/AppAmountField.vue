<template>
  <AppTextField input-class="!pr-8" inputmode="numeric" type="number" v-bind="$attrs">
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>

    <template #append>
      <span
        class="pointer-events-none absolute inset-y-0 right-0 z-20 flex w-6 items-center text-gray-500 sm:text-sm dark:text-gray-400">
        {{ getCurrencySymbol($i18n.locale) }}
      </span>
    </template>
  </AppTextField>
</template>

<script lang="ts" setup>
import AppTextField from './AppTextField.vue';
import { getCurrencySymbol } from '@/helpers/currency';
</script>
