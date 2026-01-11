<template>
  <AppDialogConfirm
    v-model="isVisible"
    :icon="mdiAlertOutline"
    :title="$t('subscriptions.delete.title')"
    type="critical"
    @confirm="onDelete">
    <p class="mt-2 text-gray-500 sm:text-sm dark:text-gray-400">
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

    <template #confirm>
      <AppButtonPlain
        class="w-full sm:w-auto sm:text-sm dark:focus:ring-offset-neutral-800"
        color="red"
        :loading="state.isDeleting"
        type="submit">
        {{ $t('action.delete') }}
      </AppButtonPlain>
    </template>
  </AppDialogConfirm>
</template>

<script setup lang="ts">
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppTextareaField from '@/components/form/AppTextareaField.vue';
import AppDialogConfirm from '@/components/layout/AppDialogConfirm.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { deleteMemberSubscription, Subscription } from '@/services/api/subscriptions';
import { useNotificationsStore } from '@/store/notifications';
import { mdiAlertOutline } from '@mdi/js';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { computed, nextTick, PropType, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

const isVisible = defineModel({
  type: Boolean,
  default: false,
});

const emit = defineEmits(['deleted']);
const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
  subscriptionId: {
    type: String,
    required: true,
  },
  subscription: {
    type: Object as PropType<Subscription>,
    required: true,
  },
});

const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const state = reactive({
  comment: null as string | null,
  isDeleting: false,
});

const rules = computed(() => ({
  comment: { required: withAppI18nMessage(required) },
}));

const vuelidate = useVuelidate(rules, state, { $scope: 'subscriptions-delete' });

const onDelete = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }
  vuelidate.value.$reset();

  state.isDeleting = true;
  deleteMemberSubscription(props.memberId, props.subscriptionId, state.comment as string)
    .then(() => {
      notificationsStore.addSuccessNotification(i18n.t('subscriptions.delete.onDelete.success'));
      isVisible.value = false;
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
