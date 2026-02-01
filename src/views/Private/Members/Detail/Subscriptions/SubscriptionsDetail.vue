<template>
  <div class="flex min-h-full flex-col bg-white pb-6 dark:bg-neutral-800">
    <header class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex items-center justify-between">
        <DialogTitle
          :class="['text-lg font-medium text-white', isFetchingSubscriptions && 'animate-pulse']">
          <div v-if="isFetchingSubscriptions" class="h-4 w-48 rounded-full bg-slate-300" />
          <template v-else-if="!selectedSubscription">
            {{ $t('subscriptions.detail.empty.title') }}
          </template>
          <template v-else>
            {{
              $t('subscriptions.detail.title', {
                startDate: dayjs(selectedSubscription.started).format('LL'),
              })
            }}
          </template>
        </DialogTitle>
        <div class="ml-3 flex h-7 items-center">
          <RouterLink
            class="rounded-md bg-indigo-700 p-1 text-indigo-200 hover:bg-indigo-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX }">
            <span class="sr-only">{{ $t('action.close') }}</span>
            <SvgIcon aria-hidden="true" class="size-6" :path="mdiClose" type="mdi" />
          </RouterLink>
        </div>
      </div>
    </header>
    <LoadingSpinner v-if="isFetchingSubscriptions" class="m-auto size-16" />
    <ErrorState
      v-else-if="subscriptionsErrorText"
      class="m-auto"
      :description="subscriptionsErrorText"
      :title="$t('subscriptions.detail.onFetch.fail')" />
    <EmptyState
      v-else-if="!selectedSubscription"
      class="m-auto"
      :description="$t('subscriptions.detail.empty.description')"
      :title="$t('subscriptions.detail.empty.title')" />
    <form v-else class="flex flex-col px-4 pt-6 sm:px-6" @submit.prevent="onSubmit">
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
        v-model="state.ended"
        :label="$t('subscriptions.detail.ended.label')"
        :prepend-icon="mdiCalendarEndOutline"
        required
        type="date" />
      <AppAmountField
        id="subscription-amount"
        v-model.number="state.amount"
        :errors="vuelidate.amount.$errors.map(({ $message }) => $message as string)"
        :label="$t('subscriptions.detail.amount.label')"
        required />
      <AppTextField
        id="subscription-reference"
        v-model="state.reference"
        :label="$t('subscriptions.detail.reference.label')">
        <template
          v-if="
            selectedSubscription.orderReference &&
            isMemberOrderFromWordpress(selectedSubscription.orderReference)
          "
          #append>
          <div class="absolute inset-y-0 right-3 z-[11] flex h-10 items-center gap-1">
            <a
              class="text-base font-medium !leading-10 text-indigo-600 hover:underline sm:text-sm dark:text-indigo-500"
              :href="buildWordpressSearchOrderByReferenceUrl(selectedSubscription.orderReference)"
              target="_blank">
              {{ $t('action.navigate') }}
            </a>
            <SvgIcon
              aria-hidden="true"
              class="inline-block size-4 text-indigo-600"
              :path="mdiOpenInNew"
              type="mdi" />
          </div>
        </template>
      </AppTextField>
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

      <SubscriptionsDeleteDialog
        v-model="state.isDeleteDialogVisible"
        :member-id="props.memberId"
        :subscription="selectedSubscription"
        :subscription-id="props.id"
        @deleted="onChanged" />
    </form>
  </div>
</template>

<script setup lang="ts">
import SubscriptionsDeleteDialog from './SubscriptionsDeleteDialog.vue';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppAmountField from '@/components/form/AppAmountField.vue';
import AppButtonOutline from '@/components/form/AppButtonOutline.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppTextareaField from '@/components/form/AppTextareaField.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import {
  buildWordpressSearchOrderByReferenceUrl,
  isMemberOrderFromWordpress,
} from '@/services/api/members';
import {
  getAllMemberSubscriptions,
  Subscription,
  updateMemberSubscription,
} from '@/services/api/subscriptions';
import { membersQueryKeys, statsQueryKeys, useAppQuery } from '@/services/query';
import { useNotificationsStore } from '@/store/notifications';
import { DialogTitle } from '@headlessui/vue';
import {
  mdiCalendarEndOutline,
  mdiCalendarStartOutline,
  mdiCheck,
  mdiClose,
  mdiDeleteOutline,
  mdiOpenInNew,
} from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import useVuelidate from '@vuelidate/core';
import { minValue, numeric, required } from '@vuelidate/validators';
import dayjs from 'dayjs';
import { computed, nextTick, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const queryClient = useQueryClient();
const state = reactive({
  started: null as string | null,
  amount: null as number | null,
  ended: null as string | null,
  reference: null as string | null,
  purchased: null as string | null,
  comment: null as string | null,
  isSubmitting: false as boolean,
  isDeleteDialogVisible: false as boolean,
});

const {
  isFetching: isFetchingSubscriptions,
  data: subscriptions,
  errorText: subscriptionsErrorText,
} = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.subscriptionsById(props.memberId),
    queryFn: () => getAllMemberSubscriptions(props.memberId),
  })),
);

const selectedSubscription = computed<Subscription | null>(() => {
  return subscriptions.value?.find(({ _id }) => `${_id}` === `${props.id}`) ?? null;
});

const rules = computed(() => ({
  started: { required: withAppI18nMessage(required) },
  ended: { required: withAppI18nMessage(required) },
  amount: {
    required: withAppI18nMessage(required),
    decimal: withAppI18nMessage(numeric),
    minValue: withAppI18nMessage(minValue(0)),
  },
  purchased: { required: withAppI18nMessage(required) },
  comment: { required: withAppI18nMessage(required) },
}));

const vuelidate = useVuelidate(rules, state, { $scope: 'subscriptions-detail' });

const onChanged = async () => {
  await router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX });
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
  queryClient.invalidateQueries({
    queryKey: statsQueryKeys.allUsagePeriods(),
  });
};

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }
  vuelidate.value.$reset();

  state.isSubmitting = true;
  updateMemberSubscription(props.memberId, props.id, {
    started: state.started as string,
    ended: state.ended as string,
    orderReference: state.reference,
    purchased: state.purchased as string,
    amount: state.amount,
    comment: state.comment as string,
  })
    .then(() => {
      notificationsStore.addSuccessNotification(i18n.t('subscriptions.detail.onUpdate.success'));
      onChanged();
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(error, i18n.t('subscriptions.detail.onUpdate.fail'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};

watch(
  () => selectedSubscription.value,
  (subscription) => {
    if (subscription) {
      state.started = dayjs(subscription.started).format('YYYY-MM-DD');
      state.ended = dayjs(subscription.ended).format('YYYY-MM-DD');
      state.reference = subscription.orderReference ?? null;
      state.amount = subscription.amount ?? null;
      state.purchased = dayjs(subscription.purchased).format('YYYY-MM-DD');
    }
  },
  { immediate: true },
);
</script>
