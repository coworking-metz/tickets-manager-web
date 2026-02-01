<template>
  <div class="flex flex-col items-start">
    <slot :for-id="id" :label="label" name="label" :optional="optional">
      <label
        v-if="label"
        class="block font-medium text-gray-900 sm:text-sm dark:text-gray-100"
        :for="id">
        {{
          [label, optional && `(${$t('validations.optional').toLocaleLowerCase()})`]
            .filter(Boolean)
            .join(' ')
        }}
      </label>
    </slot>
    <slot :description="description" name="description">
      <span v-if="description" class="text-sm text-slate-500 dark:text-slate-400">
        {{ description }}
      </span>
    </slot>
    <div class="flex flex-row self-stretch rounded-md">
      <slot name="before" />
      <div
        :class="[
          'group relative flex grow flex-row items-stretch gap-3',
          (label || description) && 'mt-1',
        ]">
        <slot :is-invalid="isInvalid" name="prepend">
          <SvgIcon
            v-if="prependIcon"
            aria-hidden="true"
            :class="[
              'pointer-events-none absolute inset-y-0 left-0 z-[11] ml-3 min-h-10 w-5 text-gray-400',
              isInvalid && 'text-red-500',
            ]"
            :path="prependIcon"
            type="mdi" />
        </slot>
        <slot :append-icon="appendIcon" :is-invalid="isInvalid" :prepend-icon="prependIcon">
          <input
            :id="id"
            :aria-invalid="isInvalid"
            :autocomplete="autocomplete"
            :class="[
              `block min-h-10 w-full rounded-md border-gray-300 shadow-sm transition-colors
              placeholder:text-gray-400/80 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500
              disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-stone-500
              sm:text-sm dark:border-stone-700 dark:bg-zinc-900 dark:text-gray-100 dark:disabled:border-stone-700 dark:disabled:bg-zinc-900/80
              disabled:dark:text-gray-400`,
              (slots.after || slots.before) && 'rounded-none',
              !slots.before && 'rounded-l-md',
              !slots.after && 'rounded-r-md',
              (slots.prepend || prependIcon) && 'pl-10',
              (slots.append || appendIcon) && 'pr-10',
              type === 'number' && 'pr-3 text-right',
              isInvalid &&
                `border-red-500 text-red-900 placeholder:text-red-300 focus:border-red-500
                focus:ring-red-500 dark:border-red-500/50 dark:text-red-300
                dark:placeholder:text-red-300/50 dark:focus:border-red-600 dark:focus:ring-red-600`,
              inputClass,
            ]"
            :disabled="disabled"
            :max="max"
            :maxlength="maxLength"
            :min="min"
            :name="name"
            :pattern="pattern"
            :placeholder="placeholder"
            :readonly="readonly"
            :required="required"
            :step="step"
            :tabindex="tabindex"
            :type="type"
            :value="modelValue"
            @blur="(event) => emit('blur', event)"
            @input="
              (event) => emit('update:modelValue', (event.currentTarget as HTMLInputElement).value)
            " />
        </slot>
        <AppButtonIcon
          v-if="modelValue && clearable"
          :class="[
            `absolute top-1/2 z-10 size-7 -translate-y-1/2 bg-white opacity-0 backdrop-blur-md transition-opacity
            focus:opacity-100 group-hover:opacity-100 dark:bg-neutral-800/10`,
            $slots.append || appendIcon ? 'right-9' : 'right-2',
          ]"
          :icon="mdiClose"
          :title="$t('action.clear')"
          @click.prevent.stop="onClear" />

        <slot name="append">
          <SvgIcon
            v-if="appendIcon"
            aria-hidden="true"
            class="pointer-events-none absolute inset-y-0 right-0 z-[11] mr-3 min-h-10 w-5 text-gray-400"
            :path="appendIcon"
            type="mdi" />
        </slot>

        <LoadingProgressBar v-if="loading" class="absolute inset-x-1 bottom-0 h-px" />
      </div>
      <slot name="after" />
    </div>

    <slot name="hint">
      <AppFieldHint v-if="!hideDetails" :errors="errors" :hint="hint" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import AppButtonIcon from './AppButtonIcon.vue';
import AppFieldHint from './AppFieldHint.vue';
import { ErrorMessage } from './AppFieldHint.vue';
import LoadingProgressBar from '../LoadingProgressBar.vue';
import { mdiClose } from '@mdi/js';
import { useSlots, PropType, computed } from 'vue';

const emit = defineEmits(['blur', 'update:modelValue', 'clear']);
const props = defineProps({
  modelValue: {
    type: [String, Number] as PropType<String | Number | null>,
    default: null,
  },
  label: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: null,
  },
  autocomplete: {
    type: String,
    default: null,
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: null,
  },
  errors: {
    type: Array as PropType<ErrorMessage[]>,
    default: () => [],
  },
  prependIcon: {
    type: String,
    default: '',
  },
  appendIcon: {
    type: String,
    default: '',
  },
  hideDetails: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: '',
  },
  tabindex: {
    type: String,
    default: null,
  },
  step: {
    type: [String, Number],
    default: null,
  },
  min: {
    type: [String, Number],
    default: null,
  },
  max: {
    type: [String, Number],
    default: null,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  optional: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  maxLength: {
    type: [String, Number],
    default: null,
  },
  pattern: {
    type: String,
    default: null,
  },
  inputClass: {
    type: String,
    default: '',
  },
});

const slots = useSlots();

const isInvalid = computed(
  () => props.invalid || (props.errors && props.errors.filter(Boolean).length > 0),
);

const onClear = () => {
  emit('clear');
  emit('update:modelValue', null);
};
</script>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

input[type='search']::-webkit-search-decoration,
input[type='search']::-webkit-search-cancel-button,
input[type='search']::-webkit-search-results-button,
input[type='search']::-webkit-search-results-decoration {
  -webkit-appearance: none;
}
</style>
