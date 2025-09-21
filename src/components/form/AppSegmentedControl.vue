<template>
  <RadioGroup :id="id" as="ul" class="flex flex-col overflow-x-hidden">
    <RadioGroupLabel v-if="label" class="mb-1 font-medium text-gray-900 sm:text-sm" :for="id">
      {{ label }}
    </RadioGroupLabel>
    <ul
      class="flex w-full flex-row gap-1 overflow-x-auto rounded-lg bg-slate-100 p-0.5 transition-colors dark:bg-slate-700">
      <RadioGroupOption
        v-for="option in options"
        :key="`activity-option-${option}`"
        as="li"
        :disabled="disabled"
        :value="option"
        v-slot="{ checked }">
        <button
          :class="[
            `flex items-center rounded-md py-2 pl-2.5 pr-3.5 text-sm font-medium transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500
            focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100`,
            checked
              ? 'bg-white shadow-sm ring-1 ring-black ring-opacity-[5%] dark:bg-neutral-800'
              : 'hover:bg-white dark:hover:bg-neutral-800/80',
          ]"
          type="button">
          <RadioGroupLabel
            as="span"
            :class="[
              'text-gray-600 group-hover:text-gray-900 dark:text-gray-100',
              checked && 'text-gray-900 dark:text-gray-100',
            ]">
            {{ format(option) }}
          </RadioGroupLabel>
        </button>
      </RadioGroupOption>
    </ul>

    <slot name="hint">
      <AppFieldHint v-if="!hideDetails" :errors="errors" :hint="hint" />
    </slot>
  </RadioGroup>
</template>

<script setup lang="ts">
import { ErrorMessage } from './AppFieldHint.vue';
import AppFieldHint from '@/components/form/AppFieldHint.vue';
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue';
import { PropType } from 'vue';

defineEmits(['input']);

defineProps({
  value: {
    type: Object as PropType<any>,
    default: null,
  },
  options: {
    type: Array as PropType<any>,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  format: {
    type: Function as PropType<(value: any) => string>,
    default: (value: any) => JSON.stringify(value),
  },
  errors: {
    type: Array as PropType<ErrorMessage[]>,
    default: () => [],
  },
  hideDetails: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: '',
  },
});
</script>
