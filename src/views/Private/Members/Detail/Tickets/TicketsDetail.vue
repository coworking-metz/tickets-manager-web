<template>
  <div class="flex min-h-full flex-col bg-white pb-6">
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
      <Head>
        <title>{{ $t('tickets.detail.head.title', { count: selectedTicket.count }) }}</title>
      </Head>
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
            class="pointer-events-none absolute inset-y-0 right-0 z-20 flex w-14 items-center text-gray-500 sm:text-sm">
            {{ $t('tickets.detail.count.unit', { count: state.count }) }}
          </span>
        </template>
      </AppTextField>
      <AppTextField
        id="ticket-reference"
        disabled
        :label="$t('tickets.detail.reference.label')"
        :model-value="selectedTicket.orderReference"
        readonly />

      <AppTextareaField
        id="comment"
        v-model="state.comment"
        :errors="vuelidate.comment.$errors.map(({ $message }) => $message as string)"
        :label="$t('tickets.detail.comment.label')"
        :placeholder="$t('tickets.detail.comment.placeholder')"
        required />

      <div class="mt-1 flex flex-row justify-between gap-3">
        <AppButton
          class="border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500"
          :icon="mdiCheck"
          :loading="state.isSubmitting"
          type="submit">
          {{ $t('action.edit') }}
        </AppButton>

        <AppButton
          class="border border-red-300 bg-white text-red-500 shadow-sm hover:bg-red-50 focus:!ring-red-500"
          :icon="mdiDeleteOutline"
          @click.prevent="state.isDeleteDialogVisible = true">
          {{ $t('action.delete') }}
        </AppButton>
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
import AppButton from '@/components/form/AppButton.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppTextareaField from '@/components/form/AppTextareaField.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import { getAllMemberTickets, Ticket, updateMemberTicket } from '@/services/api/tickets';
import { useAppQuery } from '@/services/query';
import { useNotificationsStore } from '@/store/notifications';
import { DialogTitle } from '@headlessui/vue';
import { mdiCheck, mdiClose, mdiDeleteOutline, mdiTicket } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { Head } from '@unhead/vue/components';
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
  comment: null as string | null,
  isSubmitting: false as boolean,
  isDeleteDialogVisible: false as boolean,
});

const {
  isFetching: isFetchingTickets,
  data: tickets,
  errorText: ticketsErrorText,
} = useAppQuery({
  queryKey: ['members', computed(() => props.memberId), 'tickets'],
  queryFn: () => getAllMemberTickets(props.memberId),
  retry: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

const selectedTicket = computed<Ticket | null>(() => {
  return tickets.value?.find((ticket) => `${ticket._id}` === `${props.id}`) ?? null;
});

const rules = computed(() => ({
  count: {
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
    queryKey: ['members', computed(() => props.memberId)],
  });
  queryClient.invalidateQueries({
    queryKey: ['members', computed(() => props.memberId), 'history'],
  });
  queryClient.invalidateQueries({
    queryKey: ['members', computed(() => props.memberId), 'activity'],
  });
  queryClient.invalidateQueries({
    queryKey: ['members', computed(() => props.memberId), 'tickets'],
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
    comment: state.comment as string,
  })
    .then(async () => {
      notificationsStore.addNotification({
        type: 'success',
        message: i18n.t('tickets.detail.onUpdate.success'),
        timeout: 3_000,
      });
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
    }
  },
  { immediate: true },
);
</script>
