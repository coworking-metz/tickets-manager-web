<template>
  <div class="flex grow flex-col">
    <Head>
      <title>{{ $t('stats.activity.daily.head.title') }}</title>
    </Head>

    <section class="mx-auto flex w-full grow flex-col min-[1680px]:flex-row">
      <div class="max-h-0 shrink grow basis-0" />
      <div class="flex min-h-[320px] w-full max-w-5xl grow flex-col">
        <StatsActivityPeriodGraph
          :activities="dailyActivities"
          :loading="state.isFetchingActivities"
          :options="options"
          @click="onBarSelect" />
      </div>

      <div class="flex shrink basis-0 flex-col items-start min-[1680px]:grow">
        <fieldset class="mx-auto w-full min-w-16 max-w-5xl px-3 pb-6 sm:px-6 min-[1680px]:px-0">
          <legend class="sr-only">{{ $t('stats.activity.daily.weekDays.label') }}</legend>
          <p
            aria-hidden="true"
            class="block font-medium text-gray-900 sm:text-sm dark:text-gray-100">
            {{ $t('stats.activity.daily.weekDays.label') }}
          </p>
          <ul
            class="mt-1 flex flex-row flex-wrap items-start gap-x-4 gap-y-2 min-[1680px]:flex-col">
            <li
              v-for="weekDay in state.selectedWeekDays"
              :key="`day-${weekDay.index}`"
              :class="[
                'flex flex-row items-center gap-2 rounded-full px-3 ring-1 ring-inset transition-colors',
                weekDay.value
                  ? 'bg-indigo-500/10 text-indigo-700 ring-indigo-500/20 hover:bg-indigo-500/20 active:bg-indigo-500/30'
                  : 'bg-white text-gray-700 ring-gray-500/20 hover:bg-gray-200 active:bg-gray-300 dark:bg-neutral-800',
              ]">
              <input
                :id="`day-${weekDay.index}`"
                v-model="weekDay.value"
                class="size-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:text-indigo-500"
                :name="`day-${weekDay.index}`"
                type="checkbox" />
              <label
                class="size-full cursor-pointer select-none py-2 text-sm font-medium"
                :for="`day-${weekDay.index}`">
                {{ dayjs().set('day', weekDay.index).format('dddd') }}
              </label>
            </li>
          </ul>
        </fieldset>
      </div>
    </section>

    <section class="mx-auto w-full max-w-5xl px-3 sm:px-6">
      <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
        {{ $t('stats.activity.daily.summary.label') }}
      </h3>
      <dl
        class="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow md:grid-cols-2 md:divide-x md:divide-y-0 dark:divide-stone-700 dark:bg-neutral-800">
        <div class="px-4 py-5 sm:p-6">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t('stats.activity.daily.summary.average.people.label') }}
          </dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div
              v-if="state.isFetchingActivities"
              class="mb-1 h-8 w-32 animate-pulse rounded-3xl bg-slate-200" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              :duration="1"
              :format="
                (count: number) =>
                  `${
                    count
                      ? formatAmount(count, {
                          maximumFractionDigits: 1,
                          style: 'decimal',
                        })
                      : ''
                  }${$t('stats.activity.daily.summary.average.people.format', {
                    count,
                  })}`
              "
              :to="averagePeopleCount" />
          </dd>

          <div
            v-if="state.isFetchingActivities"
            class="mt-1 h-5 w-48 animate-pulse rounded-3xl bg-slate-200" />
          <div
            v-else-if="state.activities.length"
            class="flex flex-row items-baseline justify-between text-sm">
            <span class="shrink grow basis-0 truncate font-normal text-gray-500 dark:text-gray-400">
              {{
                $t('stats.activity.daily.summary.average.people.threshold', {
                  threshold: MAX_ATTENDANCE,
                })
              }}
            </span>
            <div
              :class="[
                'rounded-full px-2.5 py-0.5 font-medium',
                averagePeopleCount > MAX_ATTENDANCE
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800',
              ]">
              {{ `${averagePeopleCount > MAX_ATTENDANCE ? '+' : ''}` }}
              <AnimatedCounter
                :duration="1"
                :format="(count: number) => fractionPercentage(count, $i18n.locale)"
                :to="
                  (averagePeopleCount -
                    (averagePeopleCount > MAX_ATTENDANCE ? MAX_ATTENDANCE : 0)) /
                  MAX_ATTENDANCE
                " />
            </div>
          </div>
        </div>

        <div class="px-4 py-5 sm:p-6">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t('stats.activity.daily.summary.average.attendance.label') }}
          </dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div
              v-if="state.isFetchingActivities"
              class="mb-1 h-8 w-32 animate-pulse rounded-3xl bg-slate-200" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              :duration="1"
              :format="
                (count: number) =>
                  new Intl.NumberFormat($i18n.locale, {
                    style: 'percent',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(count)
              "
              :to="averageAttendance" />
          </dd>

          <div
            v-if="state.isFetchingActivities"
            class="mt-1 h-5 w-48 animate-pulse rounded-3xl bg-slate-200" />
          <div
            v-else-if="state.activities.length"
            class="flex flex-row items-baseline justify-between text-sm">
            <span class="shrink grow basis-0 truncate font-normal text-gray-500 dark:text-gray-400">
              {{ $t('stats.activity.daily.summary.average.attendance.description') }}
            </span>
          </div>
        </div>
      </dl>
    </section>
  </div>
</template>

<script lang="ts" setup>
import StatsActivityPeriodGraph from './StatsActivityPeriodGraph.vue';
import { formatAmount, fractionPercentage } from '@/helpers/currency';
import { DATE_FORMAT } from '@/helpers/dates';
import { handleSilentError } from '@/helpers/errors';
import { ROUTE_NAMES } from '@/router/names';
import { ActivityPeriod, getActivityPerDay, MAX_ATTENDANCE } from '@/services/api/activity';
import { useNotificationsStore } from '@/store/notifications';
import { theme } from '@/styles/colors';
import { Head } from '@unhead/vue/components';
import dayjs from 'dayjs';
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components.js';
import type { ComposeOption } from 'echarts/core.js';

// week should start on monday
const WEEK_DAYS_INDEXES = [...Array(7).keys()].map((index) => (index + 1) % 7);

const props = defineProps({
  from: {
    type: String,
    default: null,
  },
  to: {
    type: String,
    default: null,
  },
});

const router = useRouter();
const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const state = reactive({
  isFetchingActivities: false,
  activities: [] as ActivityPeriod<'day'>[],
  selectedWeekDays: WEEK_DAYS_INDEXES.map((i) => ({ index: i, value: true })),
});

const dailyActivities = computed(() => {
  return state.activities.filter(({ date }) => {
    const dayIndex = dayjs(date).day();
    return state.selectedWeekDays.find(({ index }) => index === dayIndex)?.value;
  });
});

const totalPeopleCount = computed(() =>
  dailyActivities.value
    .map(({ data }) => data.coworkersCount)
    .reduce((acc, membersCount) => acc + membersCount, 0),
);

const averagePeopleCount = computed(() => {
  return totalPeopleCount.value / dailyActivities.value.length || 0;
});

const averageAttendance = computed(() => {
  return (
    dailyActivities.value
      .map(({ data }) => data.coworkedDaysAmount)
      .reduce((acc, amount) => acc + amount, 0) / totalPeopleCount.value || 0
  );
});

const options = computed<ComposeOption<GridComponentOption | TooltipComponentOption>>(() => ({
  tooltip: {
    className: '!p-0 !border-0',
    formatter: (params) => {
      const {
        data: { coworkersCount, newCoworkersCount, coworkedDaysAmount },
        date, // @ts-ignore
      } = dailyActivities.value[params[0].dataIndex];
      return `
        <dl class="flex flex-col min-w-48 items-end gap-1 p-4 text-gray-700 bg-white dark:text-gray-300 dark:bg-neutral-800">
          <dt class="truncate font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
            ${dayjs(date).format('dddd LL')}
          </dt>

          <dd class="flex flex-col items-end">
            <span class="text-3xl font-semibold text-gray-900 dark:text-gray-100">${
              coworkersCount ||
              i18n.t('stats.activity.daily.graph.tooltip.total', {
                count: coworkersCount,
              })
            }</span>
            ${
              coworkersCount
                ? i18n.t('stats.activity.daily.graph.tooltip.total', {
                    count: coworkersCount,
                  })
                : ''
            }
          </dd>

          <p class="flex flex-row gap-1 items-center text-base font-normal">
            ${i18n.t('stats.activity.daily.graph.tooltip.newMembers.label', {
              count: newCoworkersCount,
            })}
            <span class="block h-3 w-3 rounded-full" style="background-color: ${
              theme.blueCrayola
            };"></span>
          </p>

          <p class="flex flex-row gap-1 items-center text-base font-normal">
            ${i18n.t('stats.activity.daily.graph.tooltip.members.label', {
              count: coworkersCount - newCoworkersCount,
            })}
            <span class="block h-3 w-3 rounded-full" style="background-color: ${
              theme.frenchSkyBlue
            };"></span>
          </p>

          <p class="flex flex-row gap-1 items-center text-base font-normal">
            ${i18n.t('stats.activity.daily.graph.tooltip.activity.label', {
              count: coworkedDaysAmount,
            })}
            <span class="block h-3 w-3 rounded-full" style="background-color: ${
              theme.meatBrown
            };"></span>
          </p>
        </dl>
      `;
    },
  },
  xAxis: {
    axisLabel: {
      formatter: (value: string) => dayjs(value).format('ll').slice(0, -4),
      align: 'center',
    },
  },
}));

const fetchActivities = (from: string, to: string) => {
  state.isFetchingActivities = true;
  Promise.all([
    getActivityPerDay(from, to)
      .then((activities) => {
        state.activities = activities;
      })
      .catch(handleSilentError)
      .catch((error) => {
        notificationsStore.addErrorNotification(error, i18n.t('stats.activity.daily.onFetch.fail'));
        return Promise.reject(error);
      }),
    // wait at least 500ms
    // because the is the time for the transition to fully animate
    // and it needs to be done before echarts can be rendered
    new Promise((resolve) => setTimeout(resolve, 400)),
  ]).finally(() => {
    state.isFetchingActivities = false;
  });
};

const onBarSelect = ({ dataIndex }: { dataIndex: number }) => {
  const { date } = (dailyActivities.value ?? [])[dataIndex];
  router.push({
    name: ROUTE_NAMES.ATTENDANCE,
    params: {
      date: dayjs(date).format(DATE_FORMAT),
    },
  });
};

watch(
  [() => props.from, () => props.to],
  ([from, to]) => {
    if (dayjs(from).isValid() || dayjs(to).isValid()) {
      fetchActivities(from, to);
    }
  },
  { immediate: true },
);
</script>
