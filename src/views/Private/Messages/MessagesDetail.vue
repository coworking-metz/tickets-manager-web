<template>
  <article class="flex max-h-[1280px] grow flex-row flex-wrap pb-12 xl:pt-8">
    <form class="flex shrink grow basis-0 flex-col sm:min-w-[480px]" @submit.prevent="onSubmit">
      <!-- <pre>{{ JSON.stringify(message, null, 2) }}</pre> -->

      <AppTextField
        disabled
        :label="$t('messages.detail.from.label')"
        readonly
        :value="message?.fromMemberId" />

      <AppTextField id="title" v-model="state.title" :label="$t('messages.detail.title.label')" />

      <AppDateField
        v-model="state.published"
        :label="$t('messages.detail.published.label')"
        name="published"
        with-time />

      <MembersSelect :label="$t('messages.detail.recipients.label')" />

      <AppMarkdownComposer
        v-model="state.body"
        :errors="vuelidate.body.$errors.map(({ $message }) => $message as string)"
        :label="$t('messages.detail.body.label')"
        required />

      <div class="mt-1 flex flex-row justify-between gap-3">
        <AppButtonPlain
          class="dark:focus:ring-offset-neutral-800"
          color="indigo"
          :icon="mdiCheck"
          :loading="state.isSubmitting"
          type="submit">
          {{ $t('action.edit') }}
        </AppButtonPlain>

        <AppButtonOutline
          class="bg-white dark:bg-neutral-800 dark:focus:ring-offset-neutral-800"
          color="red"
          :icon="mdiDeleteOutline"
          @click.prevent="state.isDeleteDialogVisible = true">
          {{ $t('action.delete') }}
        </AppButtonOutline>
      </div>
    </form>

    <aside class="flex min-w-96 shrink grow basis-0 flex-col items-stretch gap-3">
      <ol class="grow overflow-y-auto" role="list">
        <template v-if="isPendingMessage">
          <li v-for="index in 2" :key="`loading-event-${index}`">
            <MessagesAcknowledgment loading />
          </li>
        </template>
        <EmptyState
          v-else-if="!message?.to.length"
          class="m-auto py-6"
          :title="$t('audit.list.empty.title')" />
        <li v-else v-for="(ack, index) in message?.to" :key="`ack-${index}`">
          <MessagesAcknowledgment
            :ack="ack"
            :loading="isFetchingMessage"
            :with-timeline="index !== message.to.length - 1" />
        </li>
      </ol>
    </aside>

    <!-- <ul class="grow overflow-y-auto" role="list">
        <template v-if="isPendingHistory">
          <li v-for="index in 10" :key="`loading-event-${index}`">
            <AuditEntry loading />
          </li>
        </template>
        <ErrorState
          v-else-if="historyErrorText"
          class="m-auto"
          :description="historyErrorText"
          :title="$t('audit.list.onFetch.fail')" />
        <EmptyState
          v-else-if="!history?.length"
          class="m-auto py-6"
          :title="$t('audit.list.empty.title')" />
        <li v-else v-for="(event, eventIndex) in history" :key="`event-${event._id}`">
          <AuditEntry
            :event="event"
            :loading="isFetchingHistory"
            :with-timeline="eventIndex !== history.length - 1" />
        </li>
      </ul> -->

    <AppDialogConfirm
      v-model="state.isDeleteDialogVisible"
      :icon="mdiAlertOutline"
      :title="
        $t('messages.delete.title', {
          title: message?.title,
        })
      "
      type="critical"
      @confirm="onDelete">
      <p class="mt-2 whitespace-pre-line text-gray-500 sm:text-sm dark:text-gray-400">
        {{ $t('messages.delete.description') }}
      </p>
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
  </article>
</template>

<script lang="ts" setup>
import MessagesAcknowledgment from './MessagesAcknowledgment.vue';
import EmptyState from '@/components/EmptyState.vue';
import MembersSelect from '@/components/MembersSelect.vue';
import AppButtonOutline from '@/components/form/AppButtonOutline.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppDateField from '@/components/form/AppDateField.vue';
import AppMarkdownComposer from '@/components/form/AppMarkdownComposer.vue';
import AppSelectField from '@/components/form/AppSelectField.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppDialogConfirm from '@/components/layout/AppDialogConfirm.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import { getAllMembers } from '@/services/api/members';
import { deleteMessage, getMessage, updateMessage } from '@/services/api/messages';
import { membersQueryKeys, messagesQueryKeys, useAppQuery } from '@/services/query';
import { useNotificationsStore } from '@/store/notifications';
import { mdiAlertOutline, mdiCheck, mdiDeleteOutline } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { computed, nextTick, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps({
  messageId: {
    type: String,
    default: null,
  },
});

const router = useRouter();
const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const queryClient = useQueryClient();
const state = reactive({
  body: null as string | null,
  title: null as string | null,
  published: null as string | null,
  isSubmitting: false as boolean,

  isDeleteDialogVisible: false as boolean,
  isDeleting: false as boolean,
});

const rules = computed(() => ({
  body: { required: withAppI18nMessage(required) },
}));

const vuelidate = useVuelidate(rules, state);

const {
  isPending: isPendingMessage,
  isFetching: isFetchingMessage,
  data: message,
} = useAppQuery({
  queryKey: computed(() => messagesQueryKeys.byId(props.messageId)),
  queryFn: () => getMessage(props.messageId),
});

// const {
//   isPending: isPendingHistory,
//   isFetching: isFetchingHistory,
//   errorText: historyErrorText,
//   data: history,
// } = useAppQuery(
//   computed(() => ({
//     queryKey: messagesQueryKeys.historyById(props.messageId),
//     queryFn: () => getMessageHistory(props.messageId),
//   })),
// );

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }
  vuelidate.value.$reset();

  state.isSubmitting = true;
  updateMessage(props.messageId, {
    ...message.value,
    title: state.title as string,
    body: state.body as string,
    published: state.published as string,
  })
    .then(async (updatedMessage) => {
      notificationsStore.addSuccessNotification(i18n.t('messages.onUpdate.success'));
      queryClient.setQueryData(messagesQueryKeys.byId(props.messageId), updatedMessage);
      queryClient.invalidateQueries({
        queryKey: messagesQueryKeys.historyById(props.messageId),
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: messagesQueryKeys.all(),
        exact: true,
      });
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(error, i18n.t('messages.onUpdate.fail'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};

const onDelete = () => {
  state.isDeleting = true;
  deleteMessage(props.messageId)
    .then((deletedMessage) => {
      notificationsStore.addSuccessNotification(
        i18n.t('messages.onDelete.success', {
          title: deletedMessage.title,
        }),
      );
      queryClient.invalidateQueries({
        queryKey: messagesQueryKeys.all(),
        exact: true,
      });
      state.isDeleteDialogVisible = false;
      return router.replace({ name: ROUTE_NAMES.MESSAGES.LIST });
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(error, i18n.t('messages.onDelete.fail'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isDeleting = false;
    });
};

watch(
  () => message.value,
  (freshMessage) => {
    if (freshMessage) {
      state.title = freshMessage.title ?? null;
      state.body = freshMessage.body ?? null;
      state.published = freshMessage.published ?? null;
    }
  },
  { immediate: true },
);
</script>
