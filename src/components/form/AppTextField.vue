<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="block text-sm font-medium text-gray-700" :for="id">
      {{ label }}
    </label>
    <div class="flex rounded-md shadow-sm">
      <slot name="before" />
      <div class="relative flex grow items-stretch">
        <slot name="prepend" />
        <input
          :id="id"
          :autocomplete="autocomplete"
          :class="{
            ['block w-full rounded-md border-gray-300 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm']: true,
            ['rounded-none rounded-l-md']: slots.append,
            ['rounded-none rounded-r-md']: slots.prepend,
          }"
          :name="name"
          :required="required"
          :type="type"
          :value="$attrs.modelValue"
          @blur="(event) => $emit('blur', event)"
          @input="
            (event) => $emit('update:modelValue', (event.currentTarget as HTMLInputElement).value)
          " />
        <slot name="append" />
      </div>
      <slot name="after" />
    </div>

    <ul class="min-h-[1.4rem]">
      <li v-for="error in errors" :key="`error-${error}`" class="text-sm text-red-600">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useSlots } from 'vue';
import { PropType } from 'vue';

defineEmits(['blur', 'update:modelValue']);
defineProps({
  label: {
    type: String,
    default: null,
  },
  id: {
    type: String,
    default: '',
  },
  autocomplete: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  errors: {
    type: Array as PropType<String[]>,
    default: () => [],
  },
});

const slots = useSlots();
</script>
