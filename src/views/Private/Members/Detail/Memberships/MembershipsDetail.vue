<template>
  <div class="flex min-h-full flex-col bg-white pb-6 dark:bg-neutral-800">
    <header class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex items-center justify-between">
        <DialogTitle
          :class="['text-lg font-medium text-white', isFetchingMemberships && 'animate-pulse']">
          <div v-if="isFetchingMemberships" class="h-4 w-48 rounded-full bg-slate-300" />
          <template v-else-if="!selectedMembership">
            {{ $t('memberships.detail.empty.title') }}
          </template>
          <template v-else>
            {{
              $t('memberships.detail.title', {
                year: dayjs(selectedMembership.membershipStart).year(),
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
    <LoadingSpinner v-if="isFetchingMemberships" class="m-auto size-16" />
    <ErrorState
      v-else-if="membershipsErrorText"
      class="m-auto"
      :description="membershipsErrorText"
      :title="$t('memberships.detail.onFetch.fail')" />
    <EmptyState
      v-else-if="!selectedMembership"
      class="m-auto"
      :description="$t('memberships.detail.empty.description')"
      :title="$t('memberships.detail.empty.title')" />
    <form
      v-else-if="selectedMembership"
      class="flex h-full flex-col px-4 pt-6 sm:px-6"
      @submit.prevent="onSubmit">
      <AppAlert
        class="mb-5"
        :description="$t('memberships.detail.coverage.description')"
        :title="$t('memberships.detail.coverage.title')"
        type="info" />
      <AppTextField
        id="membership-started"
        v-model="state.started"
        :errors="vuelidate.started.$errors.map(({ $message }) => $message as string)"
        :label="$t('memberships.detail.started.label')"
        :prepend-icon="mdiCalendarStartOutline"
        required
        type="date" />
      <AppTextField
        id="membership-started"
        disabled
        :label="$t('memberships.detail.ended.label')"
        :model-value="selectedMembership.membershipEnd"
        :prepend-icon="mdiCalendarEndOutline"
        type="date" />
      <AppAmountField
        id="membership-amount"
        v-model.number="state.amount"
        :errors="vuelidate.amount.$errors.map(({ $message }) => $message as string)"
        :label="$t('memberships.detail.amount.label')"
        required />

      <AppTextField
        id="membership-reference"
        v-model="state.reference"
        :label="$t('memberships.detail.reference.label')">
        <template
          v-if="
            selectedMembership.orderReference &&
            isMemberOrderFromWordpress(selectedMembership.orderReference)
          "
          #append>
          <div class="absolute inset-y-0 right-3 z-[11] flex h-10 items-center gap-1">
            <a
              class="text-base font-medium !leading-10 text-indigo-600 hover:underline sm:text-sm dark:text-indigo-500"
              :href="buildWordpressSearchOrderByReferenceUrl(selectedMembership.orderReference)"
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
      <MembershipsDeleteDialog
        v-model="state.isDeleteDialogVisible"
        :member-id="props.memberId"
        :membership="selectedMembership"
        :membership-id="props.id"
        @deleted="onChanged" />
    </form>
  </div>
</template>

<script setup lang="ts">
import MembershipsDeleteDialog from './MembershipsDeleteDialog.vue';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppAlert from '@/components/form/AppAlert.vue';
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
  getAllMemberMemberships,
  Membership,
  updateMemberMembership,
} from '@/services/api/memberships';
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
  reference: null as string | null,
  purchased: null as string | null,
  amount: null as number | null,
  comment: null as string | null,
  isSubmitting: false as boolean,
  isDeleteDialogVisible: false as boolean,
});

const {
  isFetching: isFetchingMemberships,
  data: memberships,
  errorText: membershipsErrorText,
} = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.membershipsById(props.memberId),
    queryFn: () => getAllMemberMemberships(props.memberId),
  })),
);

const selectedMembership = computed<Membership | null>(() => {
  return memberships.value?.find((membership) => `${membership._id}` === `${props.id}`) ?? null;
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

const vuelidate = useVuelidate(rules, state, { $scope: 'memberships-detail' });

const onChanged = async () => {
  await router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX });
  queryClient.invalidateQueries({
    queryKey: membersQueryKeys.profileById(props.memberId),
  });
  queryClient.invalidateQueries({
    queryKey: membersQueryKeys.membershipsById(props.memberId),
  });
  queryClient.invalidateQueries({
    queryKey: membersQueryKeys.historyById(props.memberId),
  });
  queryClient.invalidateQueries({
    queryKey: statsQueryKeys.allIncomePeriods(),
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
  updateMemberMembership(props.memberId, props.id, {
    membershipStart: state.started as string,
    orderReference: state.reference as string,
    purchased: state.purchased as string,
    amount: state.amount,
    comment: state.comment as string,
  })
    .then(async (updatedMembership) => {
      notificationsStore.addSuccessNotification(
        i18n.t('memberships.detail.onUpdate.success', {
          year: dayjs(updatedMembership.membershipStart).year(),
        }),
      );
      onChanged();
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(error, i18n.t('memberships.detail.onUpdate.fail'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};

watch(
  () => selectedMembership.value,
  (membership) => {
    if (membership) {
      state.started = membership.membershipStart;
      state.reference = membership.orderReference ?? null;
      state.amount = membership.amount;
      state.purchased = membership.purchased;
    }
  },
  { immediate: true },
);
</script>
