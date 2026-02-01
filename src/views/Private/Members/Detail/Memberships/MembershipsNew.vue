<template>
  <div class="flex min-h-full flex-col bg-white pb-6 dark:bg-neutral-800">
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
    <form class="flex h-full flex-col px-4 pt-6 sm:px-6" @submit.prevent="onSubmit">
      <Head>
        <title>{{ $t('memberships.new.head.title') }}</title>
      </Head>
      <AppAlert
        class="mb-5"
        :description="$t('memberships.detail.coverage.description')"
        :title="$t('memberships.detail.coverage.title')"
        type="info" />
      <AppTextField
        id="membership-started"
        v-model="state.started"
        :errors="vuelidate.started.$errors.map(({ $message }) => $message as string)"
        :label="$t('subscriptions.detail.started.label')"
        :prepend-icon="mdiCalendarStartOutline"
        required
        type="date" />
      <AppAmountField
        id="membership-amount"
        v-model.number="state.amount"
        :errors="vuelidate.amount.$errors.map(({ $message }) => $message as string)"
        :label="$t('memberships.detail.amount.label')"
        required />
      <AppTextField
        id="membership-reference"
        v-model="state.orderReference"
        :label="$t('memberships.detail.reference.label')"
        :placeholder="$t('memberships.detail.reference.placeholder')" />
      <AppTextField
        id="membership-purchased"
        v-model="state.purchased"
        :errors="vuelidate.purchased.$errors.map(({ $message }) => $message as string)"
        :label="$t('memberships.detail.purchased.label')"
        required
        type="date" />

      <AppTextareaField
        id="comment"
        v-model="state.comment"
        :errors="vuelidate.comment.$errors.map(({ $message }) => $message as string)"
        :label="$t('memberships.detail.comment.label')"
        :placeholder="$t('memberships.detail.comment.placeholder')"
        required />

      <AppButtonPlain
        class="mt-1 self-start dark:focus:ring-offset-neutral-800"
        color="indigo"
        :icon="mdiPlus"
        :loading="state.isSubmitting"
        type="submit">
        {{ $t('action.add') }}
      </AppButtonPlain>
    </form>
  </div>
</template>

<script setup lang="ts">
import AppAlert from '@/components/form/AppAlert.vue';
import AppAmountField from '@/components/form/AppAmountField.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppTextareaField from '@/components/form/AppTextareaField.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import { Member } from '@/services/api/members';
import { addMemberMembership } from '@/services/api/memberships';
import { membersQueryKeys, statsQueryKeys } from '@/services/query';
import { useNotificationsStore } from '@/store/notifications';
import { DialogTitle } from '@headlessui/vue';
import { mdiCalendarStartOutline, mdiClose, mdiPlus } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { Head } from '@unhead/vue/components';
import useVuelidate from '@vuelidate/core';
import { minValue, numeric, required } from '@vuelidate/validators';
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
  amount: null as number | null,
  orderReference: null as string | null,
  purchased: dayjs().format('YYYY-MM-DD') as string | null,
  comment: null as string | null,
  isSubmitting: false as boolean,
});

const rules = computed(() => ({
  started: { required: withAppI18nMessage(required) },
  amount: {
    required: withAppI18nMessage(required),
    decimal: withAppI18nMessage(numeric),
    minValue: withAppI18nMessage(minValue(0)),
  },
  purchased: { required: withAppI18nMessage(required) },
  comment: { required: withAppI18nMessage(required) },
}));

const vuelidate = useVuelidate(rules, state);

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }
  vuelidate.value.$reset();

  state.isSubmitting = true;
  addMemberMembership(props.memberId, {
    membershipStart: state.started as string,
    amount: state.amount as number,
    orderReference: state.orderReference,
    purchased: state.purchased as string,
    comment: state.comment as string,
  })
    .then(async (newMembership) => {
      await router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX });
      notificationsStore.addSuccessNotification(
        i18n.t('memberships.new.onAdd.success', {
          year: dayjs(newMembership.membershipStart).year(),
        }),
      );
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.profileById(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.historyById(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.membershipsById(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: statsQueryKeys.allIncomePeriods(),
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
