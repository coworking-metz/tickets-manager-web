<template>
  <TransitionRoot as="template" :show="modelValue">
    <Dialog as="div" class="relative z-50" @close="$emit('update:modelValue', false)">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-[75%] transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
              class="relative overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div
                    class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                    <SvgIcon
                      aria-hidden="true"
                      class="size-6 text-red-600"
                      :path="mdiAlertOutline"
                      type="mdi" />
                  </div>
                  <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                      {{ $t('tickets.delete.title') }}
                    </DialogTitle>
                    <div class="mt-2">
                      <p class="text-gray-500 sm:text-sm">
                        {{ $t('tickets.delete.description') }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row-reverse sm:px-6">
                <AppButton
                  class="w-full border border-transparent bg-red-600 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:ring-red-500 sm:w-auto sm:text-sm"
                  :loading="state.isDeleting"
                  type="button"
                  @click="onDelete">
                  {{ $t('action.delete') }}
                </AppButton>
                <AppButton
                  class="w-full border border-gray-300 bg-white text-base text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-gray-400 sm:w-auto sm:text-sm"
                  type="button"
                  @click="$emit('update:modelValue', false)">
                  {{ $t('action.close') }}
                </AppButton>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import AppButton from '@/components/form/AppButton.vue';
import { handleSilentError } from '@/helpers/errors';
import { deleteMemberTicket } from '@/services/api/tickets';
import { useNotificationsStore } from '@/store/notifications';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { mdiAlertOutline } from '@mdi/js';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['update:modelValue', 'deleted']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  memberId: {
    type: String,
    required: true,
  },
  ticketId: {
    type: String,
    required: true,
  },
});

const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const state = reactive({
  isDeleting: false,
});

const onDelete = () => {
  state.isDeleting = true;
  deleteMemberTicket(props.memberId, props.ticketId)
    .then(() => {
      notificationsStore.addNotification({
        type: 'success',
        message: i18n.t('tickets.delete.onDelete.success'),
        timeout: 3_000,
      });
      emit('update:modelValue', false);
      emit('deleted');
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(error, i18n.t('tickets.delete.onDelete.fail'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isDeleting = false;
    });
};
</script>
