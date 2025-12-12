<template>
  <AppTextField :id="id">
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>

    <template #default="{ isInvalid, prependIcon, appendIcon }">
      <textarea
        :id="id"
        v-model="text"
        :aria-invalid="isInvalid"
        :class="[
          `block min-h-24 w-full rounded-md border-gray-300 transition-colors
          placeholder:text-gray-400/80 focus:border-indigo-500 focus:ring-indigo-500
          disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50
          disabled:text-gray-500 sm:text-sm dark:border-gray-600 dark:bg-slate-800
          dark:text-gray-100 dark:disabled:border-gray-700 dark:disabled:bg-slate-700
          disabled:dark:text-gray-400`,
          ($slots.after || $slots.before) && 'rounded-none',
          !$slots.before && 'rounded-l-md',
          !$slots.after && 'rounded-r-md',
          ($slots.prepend || prependIcon) && 'pl-10',
          ($slots.append || appendIcon) && 'pr-10',
          isInvalid &&
            `border-red-500 text-red-900 placeholder:text-red-300 focus:border-red-500
            focus:ring-red-500 dark:border-red-500/50 dark:text-red-300
            dark:placeholder:text-red-300/50 dark:focus:border-red-600 dark:focus:ring-red-600`,
          inputClass,
        ]"
        :disabled="disabled"
        :name="name"
        :placeholder="placeholder"
        :readonly="readonly"
        :required="required"
        :rows="rows"
        :tabindex="tabindex"
        :type="type"
        @blur="(event) => $emit('blur', event)" />
    </template>
  </AppTextField>
</template>

<script setup lang="ts">
import AppTextField from './AppTextField.vue';
import { PropType } from 'vue';

const text = defineModel({
  type: String as PropType<string | null>,
  default: '',
});

defineEmits(['blur']);
defineProps({
  id: {
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
  readonly: {
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
  rows: {
    type: [String, Number],
    default: 3,
  },
  tabindex: {
    type: String,
    default: null,
  },
  inputClass: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
textarea[rows='3'] {
  field-sizing: content;
  height: max-content;
}
</style>
