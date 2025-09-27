<template>
  <RadioGroup :id="id" :aria-invalid="isInvalid" as="ul" class="flex flex-col">
    <RadioGroupLabel class="font-medium text-gray-900 sm:text-sm dark:text-gray-100" :for="id">
      {{ label }}
    </RadioGroupLabel>
    <RadioGroupDescription class="text-sm text-slate-500 dark:text-slate-400">
      {{ description }}
    </RadioGroupDescription>
    <ul class="mt-1 flex flex-col -space-y-px rounded-md bg-white dark:bg-neutral-800">
      <RadioGroupOption
        v-for="(option, index) in options"
        :key="`activity-option-${option}`"
        as="li"
        class="focus-visible:outline-none focus-visible:ring-0"
        :disabled="disabled"
        :value="option"
        v-slot="{ active, checked }">
        <div
          :class="[
            'relative flex flex-col border p-4 transition-colors focus:outline-none md:pl-4 md:pr-6',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            index === 0 && 'rounded-t-md',
            index === options.length - 1 && 'rounded-b-md',
            checked
              ? 'z-10 border-orange-200 bg-orange-50 dark:border-stone-700 dark:bg-orange-950'
              : 'border-gray-200 dark:border-stone-700',
            isInvalid &&
              `border-red-300 text-red-900 placeholder:text-red-300 focus:border-red-500
              focus:ring-red-500 dark:border-red-500/50 dark:text-red-300
              dark:placeholder:text-red-300/50 dark:focus:border-red-600`,
          ]">
          <span class="flex items-center sm:text-sm">
            <span
              aria-hidden="true"
              :class="[
                `flex size-4 shrink-0 items-center justify-center rounded-full border
                transition-all`,
                checked
                  ? 'border-transparent bg-orange-500'
                  : 'border-gray-300 bg-white dark:border-stone-600 dark:bg-neutral-800',
                active && 'ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-orange-950',
                active && isInvalid && 'ring-2 ring-red-300 ring-offset-2 dark:ring-red-500',
              ]">
              <span v-if="checked" class="size-1.5 rounded-full bg-white dark:bg-neutral-800" />
            </span>
            <RadioGroupLabel
              as="span"
              class="ml-3 shrink grow basis-0 truncate whitespace-pre-line font-medium text-gray-800 dark:text-gray-100">
              {{ format(option) }}
            </RadioGroupLabel>
          </span>
        </div>
      </RadioGroupOption>
    </ul>

    <slot name="hint">
      <AppFieldHint v-if="!hideDetails" :errors="errors" :hint="hint" />
    </slot>
  </RadioGroup>
</template>

<script setup lang="ts">
import AppFieldHint, { ErrorMessage } from './AppFieldHint.vue';
import {
  RadioGroup,
  RadioGroupDescription,
  RadioGroupLabel,
  RadioGroupOption,
} from '@headlessui/vue';
import { PropType, computed } from 'vue';

defineEmits(['input']);

const props = defineProps({
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
  description: {
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

const isInvalid = computed(() => props.errors && props.errors.filter(Boolean).length > 0);
</script>
