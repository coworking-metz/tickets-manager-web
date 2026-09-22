<template>
  <AppNumericField input-class="!pr-8" :options="amountOptions" v-bind="$attrs">
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>

    <template #append>
      <span
        class="pointer-events-none absolute inset-y-0 right-0 z-20 flex w-6 items-center text-gray-500 sm:text-sm dark:text-gray-400">
        {{ getCurrencySymbol($i18n.locale) }}
      </span>
    </template>
  </AppNumericField>
</template>

<script lang="ts" setup>
import AppNumericField from './AppNumericField.vue';
import { getCurrencySymbol } from '@/helpers/currency';

import { computed } from 'vue';

const props = defineProps({
  required: {
    type: Boolean,
    default: false,
  },
});

const amountOptions = computed(() => ({
  allowDecimalPadding: 'floats',
  emptyInputBehavior: props.required ? 'zero' : 'null',
  modifyValueOnWheel: false,
  decimalPlaces: 2,
  decimalCharacter: ',',
  decimalCharacterAlternative: '.',
  digitGroupSeparator: ' ',
}));
</script>
