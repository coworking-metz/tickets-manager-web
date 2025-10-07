<template>
  <div class="mx-auto flex w-full max-w-5xl grow flex-col">
    <Head>
      <title>{{ $t(`${i18nKeyPrefix}.head.title`) }}</title>
    </Head>
    <section class="flex grow basis-80 flex-col">
      <LoadingSpinner v-if="isPendingActivities" class="m-auto size-16" />
      <ErrorState
        v-else-if="activitiesErrorText"
        class="m-auto pb-16"
        :description="activitiesErrorText"
        :title="$t(`${i18nKeyPrefix}.onFetch.fail`)" />
      <EmptyState
        v-else-if="!activities?.length"
        :animation="AnalyticsGraph"
        class="m-auto pb-16"
        :description="$t('stats.activity.empty.description')"
        :title="$t('stats.activity.empty.title')" />
      <StatsActivityPeriodGraph
        v-else
        :activities="dailyActivities"
        :options="options"
        @click="onSelectDate" />
    </section>

    <section class="max-sm:mx-3">
      <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
        {{ $t(`${i18nKeyPrefix}.summary.label`) }}
      </h3>
      <dl
        class="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow md:grid-cols-2 md:divide-x md:divide-y-0 dark:divide-stone-700 dark:bg-neutral-800">
        <div class="px-4 py-5 sm:p-6">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t(`${i18nKeyPrefix}.summary.average.people.label`) }}
          </dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div
              v-if="isFetchingActivities"
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
            v-if="isFetchingActivities"
            class="mt-1 h-5 w-48 animate-pulse rounded-3xl bg-slate-200" />
          <div
            v-else-if="activities?.length"
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
            {{ $t(`${i18nKeyPrefix}.summary.average.attendance.label`) }}
          </dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div
              v-if="isFetchingActivities"
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
            v-if="isFetchingActivities"
            class="mt-1 h-5 w-48 animate-pulse rounded-3xl bg-slate-200" />
          <div
            v-else-if="activities?.length"
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
import AnalyticsGraph from '@/assets/animations/analytics-graph.lottie';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { formatAmount, fractionPercentage } from '@/helpers/currency';
import { DATE_FORMAT } from '@/helpers/dates';
import { ROUTE_NAMES } from '@/router/names';
import { MAX_ATTENDANCE } from '@/services/api/attendance';
import { ActivityPeriod, getActivityPerPeriod } from '@/services/api/stats/activity';
import { Frequency, getChildFrequency } from '@/services/api/stats/frequency';
import { statsQueryKeys, useAppQuery } from '@/services/query';
import { theme } from '@/styles/colors';
import { useStatsColors } from '@/views/Private/Stats/statsColors';
import { Head } from '@unhead/vue/components';
import dayjs from 'dayjs';
import { computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components.js';
import type { ComposeOption } from 'echarts/core.js';

const props = defineProps({
  frequency: {
    type: String as PropType<Frequency>,
    required: true,
  },
  from: {
    type: String,
    default: null,
  },
  to: {
    type: String,
    default: null,
  },
  weekDays: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
});

const router = useRouter();
const i18n = useI18n();
const statsColors = useStatsColors();

const i18nKeyPrefix = computed(() => {
  switch (props.frequency) {
    case 'day':
      return 'stats.activity.daily';
    case 'week':
      return 'stats.activity.weekly';
    case 'month':
      return 'stats.activity.monthly';
    case 'year':
      return 'stats.activity.yearly';
    default:
      return 'stats.activity.unknown';
  }
});

const {
  isPending: isPendingActivities,
  isFetching: isFetchingActivities,
  data: activities,
  errorText: activitiesErrorText,
} = useAppQuery<ActivityPeriod<Frequency>[]>(
  computed(() => ({
    queryKey: statsQueryKeys.activityInPeriod(props.frequency, props.from, props.to),
    queryFn: () => getActivityPerPeriod(props.frequency, props.from, props.to),
  })),
);

const dailyActivities = computed(() => {
  return (activities.value ?? []).filter(({ date }) => props.weekDays.includes(dayjs(date).day()));
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

const getTooltipTitle = (date: string) => {
  switch (props.frequency) {
    case 'day':
      return dayjs(date).format('dddd LL');
    case 'week':
      return i18n.t(`${i18nKeyPrefix.value}.graph.tooltip.date.label`, {
        start: dayjs(date).startOf('week').format('ll'),
        end: dayjs(date).endOf('week').format('ll'),
      });
    case 'month':
      return dayjs(date).format('MMMM YYYY');
    case 'year':
      return dayjs(date).format('YYYY');
    default:
      return date;
  }
};

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
            ${getTooltipTitle(date)}
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
              statsColors.value.newMember
            };"></span>
          </p>

          <p class="flex flex-row gap-1 items-center text-base font-normal">
            ${i18n.t('stats.activity.daily.graph.tooltip.members.label', {
              count: coworkersCount - newCoworkersCount,
            })}
            <span class="block h-3 w-3 rounded-full" style="background-color: ${
              statsColors.value.member
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
      formatter: (date: string) => {
        switch (props.frequency) {
          case 'month':
            return dayjs(date).format('MMM');
          case 'year':
            return dayjs(date).format('YYYY');
          default:
            return dayjs(date).format('ll').slice(0, -4);
        }
      },
      align: 'center',
    },
  },
}));

const onSelectDate = ({ dataIndex }: { dataIndex: number }) => {
  const element = (activities.value ?? [])[dataIndex];
  const { date, type } = element;
  if (type === 'day') {
    router.push({
      name: ROUTE_NAMES.ATTENDANCE,
      params: {
        date: dayjs(date).format(DATE_FORMAT),
      },
    });
  } else {
    router.push({
      name: router.currentRoute.value.name,
      query: {
        ...router.currentRoute.value.query,
        from: dayjs(date).startOf(props.frequency).format(DATE_FORMAT),
        to: dayjs(date).endOf(props.frequency).format(DATE_FORMAT),
        frequency: getChildFrequency(type),
      },
    });
  }
};
</script>
