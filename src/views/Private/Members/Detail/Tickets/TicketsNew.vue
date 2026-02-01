<template>
  <div class="flex min-h-full flex-col bg-white pb-6 dark:bg-neutral-800">
    <div class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex items-center justify-between">
        <DialogTitle :class="['text-lg font-medium text-white']">
          {{ $t('tickets.new.title') }}
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
        <title>{{ $t('tickets.new.head.title') }}</title>
      </Head>
      <AppTextField
        id="ticket-count"
        v-model.number="state.count"
        :errors="vuelidate.count.$errors.map(({ $message }) => $message as string)"
        input-class="!pr-16"
        :label="$t('tickets.detail.count.label')"
        min="0.5"
        :prepend-icon="mdiTicket"
        required
        step="0.5"
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
        v-model="state.orderReference"
        :label="$t('tickets.detail.reference.label')"
        :placeholder="$t('tickets.detail.reference.placeholder')" />

      <AppTextField
        id="ticket-purchased"
        v-model="state.purchased"
        :errors="vuelidate.purchased.$errors.map(({ $message }) => $message as string)"
        :label="$t('tickets.detail.purchased.label', { count: state.count })"
        required
        type="date" />

      <AppTextareaField
        id="comment"
        v-model="state.comment"
        :errors="vuelidate.comment.$errors.map(({ $message }) => $message as string)"
        :label="$t('tickets.detail.comment.label')"
        :placeholder="$t('tickets.detail.comment.placeholder')"
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
import { Member } from '@/services/api/members';
import { addMemberTicket } from '@/services/api/tickets';
import { membersQueryKeys, statsQueryKeys } from '@/services/query';
import { useNotificationsStore } from '@/store/notifications';
import { DialogTitle } from '@headlessui/vue';
import { mdiClose, mdiPlus, mdiTicket } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { Head } from '@unhead/vue/components';
import useVuelidate from '@vuelidate/core';
import { minValue, numeric, required } from '@vuelidate/validators';
import dayjs from 'dayjs';
import { PropType, computed, nextTick, reactive, watch } from 'vue';
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
  count: null as null | number,
  amount: null as number | null,
  orderReference: null as string | null,
  purchased: dayjs().format('YYYY-MM-DD') as string | null,
  comment: null as string | null,
  isSubmitting: false as boolean,
});

const rules = computed(() => ({
  count: {
    required: withAppI18nMessage(required),
    decimal: withAppI18nMessage(numeric),
    minValue: withAppI18nMessage(minValue(0.5)),
  },
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
  addMemberTicket(props.memberId, {
    count: state.count as number,
    amount: state.amount as number,
    orderReference: state.orderReference,
    purchased: state.purchased as string,
    comment: state.comment as string,
  })
    .then(async () => {
      await router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX });
      notificationsStore.addSuccessNotification(i18n.t('tickets.new.onAdd.success'));
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
      queryClient.invalidateQueries({
        queryKey: statsQueryKeys.allUsagePeriods(),
      });
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(error, i18n.t('tickets.new.onAdd.fail'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};

watch(
  () => props.member,
  (member) => {
    if (member?.balance < 0) {
      state.count = Math.abs(member.balance);
    }
  },
  { immediate: true },
);
</script>
