<template>
  <div class="flex h-full flex-col bg-white shadow-xl">
    <div class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex items-center justify-between">
        <DialogTitle :class="['text-lg font-medium text-white', loading && 'animate-pulse']">
          <div v-if="loading" class="h-4 w-48 rounded-full bg-slate-300" />
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
            <SvgIcon aria-hidden="true" class="h-6 w-6" :path="mdiClose" type="mdi" />
          </RouterLink>
        </div>
      </div>
      <div v-if="loading" class="h-3 w-64 rounded-full bg-slate-400" />
      <p v-else-if="selectedTicket" class="text-indigo-300 sm:text-sm">
        {{
          $t('tickets.detail.description', {
            purchasedDate: dayjs(selectedTicket.purchased).format('LL'),
            purchasedTime: dayjs(selectedTicket.purchased).format('LT'),
          })
        }}
      </p>
    </div>
    <LoadingSpinner v-if="loading" class="m-auto h-16 w-16" />
    <EmptyState
      v-else-if="!selectedTicket"
      class="m-auto"
      :description="$t('tickets.detail.empty.description')"
      :title="$t('tickets.detail.empty.title')" />
    <form
      v-else-if="selectedTicket"
      class="flex h-full flex-col px-4 py-6 sm:px-6"
      @submit.prevent="onSubmit">
      <Head>
        <title>{{ $t('tickets.detail.head.title', { count: selectedTicket.count }) }}</title>
      </Head>
      <AppTextField
        id="ticket-count"
        v-model.number="state.count"
        :errors="vuelidate.count.$errors.map(({ $message }) => $message as string)"
        :label="$t('tickets.detail.count.label')"
        :prepend-icon="mdiTicket"
        required
        type="number">
        <template #append>
          <span
            class="pointer-events-none absolute inset-y-0 right-0 z-20 mr-3 flex items-center text-gray-400 sm:text-sm">
            {{ $t('tickets.detail.count.unit', { count: state.count }) }}
          </span>
        </template>
      </AppTextField>

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
        :ticket-id="props.id"
        @deleted="() => $router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX })" />
    </form>
  </div>
</template>

<script setup lang="ts">
import TicketsDeleteDialog from './TicketsDeleteDialog.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppButton from '@/components/form/AppButton.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import { Ticket } from '@/services/api/tickets';
import { useNotificationsStore } from '@/store/notifications';
import { DialogTitle } from '@headlessui/vue';
import { mdiCheck, mdiClose, mdiDeleteOutline, mdiTicket } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import useVuelidate from '@vuelidate/core';
import { numeric, required } from '@vuelidate/validators';
import dayjs from 'dayjs';
import { nextTick, reactive } from 'vue';
import { PropType, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  tickets: {
    type: Array as PropType<Ticket[]>,
    default: () => [],
  },
  id: {
    type: String,
    required: true,
  },
});

const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const state = reactive({
  count: null as null | number,
  isSubmitting: false as boolean,
  isDeleteDialogVisible: false as boolean,
});

const selectedTicket = computed<Ticket | null>(() => {
  return props.tickets.find((ticket) => `${ticket._id}` === `${props.id}`) ?? null;
});

const rules = computed(() => ({
  count: { required: withAppI18nMessage(required), decimal: withAppI18nMessage(numeric) },
}));

const vuelidate = useVuelidate(rules, state);

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }

  state.isSubmitting = true;
  Promise.reject(new Error('Not implemented yet'))
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(error, i18n.t('tickets.detail.onFail.message'));
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
