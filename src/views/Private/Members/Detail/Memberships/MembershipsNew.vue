<template>
  <div class="flex min-h-full flex-col bg-white shadow-xl">
    <div class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex items-center justify-between">
        <DialogTitle :class="['text-lg font-medium text-white']">
          {{ $t('memberships.new.title') }}
        </DialogTitle>
        <div class="ml-3 flex h-7 items-center">
          <RouterLink
            class="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX }">
            <span class="sr-only">{{ $t('action.close') }}</span>
            <SvgIcon aria-hidden="true" class="size-6" :path="mdiClose" type="mdi" />
          </RouterLink>
        </div>
      </div>
    </div>
    <form class="flex h-full flex-col px-4 py-6 sm:px-6" @submit.prevent="onSubmit">
      <Head>
        <title>{{ $t('memberships.new.head.title') }}</title>
      </Head>
      <AppTextField
        id="membership-started"
        v-model="state.started"
        :errors="vuelidate.started.$errors.map(({ $message }) => $message as string)"
        :label="$t('subscriptions.detail.started.label')"
        :prepend-icon="mdiCalendarStartOutline"
        required
        type="date" />
      <AppTextField
        id="membership-reference"
        v-model="state.orderReference"
        :label="$t('memberships.detail.reference.label')"
        :placeholder="$t('memberships.detail.reference.placeholder')" />

      <AppTextareaField
        id="comment"
        v-model="state.comment"
        :errors="vuelidate.comment.$errors.map(({ $message }) => $message as string)"
        :label="$t('memberships.detail.comment.label')"
        :placeholder="$t('memberships.detail.comment.placeholder')"
        required />

      <AppButton
        class="mt-1 self-start border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500"
        :icon="mdiPlus"
        :loading="state.isSubmitting"
        type="submit">
        {{ $t('action.add') }}
      </AppButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import AppButton from '@/components/form/AppButton.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppTextareaField from '@/components/form/AppTextareaField.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import { Member } from '@/services/api/members';
import { addMemberMembership } from '@/services/api/memberships';
import { useNotificationsStore } from '@/store/notifications';
import { DialogTitle } from '@headlessui/vue';
import { mdiPlus, mdiClose, mdiCalendarStartOutline } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { Head } from '@unhead/vue/components';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import dayjs from 'dayjs';
import { PropType, computed, nextTick, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
  member: {
    type: Object as PropType<Member>,
    default: null,
  },
});

const router = useRouter();
const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const queryClient = useQueryClient();
const state = reactive({
  started: dayjs().format('YYYY-MM-DD') as string | null,
  orderReference: null as string | null,
  comment: null as string | null,
  isSubmitting: false as boolean,
});

const rules = computed(() => ({
  started: { required: withAppI18nMessage(required) },
  comment: { required: withAppI18nMessage(required) },
}));

const vuelidate = useVuelidate(rules, state);

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }

  state.isSubmitting = true;
  addMemberMembership(props.memberId, {
    membershipStart: state.started as string,
    orderReference: state.orderReference,
    comment: state.comment as string,
  })
    .then(async (newMembership) => {
      await router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX });
      notificationsStore.addNotification({
        type: 'success',
        message: i18n.t('memberships.new.onAdd.success', {
          year: dayjs(newMembership.membershipStart).year(),
        }),
        timeout: 3_000,
      });
      queryClient.invalidateQueries({
        queryKey: ['members', computed(() => props.memberId)],
      });
      queryClient.invalidateQueries({
        queryKey: ['members', computed(() => props.memberId), 'history'],
      });
      queryClient.invalidateQueries({
        queryKey: ['members', computed(() => props.memberId), 'memberships'],
      });
      queryClient.invalidateQueries({
        queryKey: ['members', computed(() => props.memberId), 'activity'],
      });
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(error, i18n.t('memberships.new.onAdd.fail'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};
</script>
