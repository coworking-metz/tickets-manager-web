<template>
  <div class="flex min-h-full flex-col bg-white pb-6 dark:bg-neutral-800">
    <header class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex flex-row items-center justify-between">
        <DialogTitle
          :class="[
            'shrink truncate text-lg font-medium text-white',
            isFetchingActivity && 'animate-pulse',
          ]">
          <div v-if="isFetchingActivity" class="h-4 w-48 rounded-full bg-slate-300" />
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
    </header>
    <LoadingSpinner v-if="isFetchingActivity" class="m-auto size-16" />
    <ErrorState
      v-else-if="activityErrorText"
      class="m-auto"
      :description="activityErrorText"
      :title="$t('activity.detail.onFetch.fail', { date: dayjs(date).format('LL') })" />
    <EmptyState
      v-else-if="!selected"
      class="m-auto"
      :description="$t('activity.detail.empty.description')"
      :title="$t('activity.detail.empty.title')" />
    <div v-else class="flex flex-col px-4 pt-6 sm:px-6">
      <nav class="flex flex-row">
        <AppButtonText
          v-if="previous"
          class="mr-auto dark:focus:ring-offset-neutral-800"
          color="gray"
          :icon="mdiChevronLeft"
          replace
          :to="{
            name: ROUTE_NAMES.MEMBERS.DETAIL.ACTIVITY.DETAIL,
            params: { date: previous.date },
          }">
          {{ dayjs(previous.date).format('dddd DD/MM') }}
        </AppButtonText>
        <AppButtonText
          v-if="next"
          class="ml-auto dark:focus:ring-offset-neutral-800"
          color="gray"
          replace
          :to="{
            name: ROUTE_NAMES.MEMBERS.DETAIL.ACTIVITY.DETAIL,
            params: { date: next.date },
          }">
          {{ dayjs(next.date).format('dddd DD/MM') }}
          <SvgIcon aria-hidden="true" class="size-5" :path="mdiChevronRight" type="mdi" />
        </AppButtonText>
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

        <!-- <p class="font-medium text-gray-900 dark:text-gray-100 sm:text-sm">
          {{ $t('activity.detail.daily.label') }}
        </p>
        <DailyActivityGraph class="mb-4" /> -->
        <AppAlert
          v-if="selected?.coverage.debt?.value"
          class="mb-5 rounded-xl"
          :icon="mdiAlertCircle"
          :title="$t('activity.detail.nonCompliant.title')"
          type="error">
          <template #description>
            <i18n-t
              class="whitespace-pre-line text-sm text-red-700 dark:text-red-400"
              keypath="activity.detail.nonCompliant.description"
              scope="global"
              tag="p">
              <template #emphasized>
                <span class="font-semibold text-red-800 dark:text-red-300">
                  {{
                    $t('activity.detail.nonCompliant.emphasized', {
                      count: selected?.coverage.debt?.value,
                    })
                  }}
                </span>
              </template>
            </i18n-t>
          </template>
        </AppAlert>

        <RadioGroup v-model="state.type" disabled>
          <RadioGroupLabel class="font-medium text-gray-900 sm:text-sm dark:text-gray-100">
            {{ $t('activity.detail.type.label') }}
          </RadioGroupLabel>

          <div class="mt-1 flex flex-row gap-3">
            <RadioGroupOption
              v-for="typeOption in ['subscription', 'ticket']"
              :key="`attendance-type-${typeOption}`"
              as="template"
              :value="typeOption"
              v-slot="{ checked, active, disabled }">
              <div
                :class="[
                  checked ? 'border-transparent' : 'border-gray-300',
                  active && 'border-indigo-500 ring-2 ring-indigo-500',
                  'relative flex flex-1 rounded-lg border bg-white p-4 shadow-sm focus:outline-none dark:bg-neutral-800',
                  disabled && 'cursor-not-allowed',
                  disabled && !checked && 'opacity-50',
                ]">
                <span class="flex flex-1">
                  <span class="flex flex-col">
                    <RadioGroupLabel
                      as="span"
                      class="block font-medium text-gray-900 sm:text-sm dark:text-gray-100">
                      {{ $t(`activity.detail.type.value.${typeOption}.label`) }}
                    </RadioGroupLabel>
                    <RadioGroupDescription
                      as="span"
                      class="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      {{ $t(`activity.detail.type.value.${typeOption}.description`) }}
                    </RadioGroupDescription>
                  </span>
                </span>
                <SvgIcon
                  aria-hidden="true"
                  :class="[!checked && 'invisible', 'size-5 text-indigo-600 dark:text-indigo-500']"
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
          <RadioGroupLabel class="font-medium text-gray-900 sm:text-sm dark:text-gray-100">
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
                    ? 'border-transparent bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                    : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-neutral-800 dark:text-gray-100',
                  'flex flex-1 items-center justify-center rounded-md border p-3 font-medium sm:text-sm dark:hover:bg-neutral-700 dark:focus:ring-offset-neutral-800',
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

        <AppButtonPlain
          class="mt-1 self-start dark:focus:ring-offset-neutral-800"
          color="indigo"
          :icon="mdiCheck"
          :loading="state.isSubmitting"
          type="submit">
          {{ $t('action.edit') }}
        </AppButtonPlain>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// import DailyActivityGraph from './DailyActivityGraph.vue';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppAlert from '@/components/form/AppAlert.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppButtonText from '@/components/form/AppButtonText.vue';
import AppTextareaField from '@/components/form/AppTextareaField.vue';
import { ActivityDuration, getActivityDuration } from '@/helpers/activity';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import {
  Attendance,
  AttendanceType,
  getMemberActivity,
  updateMemberActivity,
} from '@/services/api/members';
import { membersQueryKeys, useAppQuery } from '@/services/query';
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
import { useQueryClient } from '@tanstack/vue-query';
import { Head } from '@unhead/vue/components';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import dayjs from 'dayjs';
import { computed, nextTick, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const router = useRouter();
const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const props = defineProps({
  date: {
    type: String,
    required: true,
  },
  memberId: {
    type: String,
    required: true,
  },
});

const queryClient = useQueryClient();
const state = reactive({
  type: 'ticket' as AttendanceType,
  duration: ActivityDuration.NONE as ActivityDuration,
  comment: null as string | null,
  isSubmitting: false as boolean,
});

const {
  isFetching: isFetchingActivity,
  data: activity,
  errorText: activityErrorText,
} = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.activityById(props.memberId),
    queryFn: () => getMemberActivity(props.memberId),
  })),
);

const selected = computed(() => {
  return activity.value?.find(({ date }) => `${date}` === `${props.date}`) ?? null;
});

const previous = computed(() => {
  const [latestDate] =
    activity.value
      ?.filter(({ date }) => dayjs(date).isBefore(selected.value?.date))
      .sort((a, b) => dayjs(b.date).diff(dayjs(a.date))) ?? [];
  return latestDate ?? null;
});

const next = computed(() => {
  const [earliestDate] =
    activity.value
      ?.filter(({ date }) => dayjs(date).isAfter(selected.value?.date))
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date))) ?? [];
  return earliestDate ?? null;
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
    ...(selected.value as Attendance),
    value: state.duration,
    comment: state.comment as string,
  })
    .then(async () => {
      notificationsStore.addNotification({
        type: 'success',
        message: i18n.t('activity.detail.onUpdate.success', {
          date: dayjs(props.date).format('dddd LL'),
        }),
        timeout: 3_000,
      });
      await router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.byId(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.activityById(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.historyById(props.memberId),
      });
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
      state.duration = getActivityDuration(activity.value);
      state.comment = null;
    }
  },
  { immediate: true },
);
</script>
