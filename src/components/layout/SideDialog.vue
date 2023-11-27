<template>
  <TransitionRoot as="template" :show="modelValue">
    <Dialog as="div" class="relative z-50" @close="$emit('update:model-value', false)">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/30" />
      </TransitionChild>
      <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
        <TransitionChild
          as="template"
          enter="transform transition ease-in-out duration-500"
          enter-from="translate-x-full"
          enter-to="translate-x-0"
          leave="transform transition ease-in-out duration-500"
          leave-from="translate-x-0"
          leave-to="translate-x-full">
          <DialogPanel class="pointer-events-auto w-screen max-w-md">
            <slot />
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
<script lang="ts" setup>
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';

defineEmits(['update:model-value']);
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
</script>
