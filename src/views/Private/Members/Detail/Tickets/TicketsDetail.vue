<template>
  <div class="flex min-h-full flex-col bg-white pb-6 dark:bg-neutral-800">
    <header class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex items-center justify-between">
        <DialogTitle
          :class="['text-lg font-medium text-white', isFetchingTickets && 'animate-pulse']">
          <div v-if="isFetchingTickets" class="h-4 w-48 rounded-full bg-slate-300" />
          <template v-else-if="!selectedTicket">
            {{ $t('tickets.detail.empty.title') }}
          </template>
          <template v-else>
            {{ $t('tickets.detail.title', { count: selectedTicket.count }) }}
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
      <div v-if="isFetchingTickets" class="h-3 w-64 rounded-full bg-slate-400" />
      <p v-else-if="selectedTicket" class="text-indigo-300 sm:text-sm">
        {{
          $t('tickets.detail.description', {
            purchasedDate: dayjs(selectedTicket.purchased).format('LL'),
            purchasedTime: dayjs(selectedTicket.purchased).format('LT'),
          })
        }}
      </p>
    </header>
    <LoadingSpinner v-if="isFetchingTickets" class="m-auto size-16" />
    <ErrorState
      v-else-if="ticketsErrorText"
      class="m-auto"
      :description="ticketsErrorText"
      :title="$t('tickets.detail.onFetch.fail')" />
    <EmptyState
      v-else-if="!selectedTicket"
      class="m-auto"
      :description="$t('tickets.detail.empty.description')"
      :title="$t('tickets.detail.empty.title')" />
    <form
      v-else-if="selectedTicket"
      class="flex flex-col px-4 pt-6 sm:px-6"
      @submit.prevent="onSubmit">
      <AppTextField
        id="ticket-count"
        v-model.number="state.count"
        :errors="vuelidate.count.$errors.map(({ $message }) => $message as string)"
        input-class="!pr-16"
        :label="$t('tickets.detail.count.label')"
        :prepend-icon="mdiTicket"
        required
        type="number">
        <template #append>
          <span
            class="pointer-events-none absolute inset-y-0 right-0 z-20 flex w-14 items-center text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t('tickets.detail.count.unit', { count: state.count }) }}
          </span>
        </template>
      </AppTextField>

      <AppAmountField
        id="ticket-amount"
        v-model.number="state.amount"
        :errors="vuelidate.amount.$errors.map(({ $message }) => $message as string)"
        :label="$t('tickets.detail.amount.label')"
        required />

      <AppTextField
        id="ticket-reference"
        v-model="state.reference"
        :label="$t('tickets.detail.reference.label')">
        <template
          v-if="
            selectedTicket.orderReference &&
            isMemberOrderFromWordpress(selectedTicket.orderReference)
          "
          #append>
          <div class="absolute inset-y-0 right-3 z-[11] flex h-10 items-center gap-1">
            <a
              class="text-base font-medium !leading-10 text-indigo-600 hover:underline sm:text-sm dark:text-indigo-500"
              :href="buildWordpressSearchOrderByReferenceUrl(selectedTicket.orderReference)"
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

      <AppTextareaField
        id="comment"
        v-model="state.comment"
        :errors="vuelidate.comment.$errors.map(({ $message }) => $message as string)"
        :label="$t('tickets.detail.comment.label')"
        :placeholder="$t('tickets.detail.comment.placeholder')"
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

      <TicketsDeleteDialog
        v-model="state.isDeleteDialogVisible"
        :member-id="props.memberId"
        :ticket="selectedTicket"
        :ticket-id="props.id"
        @deleted="onChanged" />
    </form>
  </div>
</template>

<script setup lang="ts">
import TicketsDeleteDialog from './TicketsDeleteDialog.vue';
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
import { getAllMemberTickets, Ticket, updateMemberTicket } from '@/services/api/tickets';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import { useNotificationsStore } from '@/store/notifications';
import { DialogTitle } from '@headlessui/vue';
import { mdiCheck, mdiClose, mdiDeleteOutline, mdiOpenInNew, mdiTicket } from '@mdi/js';
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
  count: null as null | number,
  reference: null as string | null,
  amount: null as number | null,
  comment: null as string | null,
  isSubmitting: false as boolean,
  isDeleteDialogVisible: false as boolean,
});

const {
  isFetching: isFetchingTickets,
  data: tickets,
  errorText: ticketsErrorText,
} = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.ticketsById(props.memberId),
    queryFn: () => getAllMemberTickets(props.memberId),
  })),
);

const selectedTicket = computed<Ticket | null>(() => {
  return tickets.value?.find((ticket) => `${ticket._id}` === `${props.id}`) ?? null;
});

const rules = computed(() => ({
  count: {
    required: withAppI18nMessage(required),
    decimal: withAppI18nMessage(numeric),
    minValue: withAppI18nMessage(minValue(0)),
  },
  amount: {
    required: withAppI18nMessage(required),
    decimal: withAppI18nMessage(numeric),
    minValue: withAppI18nMessage(minValue(0)),
  },
  comment: { required: withAppI18nMessage(required) },
}));

const vuelidate = useVuelidate(rules, state, { $scope: 'tickets-detail' });

const onChanged = async () => {
  await router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX });
  queryClient.invalidateQueries({
    queryKey: membersQueryKeys.profileById(props.memberId),
  });
  queryClient.invalidateQueries({
    queryKey: membersQueryKeys.ticketsById(props.memberId),
  });
  queryClient.invalidateQueries({
    queryKey: membersQueryKeys.historyById(props.memberId),
  });
  queryClient.invalidateQueries({
    queryKey: membersQueryKeys.activityById(props.memberId),
  });
};

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }

  state.isSubmitting = true;
  updateMemberTicket(props.memberId, props.id, {
    count: state.count as number,
    orderReference: state.reference as string,
    amount: state.amount,
    comment: state.comment as string,
  })
    .then(async () => {
      notificationsStore.addSuccessNotification(i18n.t('tickets.detail.onUpdate.success'));
      onChanged();
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(error, i18n.t('tickets.detail.onUpdate.fail'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};

watch(
  () => selectedTicket.value,
  (ticket) => {
    if (ticket) {
      state.count = ticket.count;
      state.reference = ticket.orderReference ?? null;
      state.amount = ticket.amount ?? null;
    }
  },
  { immediate: true },
);
</script>
