<template>
  <div class="mx-auto flex w-full max-w-5xl grow flex-col">
    <Head>
      <title>{{ $t('stats.activity.weekly.head.title') }}</title>
    </Head>

    <section class="flex min-h-[320px] grow flex-col">
      <StatsActivityPeriodGraph
        :activities="state.activities"
        :loading="state.isFetchingActivities"
        :options="options" />
    </section>

    <section class="mx-3 sm:mx-6">
      <h3 class="text-lg font-medium leading-6 text-gray-900">
        {{ $t('stats.activity.weekly.summary.label') }}
      </h3>
      <dl
        class="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow md:grid-cols-2 md:divide-x md:divide-y-0">
        <div class="px-4 py-5 sm:p-6">
          <dt class="truncate font-medium text-gray-500 sm:text-sm">
            {{ $t('stats.activity.weekly.summary.average.people.label') }}
          </dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div
              v-if="state.isFetchingActivities"
              class="mb-1 h-8 w-32 animate-pulse rounded-3xl bg-slate-200" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900"
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
                  }${$t('stats.activity.weekly.summary.average.people.format', {
                    count,
                  })}`
              "
              :to="averagePeopleCount" />
          </dd>
        </div>

        <div class="px-4 py-5 sm:p-6">
          <dt class="truncate font-medium text-gray-500 sm:text-sm">
            {{ $t('stats.activity.weekly.summary.average.attendance.label') }}
          </dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div
              v-if="state.isFetchingActivities"
              class="mb-1 h-8 w-32 animate-pulse rounded-3xl bg-slate-200" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900"
              :duration="1"
              :format="
                (count: number) =>
                  `${formatAmount(count, {
                    maximumFractionDigits: 2,
                    style: 'decimal',
                  })}${$t('stats.activity.weekly.summary.average.attendance.format', {
                    count,
                  })}`
              "
              :to="averageAttendance" />
          </dd>

          <div
            v-if="state.isFetchingActivities"
            class="mt-1 h-5 w-48 animate-pulse rounded-3xl bg-slate-200" />
          <div v-else class="flex flex-row items-baseline justify-between text-sm">
            <span class="shrink grow basis-0 truncate font-normal text-gray-500">
              {{ $t('stats.activity.weekly.summary.average.attendance.description') }}
            </span>
          </div>
        </div>
      </dl>
    </section>
  </div>
</template>

<script lang="ts" setup>
import StatsActivityPeriodGraph from './StatsActivityPeriodGraph.vue';
import { formatAmount } from '@/helpers/currency';
import { handleSilentError } from '@/helpers/errors';
import { ActivityPeriod, getActivityPerWeek } from '@/services/api/activity';
import { useNotificationsStore } from '@/store/notifications';
import { theme } from '@/styles/colors';
import { Head } from '@unhead/vue/components';
import dayjs from 'dayjs';
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components.js';
import type { ComposeOption } from 'echarts/core.js';

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

const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const state = reactive({
  isFetchingActivities: false,
  activities: [] as ActivityPeriod<'week'>[],
});

const totalPeopleCount = computed(() =>
  state.activities
    .map(({ data }) => data.coworkersCount)
    .reduce((acc, membersCount) => acc + membersCount, 0),
);

const averagePeopleCount = computed(() => {
  return totalPeopleCount.value / state.activities.length || 0;
});

const averageAttendance = computed(() => {
  return (
    state.activities
      .map(({ data }) => data.coworkedDaysAmount)
      .reduce((acc, amount) => acc + amount, 0) / totalPeopleCount.value || 0
  );
});

const options = computed<ComposeOption<GridComponentOption | TooltipComponentOption>>(() => ({
  tooltip: {
    formatter: (params) => {
      const {
        data: { coworkersCount, newCoworkersCount, coworkedDaysAmount },
        date, // @ts-ignore
      } = state.activities[params[0].dataIndex];
      return `
        <dl class="flex flex-col min-w-48 items-end gap-1">
          <dt class="truncate font-medium text-gray-500 sm:text-sm">
            ${i18n.t('stats.activity.weekly.graph.tooltip.date.label', {
              start: dayjs(date).startOf('week').format('ll'),
              end: dayjs(date).endOf('week').format('ll'),
            })}
          </dt>

          <dd class="flex flex-col items-end">
            <span class="text-3xl font-semibold text-gray-900">${
              coworkersCount ||
              i18n.t('stats.activity.weekly.graph.tooltip.total', {
                count: coworkersCount,
              })
            }</span>
            ${
              coworkersCount
                ? i18n.t('stats.activity.weekly.graph.tooltip.total', {
                    count: coworkersCount,
                  })
                : ''
            }
          </dd>

          <p class="flex flex-row gap-1 items-center text-base font-normal">
            ${i18n.t('stats.activity.weekly.graph.tooltip.newMembers.label', {
              count: newCoworkersCount,
            })}
            <span class="block h-3 w-3 rounded-full" style="background-color: ${
              theme.blueCrayola
            };"></span>
          </p>

          <p class="flex flex-row gap-1 items-center text-base font-normal">
            ${i18n.t('stats.activity.weekly.graph.tooltip.members.label', {
              count: coworkersCount - newCoworkersCount,
            })}
            <span class="block h-3 w-3 rounded-full" style="background-color: ${
              theme.frenchSkyBlue
            };"></span>
          </p>

          <p class="flex flex-row gap-1 items-center text-base font-normal">
            ${i18n.t('stats.activity.weekly.graph.tooltip.activity.label', {
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
    getActivityPerWeek(from, to)
      .then((activities) => {
        state.activities = activities;
        if (!state.activities.length) {
          notificationsStore.addNotification({
            type: 'warning',
            message: i18n.t('stats.activity.weekly.onFetch.empty'),
          });
        }
      })
      .catch(handleSilentError)
      .catch((error) => {
        notificationsStore.addErrorNotification(
          error,
          i18n.t('stats.activity.weekly.onFetch.fail'),
        );
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
