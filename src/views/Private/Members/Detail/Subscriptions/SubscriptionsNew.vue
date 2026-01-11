<template>
  <div class="flex h-full flex-col bg-white shadow-xl dark:bg-neutral-800">
    <div class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex flex-row items-center justify-between">
        <DialogTitle :class="['text-lg font-medium text-white']">
          {{ $t('subscriptions.new.title') }}
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
        <title>{{ $t('subscriptions.new.head.title') }}</title>
      </Head>
      <AppTextField
        id="subscription-started"
        v-model="state.started"
        :errors="vuelidate.started.$errors.map(({ $message }) => $message as string)"
        :label="$t('subscriptions.detail.started.label')"
        :prepend-icon="mdiCalendarStartOutline"
        required
        type="date" />

      <AppTextField
        id="subscription-ended"
        disabled
        :hint="$t('subscriptions.detail.ended.hint')"
        :label="$t('subscriptions.detail.ended.label')"
        :model-value="computedEnded"
        :prepend-icon="mdiCalendarEndOutline"
        type="date" />

      <AppAmountField
        id="subscription-amount"
        v-model.number="state.amount"
        :errors="vuelidate.amount.$errors.map(({ $message }) => $message as string)"
        :label="$t('subscriptions.detail.amount.label')"
        required />

      <AppTextField
        id="order-reference"
        v-model="state.orderReference"
        :label="$t('subscriptions.detail.reference.label')"
        :placeholder="$t('subscriptions.detail.reference.placeholder')" />
      <AppTextField
        id="subscription-purchased"
        v-model="state.purchased"
        :errors="vuelidate.purchased.$errors.map(({ $message }) => $message as string)"
        :label="$t('subscriptions.detail.purchased.label')"
        required
        type="date" />

      <AppTextareaField
        id="comment"
        v-model="state.comment"
        :errors="vuelidate.comment.$errors.map(({ $message }) => $message as string)"
        :label="$t('subscriptions.detail.comment.label')"
        :placeholder="$t('subscriptions.detail.comment.placeholder')"
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
import AppAmountField from '@/components/form/AppAmountField.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppTextareaField from '@/components/form/AppTextareaField.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import { addMemberSubscription } from '@/services/api/subscriptions';
import { membersQueryKeys } from '@/services/query';
import { useNotificationsStore } from '@/store/notifications';
import { DialogTitle } from '@headlessui/vue';
import { mdiCalendarEndOutline, mdiCalendarStartOutline, mdiClose, mdiPlus } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { Head } from '@unhead/vue/components';
import useVuelidate from '@vuelidate/core';
import { minValue, numeric, required } from '@vuelidate/validators';
import dayjs from 'dayjs';
import { computed, nextTick, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps({
  memberId: {
    type: String,
    required: true,
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

const computedEnded = computed(() => {
  return state.started
    ? dayjs(state.started).add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD')
    : null;
});

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }

  state.isSubmitting = true;
  addMemberSubscription(props.memberId, {
    started: state.started as string,
    amount: state.amount as number,
    orderReference: state.orderReference,
    purchased: state.purchased as string,
    comment: state.comment as string,
  })
    .then(async () => {
      await router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX });
      notificationsStore.addSuccessNotification(i18n.t('subscriptions.new.onAdd.success'));
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.profileById(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.subscriptionsById(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.historyById(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.activityById(props.memberId),
      });
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(error, i18n.t('subscriptions.new.onAdd.fail'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};
</script>
