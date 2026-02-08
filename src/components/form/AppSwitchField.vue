<template>
  <SwitchGroup class="flex items-center justify-between gap-4">
    <div class="flex flex-col">
      <SwitchLabel as="p" class="font-medium text-gray-900 sm:text-sm dark:text-gray-100" passive>
        {{ label }}
      </SwitchLabel>
      <SwitchDescription class="whitespace-pre-line text-sm text-gray-500 dark:text-neutral-400">
        {{ description }}
      </SwitchDescription>
    </div>
    <LoadingSpinner v-if="loading" class="h-6 w-11 shrink-0" />
    <Switch
      v-else
      v-model="isActivated"
      :class="[
        'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-neutral-800',
        isActivated ? 'bg-teal-500 dark:bg-teal-600' : 'bg-gray-200 dark:bg-gray-600',
      ]"
      :disabled="disabled">
      <span
        aria-hidden="true"
        :class="[
          isActivated ? 'translate-x-5' : 'translate-x-0',
          'inline-block size-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
        ]" />
    </Switch>
  </SwitchGroup>
</template>

<script setup lang="ts">
import LoadingSpinner from '../LoadingSpinner.vue';
import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from '@headlessui/vue';

const isActivated = defineModel({
  type: Boolean,
  default: false,
});

defineProps({
  label: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>
