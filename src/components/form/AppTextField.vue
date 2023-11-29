<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="block text-sm font-medium text-gray-700" :for="id">
      {{ label }}
    </label>
    <div class="flex flex-row rounded-md shadow-sm">
      <slot name="before" />
      <div class="relative flex grow flex-row items-stretch gap-3">
        <slot name="prepend">
          <SvgIcon
            v-if="prependIcon"
            aria-hidden="true"
            :class="{
              ['pointer-events-none absolute inset-y-0 left-0 z-20 ml-3 h-full w-5 text-gray-400']: true,
              ['text-red-500']: isInvalid,
            }"
            :path="prependIcon"
            type="mdi" />
        </slot>
        <input
          :id="id"
          :aria-invalid="isInvalid"
          :autocomplete="autocomplete"
          :class="{
            ['block w-full rounded-md border-gray-300 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm']: true,
            ['rounded-none rounded-l-md']: slots.after,
            ['rounded-none rounded-r-md']: slots.before,
            ['pl-10']: slots.prepend || prependIcon,
            ['border-red-300 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500']:
              isInvalid,
          }"
          :name="name"
          :placeholder="placeholder"
          :required="required"
          :tabindex="tabindex"
          :type="type"
          :value="$attrs.modelValue"
          @blur="(event) => $emit('blur', event)"
          @input="
            (event) => $emit('update:modelValue', (event.currentTarget as HTMLInputElement).value)
          " />
        <slot name="append">
          <SvgIcon
            v-if="appendIcon"
            aria-hidden="true"
            class="pointer-events-none absolute inset-y-0 right-0 z-20 mr-3 h-full w-5 text-gray-400"
            :path="appendIcon"
            type="mdi" />
        </slot>
      </div>
      <slot name="after" />
    </div>

    <ul v-if="!hideDetails" class="min-h-[1.4rem] px-3 text-xs">
      <li v-if="!errors.length && hint">{{ hint }}</li>
      <li v-for="error in errors" :key="`error-${error}`" class="text-red-600">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useSlots, PropType, computed } from 'vue';

defineEmits(['blur', 'update:modelValue']);
const props = defineProps({
  label: {
    type: String,
    default: null,
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
    type: Array as PropType<String[]>,
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
  horizontal: {
    type: Boolean,
    default: false,
  },
  tabindex: {
    type: String,
    default: null,
  },
});

const slots = useSlots();

const isInvalid = computed(() => props.errors && props.errors.length > 0);
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
</style>
