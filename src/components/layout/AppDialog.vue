<template>
  <TransitionRoot appear as="template" :show="isVisible" v-bind="$attrs">
    <Dialog as="div" class="relative z-50" @close="!static ? (isVisible = false) : null">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition dark:bg-black/80" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 flex flex-col overflow-y-auto sm:p-6">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95">
            <slot name="dialog">
              <DialogPanel
                :class="[
                  `mx-auto max-h-full w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl
                  ring-1 ring-black/5 transition-all dark:border dark:border-gray-700 dark:bg-neutral-800`,
                  dialogClass,
                ]">
                <slot />
              </DialogPanel>
            </slot>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';

const isVisible = defineModel({
  type: Boolean,
  default: false,
});

defineProps({
  static: {
    type: Boolean,
    default: false,
  },
  dialogClass: {
    type: String,
    default: '',
  },
});
</script>
