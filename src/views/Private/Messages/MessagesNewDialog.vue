<template>
  <AppDialog v-model="isVisible" dialog-class="flex flex-col py-4 relative">
    <header v-if="title" class="mx-3 flex flex-row items-start justify-center sm:mx-12">
      <h1
        class="shrink truncate text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        {{ $t('messages.new.title') }}
      </h1>
    </header>

    <div class="mt-6 flex max-h-[1280px] grow flex-row flex-wrap gap-3">
      <form
        class="flex shrink grow basis-0 flex-col px-3 sm:min-w-[480px] sm:px-0"
        @submit.prevent="onSubmit">
        <AppTextField
          id="message-title"
          v-model="state.title"
          :label="$t('messages.new.titleField.label')"
          :placeholder="$t('messages.new.titleField.placeholder')"
          :prepend-icon="mdiEmailOutline" />

        <AppMarkdownComposer
          v-model="state.body"
          :errors="vuelidate.body.$errors.map(({ $message }) => $message as string)"
          :label="$t('messages.new.body.label')"
          required />

        <AppDateField
          id="message-published"
          v-model="state.published"
          :hint="$t('messages.new.published.hint')"
          :label="$t('messages.new.published.label')"
          :prepend-icon="mdiCalendarClock"
          with-time />

        <AppButtonPlain
          class="mt-1 self-start dark:focus:ring-offset-neutral-800"
          color="indigo"
          :icon="mdiPlus"
          :loading="state.isSubmitting"
          type="submit">
          {{ $t('action.add') }}
        </AppButtonPlain>
      </form>

      <aside class="flex min-w-96 shrink grow basis-0 flex-col items-stretch gap-3 px-3 sm:px-0">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ $t('messages.new.recipients.label') }}
          </h2>
          <AppButtonOutline
            :icon="mdiAccountMultipleOutline"
            size="sm"
            type="button"
            @click="state.isRecipientsDialogVisible = true">
            {{
              state.to.length > 0
                ? $t('messages.new.recipients.modify')
                : $t('messages.new.recipients.select')
            }}
          </AppButtonOutline>
        </div>

        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ $t('messages.new.recipients.description') }}
        </p>

        <ol
          class="grow overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700"
          role="list">
          <EmptyState
            v-if="state.to.length === 0"
            class="m-auto py-6"
            :title="$t('messages.new.recipients.empty')" />
          <li v-else v-for="recipient in state.to" :key="recipient.memberId" class="group relative">
            <MembersListCard :member="getMemberById(recipient.memberId)" />
            <button
              class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-red-100 p-1.5 text-red-600 opacity-0 transition-opacity hover:bg-red-200 group-hover:opacity-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              type="button"
              @click="removeMember(recipient.memberId)">
              <AppIcon class="size-4" :icon="mdiClose" />
            </button>
          </li>
        </ol>
      </aside>
    </div>

    <MessagesRecipientsDialog
      v-model="state.isRecipientsDialogVisible"
      v-model:recipients="state.to" />
  </AppDialog>
</template>

<script setup lang="ts">
import MessagesRecipientsDialog from './MessagesRecipientsDialog.vue';
import MembersListCard from '../Members/MembersListCard.vue';
import AppIcon from '@/components/AppIcon.vue';
import EmptyState from '@/components/EmptyState.vue';
import AppButtonOutline from '@/components/form/AppButtonOutline.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppDateField from '@/components/form/AppDateField.vue';
import AppMarkdownComposer from '@/components/form/AppMarkdownComposer.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppTextareaField from '@/components/form/AppTextareaField.vue';
import AppDialog from '@/components/layout/AppDialog.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import { getAllMembers } from '@/services/api/members';
import { addMessage, ApiMessageAcknowledgement, ApiMessageType } from '@/services/api/messages';
import { membersQueryKeys, messagesQueryKeys, useAppQuery } from '@/services/query';
import { useAuthStore } from '@/store/auth';
import { useNotificationsStore } from '@/store/notifications';
import {
  mdiAccountMultipleOutline,
  mdiCalendarClock,
  mdiClose,
  mdiEmailOutline,
  mdiPlus,
} from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { computed, nextTick, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const isVisible = defineModel({
  type: Boolean,
  default: false,
});

const props = defineProps({
  title: {
    type: String,
    default: null,
  },
  body: {
    type: String,
    default: null,
  },
  published: {
    type: String,
    default: null,
  },
});

const router = useRouter();
const i18n = useI18n();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();
const queryClient = useQueryClient();

const state = reactive({
  title: props.title as string | null,
  body: props.body as string | null,
  published: props.published as string | null,
  to: [] as ApiMessageAcknowledgement[],
  isSubmitting: false as boolean,
  isRecipientsDialogVisible: false as boolean,
});

const rules = computed(() => ({
  body: { required: withAppI18nMessage(required) },
}));

const vuelidate = useVuelidate(rules, state);
const { data: members } = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.all(),
    queryFn: () => getAllMembers(),
  })),
);

const removeMember = (memberId: string) => {
  state.to = state.to.filter((recipient) => recipient.memberId !== memberId);
};

const getMemberById = (memberId: string) => {
  return members.value?.find((m) => m._id === memberId);
};

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }
  vuelidate.value.$reset();

  state.isSubmitting = true;
  addMessage({
    title: state.title || undefined,
    body: state.body as string,
    published: state.published || undefined,
    fromMemberId: authStore.user?.id as string,
    type: ApiMessageType.USER_GENERATED,
    to: state.to,
  })
    .then(async (newMessage) => {
      notificationsStore.addSuccessNotification(i18n.t('messages.onAdd.success'));
      queryClient.invalidateQueries({
        queryKey: messagesQueryKeys.all(),
        exact: true,
      });
      await router.replace({
        name: ROUTE_NAMES.MESSAGES.DETAIL,
        params: { messageId: newMessage._id },
      });
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(error, i18n.t('messages.onAdd.fail'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};
</script>
