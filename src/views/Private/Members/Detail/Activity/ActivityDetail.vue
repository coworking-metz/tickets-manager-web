<template>
  <div class="flex h-full flex-col">
    <div class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex flex-row items-center justify-between">
        <DialogTitle
          :class="['shrink truncate text-lg font-medium text-white', loading && 'animate-pulse']">
          <div v-if="loading" class="h-4 w-48 rounded-full bg-slate-300" />
          <template v-else-if="!selected">
            {{ $t('activity.detail.empty.title') }}
          </template>
          <template v-else-if="selected">
            {{
              $t('activity.detail.title', {
                date: dayjs(selected.date).format('dddd LL'),
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
            <SvgIcon aria-hidden="true" class="size-6" :path="mdiClose" type="mdi" />
          </RouterLink>
        </div>
      </div>
      <div v-if="loading" class="h-3 w-64 rounded-full bg-slate-400" />
      <p v-else-if="selected" class="text-sm text-indigo-300">
        {{ $t('activity.detail.description') }}
      </p>
    </div>
    <LoadingSpinner v-if="loading" class="m-auto size-16" />
    <EmptyState
      v-else-if="!selected"
      class="m-auto"
      :description="$t('activity.detail.empty.description')"
      :title="$t('activity.detail.empty.title')" />
    <div v-else class="flex flex-col px-4 py-6 sm:px-6">
      <nav class="flex flex-row">
        <RouterLink
          v-if="previous"
          class="mr-auto inline-flex items-center rounded-md p-2 font-medium text-gray-500 transition-colors hover:border-gray-200 hover:bg-slate-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
          replace
          :to="{
            name: ROUTE_NAMES.MEMBERS.DETAIL.ACTIVITY.DETAIL,
            params: { date: previous.date },
          }">
          <SvgIcon
            aria-hidden="true"
            class="mr-1 size-5 text-gray-400"
            :path="mdiChevronLeft"
            type="mdi" />
          {{ dayjs(previous.date).format('dddd DD/MM') }}
        </RouterLink>
        <RouterLink
          v-if="next"
          class="ml-auto inline-flex items-center rounded-md p-2 font-medium text-gray-500 transition-colors hover:border-gray-200 hover:bg-slate-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
          replace
          :to="{
            name: ROUTE_NAMES.MEMBERS.DETAIL.ACTIVITY.DETAIL,
            params: { date: next.date },
          }">
          {{ dayjs(next.date).format('dddd DD/MM') }}
          <SvgIcon
            aria-hidden="true"
            class="ml-1 size-5 text-gray-400"
            :path="mdiChevronRight"
            type="mdi" />
        </RouterLink>
      </nav>
      <form class="mt-6 flex h-full flex-col" @submit.prevent="onSubmit">
        <Head>
          <title>
            {{
              $t('activity.detail.head.title', {
                date: dayjs(selected.date).format('LL'),
              })
            }}
          </title>
        </Head>

        <!-- <p class="font-medium text-gray-900 sm:text-sm">
          {{ $t('activity.detail.daily.label') }}
        </p>
        <DailyActivityGraph class="mb-4" /> -->
        <div v-if="nonCompliant" class="mb-5 flex flex-row rounded-lg bg-red-50 p-4">
          <SvgIcon
            aria-hidden="true"
            class="size-5 shrink-0 text-red-700"
            :path="mdiAlertCircle"
            type="mdi" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              {{ $t('activity.detail.nonCompliant.title') }}
            </h3>
            <i18n-t
              class="mt-2 whitespace-pre-line text-sm text-red-700"
              keypath="activity.detail.nonCompliant.description"
              scope="global"
              tag="p">
              <template #emphasized>
                <span class="font-semibold">
                  {{ $t('activity.detail.nonCompliant.emphasized', { count: nonCompliant.value }) }}
                </span>
              </template>
            </i18n-t>
          </div>
        </div>

        <RadioGroup v-model="state.type">
          <RadioGroupLabel class="font-medium text-gray-900 sm:text-sm">
            {{ $t('activity.detail.type.label') }}
          </RadioGroupLabel>

          <div class="mt-1 flex flex-row gap-3">
            <RadioGroupOption
              v-for="typeOption in ['subscription', 'ticket']"
              :key="`attendance-type-${typeOption}`"
              as="template"
              disabled
              :value="typeOption"
              v-slot="{ checked, active }">
              <div
                :class="[
                  checked ? 'border-transparent' : 'border-gray-300 ',
                  active ? 'border-indigo-500 ring-2 ring-indigo-500' : '',
                  'relative flex flex-1 rounded-lg border bg-white p-4 shadow-sm focus:outline-none',
                ]">
                <span class="flex flex-1">
                  <span class="flex flex-col">
                    <RadioGroupLabel as="span" class="block font-medium text-gray-900 sm:text-sm">
                      {{ $t(`activity.detail.type.value.${typeOption}.label`) }}
                    </RadioGroupLabel>
                    <RadioGroupDescription
                      as="span"
                      class="mt-1 flex items-center text-sm text-gray-500">
                      {{ $t(`activity.detail.type.value.${typeOption}.description`) }}
                    </RadioGroupDescription>
                  </span>
                </span>
                <SvgIcon
                  aria-hidden="true"
                  :class="[!checked && 'invisible', 'size-5 text-indigo-600']"
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

        <RadioGroup v-model="state.duration">
          <RadioGroupLabel class="font-medium text-gray-900 sm:text-sm">
            {{ $t('activity.detail.duration.label') }}
          </RadioGroupLabel>
          <div class="mt-1 flex flex-row gap-3">
            <RadioGroupOption
              v-for="durationOption in [
                { label: $t('activity.detail.duration.value.NONE'), value: ActivityDuration.NONE },
                { label: $t('activity.detail.duration.value.HALF'), value: ActivityDuration.HALF },
                { label: $t('activity.detail.duration.value.FULL'), value: ActivityDuration.FULL },
              ]"
              :key="durationOption.label"
              as="template"
              :value="durationOption.value"
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
                <RadioGroupLabel as="span">{{ durationOption.label }}</RadioGroupLabel>
              </div>
            </RadioGroupOption>
          </div>
        </RadioGroup>
        <ul class="min-h-[1.4rem] px-3 text-xs">
          <li
            v-for="error in vuelidate.duration.$errors.map(({ $message }) => $message)"
            :key="`error-${error}`"
            class="text-red-600">
            {{ error }}
          </li>
        </ul>

        <AppTextareaField
          id="comment"
          v-model="state.comment"
          :errors="vuelidate.comment.$errors.map(({ $message }) => $message as string)"
          :label="$t('activity.detail.comment.label')"
          :placeholder="$t('activity.detail.comment.placeholder')"
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
// import DailyActivityGraph from './DailyActivityGraph.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppButton from '@/components/form/AppButton.vue';
import AppTextareaField from '@/components/form/AppTextareaField.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import { Attendance, AttendanceType, updateMemberActivity } from '@/services/api/members';
import { useNotificationsStore } from '@/store/notifications';
import {
  DialogTitle,
  RadioGroup,
  RadioGroupDescription,
  RadioGroupLabel,
  RadioGroupOption,
} from '@headlessui/vue';
import {
  mdiAlertCircle,
  mdiCheck,
  mdiCheckCircle,
  mdiChevronLeft,
  mdiChevronRight,
  mdiClose,
} from '@mdi/js';
import { Head } from '@unhead/vue/components';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import dayjs from 'dayjs';
import { PropType, computed, nextTick, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

enum ActivityDuration {
  'NONE' = 0,
  'HALF' = 0.5,
  'FULL' = 1,
}

const router = useRouter();
const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  activity: {
    type: Array as PropType<Attendance[]>,
    default: () => [],
  },
  date: {
    type: String,
    required: true,
  },
  memberId: {
    type: String,
    required: true,
  },
  nonCompliantActivity: {
    type: Array as PropType<Attendance[]>,
    default: () => [],
  },
});

