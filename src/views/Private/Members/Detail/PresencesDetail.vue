<template>
  <div class="flex h-full flex-col">
    <div class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex flex-row items-center justify-between">
        <DialogTitle
          :class="['shrink truncate text-lg font-medium text-white', loading && 'animate-pulse']">
          <div v-if="loading" class="h-4 w-48 rounded-full bg-slate-300" />
          <template v-else-if="!selectedPresence">
            {{ $t('presences.detail.empty.title') }}
          </template>
          <template v-else-if="selectedPresence">
            {{
              $t('presences.detail.title', {
                date: dayjs(selectedPresence.date).format('dddd LL'),
              })
            }}
          </template>
        </DialogTitle>
        <div class="flex h-7 shrink-0 items-center">
          <RouterLink
            class="rounded-md bg-indigo-700 p-1 text-indigo-200 hover:bg-indigo-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            replace
            :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX }">
            <span class="sr-only">{{ $t('action.close') }}</span>
            <SvgIcon aria-hidden="true" class="h-6 w-6" :path="mdiClose" type="mdi" />
          </RouterLink>
        </div>
      </div>
      <div v-if="loading" class="h-3 w-64 rounded-full bg-slate-400" />
      <p v-else-if="selectedPresence" class="text-sm text-indigo-300">
        {{ $t('presences.detail.description') }}
      </p>
    </div>
    <LoadingSpinner v-if="loading" class="m-auto h-16 w-16" />
    <EmptyState
      v-else-if="!selectedPresence"
      class="m-auto"
      :description="$t('presences.detail.empty.description')"
      :title="$t('presences.detail.empty.title')" />
    <div v-else class="flex flex-col px-4 py-6 sm:px-6">
      <nav class="flex flex-row">
        <RouterLink
          v-if="previousPresence"
          class="mr-auto inline-flex items-center rounded-md p-2 font-medium text-gray-500 transition-colors hover:border-gray-200 hover:bg-slate-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
          replace
          :to="{
            name: ROUTE_NAMES.MEMBERS.DETAIL.PRESENCES.DETAIL,
            params: { presenceDate: previousPresence.date },
          }">
          <SvgIcon
            aria-hidden="true"
            class="mr-1 h-5 w-5 text-gray-400"
            :path="mdiChevronLeft"
            type="mdi" />
          {{ dayjs(previousPresence.date).format('dddd DD/MM') }}
        </RouterLink>
        <RouterLink
          v-if="nextPresence"
          class="ml-auto inline-flex items-center rounded-md p-2 font-medium text-gray-500 transition-colors hover:border-gray-200 hover:bg-slate-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
          replace
          :to="{
            name: ROUTE_NAMES.MEMBERS.DETAIL.PRESENCES.DETAIL,
            params: { presenceDate: nextPresence.date },
          }">
          {{ dayjs(nextPresence.date).format('dddd DD/MM') }}
          <SvgIcon
            aria-hidden="true"
            class="ml-1 h-5 w-5 text-gray-400"
            :path="mdiChevronRight"
            type="mdi" />
        </RouterLink>
      </nav>
      <form class="mt-6 flex h-full flex-col" @submit.prevent="onSubmit">
        <Head>
          <title>
            {{
              $t('presences.detail.head.title', {
                date: dayjs(selectedPresence.date).format('LL'),
              })
            }}
          </title>
        </Head>

        <RadioGroup v-model="state.type">
          <RadioGroupLabel class="font-medium text-gray-900 sm:text-sm">
            {{ $t('presences.detail.type.label') }}
          </RadioGroupLabel>

          <div class="mt-1 flex flex-row gap-3">
            <RadioGroupOption
              v-for="presenceType in ['T', 'A']"
              :key="`presence-type-${presenceType}`"
              as="template"
              :value="presenceType"
              v-slot="{ checked, active }">
              <div
                :class="[
                  checked ? 'border-transparent' : 'border-gray-300 hover:border-gray-400',
                  active ? 'border-indigo-500 ring-2 ring-indigo-500' : '',
                  'relative flex flex-1 cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none',
                ]">
                <span class="flex flex-1">
                  <span class="flex flex-col">
                    <RadioGroupLabel as="span" class="block font-medium text-gray-900 sm:text-sm">
                      {{ $t(`presences.detail.type.value.${presenceType}.label`) }}
                    </RadioGroupLabel>
                    <RadioGroupDescription
                      as="span"
                      class="mt-1 flex items-center text-sm text-gray-500">
                      {{ $t(`presences.detail.type.value.${presenceType}.description`) }}
                    </RadioGroupDescription>
                  </span>
                </span>
                <SvgIcon
                  aria-hidden="true"
                  :class="[!checked && 'invisible', 'h-5 w-5 text-indigo-600']"
                  :path="mdiCheckCircle"
                  type="mdi" />
                <span
                  aria-hidden="true"
                  :class="[
                    active ? 'border' : 'border-2',
                    checked ? 'border-indigo-500' : 'border-transparent',
                    'pointer-events-none absolute -inset-px rounded-lg',
                  ]" />
              </div>
            </RadioGroupOption>
          </div>
        </RadioGroup>
        <ul class="min-h-[1.4rem] px-3 text-xs">
          <li
            v-for="error in vuelidate.type.$errors.map(({ $message }) => $message)"
            :key="`error-${error}`"
            class="text-red-600">
            {{ error }}
          </li>
        </ul>

        <RadioGroup v-model="state.amount">
          <RadioGroupLabel class="font-medium text-gray-900 sm:text-sm">
            {{ $t('presences.detail.amount.label') }}
          </RadioGroupLabel>
          <div class="mt-1 flex flex-row gap-3">
            <RadioGroupOption
              v-for="amountOption in [
                { label: $t('presences.detail.amount.value.NONE'), value: PresenceDayAmount.NONE },
                { label: $t('presences.detail.amount.value.HALF'), value: PresenceDayAmount.HALF },
                { label: $t('presences.detail.amount.value.FULL'), value: PresenceDayAmount.FULL },
              ]"
              :key="amountOption.label"
              as="template"
              :value="amountOption.value"
              v-slot="{ active, checked }">
              <div
                :class="[
                  'cursor-pointer text-center focus:outline-none',
                  active && 'ring-2 ring-indigo-500 ring-offset-2',
                  checked
                    ? 'border-transparent bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
                  'flex flex-1 items-center justify-center rounded-md border p-3 font-medium sm:text-sm',
                ]">
                <RadioGroupLabel as="span">{{ amountOption.label }}</RadioGroupLabel>
              </div>
            </RadioGroupOption>
          </div>
        </RadioGroup>
        <ul class="min-h-[1.4rem] px-3 text-xs">
          <li
            v-for="error in vuelidate.amount.$errors.map(({ $message }) => $message)"
            :key="`error-${error}`"
            class="text-red-600">
            {{ error }}
          </li>
        </ul>

        <AppTextField
          id="reason"
          v-model.number="state.reason"
          :errors="vuelidate.reason.$errors.map(({ $message }) => $message as string)"
          :label="$t('presences.detail.reason.label')"
          :placeholder="$t('presences.detail.reason.placeholder')"
          required />

        <AppButton
          class="mt-1 self-start border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500"
          :icon="mdiCheck"
          :loading="state.isSubmitting"
          type="submit">
          {{ $t('action.edit') }}
        </AppButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppButton from '@/components/form/AppButton.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import { Attendance, AttendanceType } from '@/services/api/members';
