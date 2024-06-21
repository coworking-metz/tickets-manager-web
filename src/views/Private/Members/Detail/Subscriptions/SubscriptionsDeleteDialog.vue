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
              as="form"
              class="relative overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
              @submit.prevent="onDelete">
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
                  <div class="mt-2 sm:ml-4">
                    <DialogTitle
                      as="h3"
                      class="text-lg font-medium leading-6 text-gray-900 max-sm:text-center">
                      {{ $t('subscriptions.delete.title') }}
                    </DialogTitle>
                    <p class="mt-2 text-gray-500 sm:text-sm">
                      {{ $t('subscriptions.delete.description') }}
                    </p>

                    <AppTextareaField
                      id="comment"
                      v-model="state.comment"
                      class="mt-4"
                      :errors="vuelidate.comment.$errors.map(({ $message }) => $message as string)"
                      :label="$t('subscriptions.delete.comment.label')"
                      :placeholder="$t('subscriptions.delete.comment.placeholder')"
                      required />
                  </div>
                </div>
              </div>
              <div
                class="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row-reverse sm:px-6">
                <AppButton
                  class="w-full border border-transparent bg-red-600 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:ring-red-500 sm:w-auto sm:text-sm"
                  :loading="state.isDeleting"
                  type="submit">
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
import AppTextareaField from '@/components/form/AppTextareaField.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { deleteMemberSubscription } from '@/services/api/subscriptions';
import { useNotificationsStore } from '@/store/notifications';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { mdiAlertOutline } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { computed, nextTick, reactive } from 'vue';
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
  subscriptionId: {
    type: String,
    required: true,
  },
});

const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const queryClient = useQueryClient();
const state = reactive({
  comment: null as string | null,
  isDeleting: false,
});

const rules = computed(() => ({
  comment: { required: withAppI18nMessage(required) },
}));

const vuelidate = useVuelidate(rules, state);

const onDelete = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }

  state.isDeleting = true;
  deleteMemberSubscription(props.memberId, props.subscriptionId, state.comment as string)
    .then(() => {
      notificationsStore.addNotification({
        type: 'success',
        message: i18n.t('subscriptions.delete.onDelete.success'),
        timeout: 3_000,
      });
      queryClient.invalidateQueries({
        queryKey: ['members', computed(() => props.memberId), 'history'],
      });
      queryClient.invalidateQueries({
        queryKey: ['members', computed(() => props.memberId), 'subscriptions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['members', computed(() => props.memberId), 'activity'],
      });
      emit('update:modelValue', false);
      emit('deleted');
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(error, i18n.t('subscriptions.delete.onDelete.fail'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isDeleting = false;
    });
};
</script>