const state = reactive({
  type: 'TICKET' as AttendanceType,
  duration: ActivityDuration.NONE as ActivityDuration,
  comment: null as string | null,
  isSubmitting: false as boolean,
});

const selected = computed<Attendance | null>(() => {
  return props.activity.find(({ date }) => `${date}` === `${props.date}`) ?? null;
});

const previous = computed<Attendance | null>(() => {
  const [latestDate] = props.activity
    .filter(({ date }) => dayjs(date).isBefore(selected.value?.date))
    .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
  return latestDate ?? null;
});

const next = computed<Attendance | null>(() => {
  const [earliestDate] = props.activity
    .filter(({ date }) => dayjs(date).isAfter(selected.value?.date))
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  return earliestDate ?? null;
});

const nonCompliant = computed(() => {
  return props.nonCompliantActivity.find(({ date }) => dayjs(props.date).isSame(date));
});

const rules = computed(() => ({
  type: { required: withAppI18nMessage(required) },
  duration: { required: withAppI18nMessage(required) },
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
  updateMemberActivity(props.memberId, props.date, {
    type: state.type,
    value: state.duration,
    date: props.date,
    comment: state.comment as string,
  })
    .then(() => {
      notificationsStore.addNotification({
        type: 'success',
        message: i18n.t('activity.detail.onUpdate.success', {
          date: dayjs(props.date).format('dddd LL'),
        }),
        timeout: 3_000,
      });
      router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX });
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('activity.detail.onUpdate.fail', {
          date: dayjs(props.date).format('dddd LL'),
        }),
      );
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};

watch(
  () => selected.value,
  (activity) => {
    if (activity) {
      state.type = activity.type;
      state.duration =
        activity.value === 1
          ? ActivityDuration.FULL
          : activity.value === 0.5
            ? ActivityDuration.HALF
            : ActivityDuration.NONE;
      state.comment = null;
    }
  },
  { immediate: true },
);
</script>