import { useNotificationsStore } from '@/store/notifications';
import {
  DialogTitle,
  RadioGroup,
  RadioGroupDescription,
  RadioGroupLabel,
  RadioGroupOption,
} from '@headlessui/vue';
import { mdiCheck, mdiCheckCircle, mdiChevronLeft, mdiChevronRight, mdiClose } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import dayjs from 'dayjs';
import { PropType, computed, nextTick, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

enum PresenceDayAmount {
  'NONE' = 0,
  'HALF' = 0.5,
  'FULL' = 1,
}

const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  presences: {
    type: Array as PropType<Attendance[]>,
    default: () => [],
  },
  date: {
    type: String,
    required: true,
  },
});

const state = reactive({
  type: 'TICKET' as AttendanceType,
  amount: PresenceDayAmount.NONE as PresenceDayAmount,
  reason: null as string | null,
  isSubmitting: false as boolean,
});

const selectedPresence = computed<Attendance | null>(() => {
  return props.presences.find(({ date }) => `${date}` === `${props.date}`) ?? null;
});

const previousPresence = computed<Attendance | null>(() => {
  const [latestDate] = props.presences
    .filter(({ date }) => dayjs(date).isBefore(selectedPresence.value?.date))
    .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
  return latestDate ?? null;
});

const nextPresence = computed<Attendance | null>(() => {
  const [earliestDate] = props.presences
    .filter(({ date }) => dayjs(date).isAfter(selectedPresence.value?.date))
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  return earliestDate ?? null;
});

const rules = computed(() => ({
  type: { required: withAppI18nMessage(required) },
  amount: { required: withAppI18nMessage(required) },
  reason: { required: withAppI18nMessage(required) },
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
      notificationsStore.addErrorNotification(error, i18n.t('presences.detail.onFail.message'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};

watch(
  () => selectedPresence.value,
  (presence) => {
    if (presence) {
      state.type = presence.type;
      state.amount =
        presence.amount === 1
          ? PresenceDayAmount.FULL
          : presence.amount === 0.5
            ? PresenceDayAmount.HALF
            : PresenceDayAmount.NONE;
      state.reason = null;
    }
  },
  { immediate: true },
);
</script>
