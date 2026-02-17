<template>
  <div class="mx-auto flex w-full max-w-5xl grow flex-col">
    <Head>
      <title>{{ $t(`${i18nKeyPrefix}.head.title`) }}</title>
    </Head>
    <section class="flex grow basis-80 flex-col">
      <LoadingSpinner v-if="isPendingUsages" class="m-auto size-16" />
      <ErrorState
        v-else-if="usagesErrorText"
        class="m-auto pb-16"
        :description="usagesErrorText"
        :title="$t(`${i18nKeyPrefix}.onFetch.fail`)" />
      <EmptyState
        v-else-if="!usages?.length"
        :animation="AnalyticsGraph"
        class="m-auto pb-16"
        :description="$t('stats.usage.empty.description')"
        :title="$t('stats.usage.empty.title')" />
      <StatsUsagePeriodGraph
        v-else
        :options="options"
        :threshold-formatter="
          ({ value }) =>
            $t(`${i18nKeyPrefix}.graph.threshold`, {
              amount: fractionAmount(value),
            })
        "
        :usages="usages"
        :waterfall="net"
        @click="onSelectDate" />
    </section>

    <section class="max-sm:mx-3">
      <AppLink
        class="text-lg font-medium leading-6"
        color="indigo"
        :to="{
          name: $route.name,
          query: $route.query,
          params: {
            date: WHOLE_PERIOD_SUMMARY_ROUTE_PARAM,
          },
        }">
        {{ $t(`${i18nKeyPrefix}.summary.label`) }}
      </AppLink>

      <dl
        class="relative mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow lg:grid-cols-3 lg:divide-x lg:divide-y-0 dark:divide-stone-700 dark:bg-neutral-800">
        <LoadingProgressBar v-if="isFetchingUsages" class="absolute inset-x-0 h-[2px]" />
        <div class="px-4 py-5 sm:p-6">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t(`${i18nKeyPrefix}.summary.average.label`) }}
          </dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <LoadingSkeleton v-if="isPendingUsages" class="mb-1 h-8 w-32 rounded-full" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              :duration="1"
              :format="fractionAmount"
              :to="averageIncome" />
          </dd>

          <LoadingSkeleton v-if="isPendingUsages" class="mt-1 h-5 w-48 rounded-full" />
          <div
            v-else-if="usages?.length"
            class="flex flex-row items-baseline justify-between text-sm">
            <span class="shrink grow basis-0 truncate font-normal text-gray-500 dark:text-gray-400">
              {{
                $t(`${i18nKeyPrefix}.summary.average.threshold`, {
                  amount: fractionAmount(averageCharges),
                })
              }}
            </span>
            <div
              :class="[
                'rounded-full px-2.5 py-0.5 font-medium',
                averageIncome > averageCharges
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800',
              ]">
              {{
                `${averageIncome > averageCharges ? '+' : ''}${fractionPercentage(
                  (averageIncome - averageCharges) / averageCharges,
                  $i18n.locale,
                )}`
              }}
            </div>
          </div>
        </div>

        <div class="px-4 py-5 sm:p-6">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t(`${i18nKeyPrefix}.summary.total.label`) }}
          </dt>
          <dd class="mt-1 flex flex-col">
            <LoadingSkeleton v-if="isPendingUsages" class="mb-1 h-8 w-32 rounded-full" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              :duration="1"
              :format="fractionAmount"
              :to="totalAmount" />

            <LoadingSkeleton v-if="isPendingUsages" class="mt-1 h-5 w-48 rounded-full" />
            <div
              v-else-if="usages?.length"
              class="flex flex-row items-baseline justify-between text-sm">
              <span
                class="shrink grow basis-0 truncate font-normal text-gray-500 dark:text-gray-400">
                {{
                  $t(`${i18nKeyPrefix}.summary.total.threshold`, {
                    amount: fractionAmount(totalCharges),
                  })
                }}
              </span>
              <div
                :class="[
                  'rounded-full px-2.5 py-0.5 font-medium',
                  totalAmount > totalCharges
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]">
                {{
                  `${totalAmount > totalCharges ? '+' : ''}${fractionAmount(
                    totalAmount - totalCharges,
                    {},
                    $i18n.locale,
                  )}`
                }}
              </div>
            </div>
          </dd>
        </div>

        <div class="px-4 py-5 sm:p-6">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t(`${i18nKeyPrefix}.summary.debt.label`) }}
          </dt>
          <dd class="mt-1 flex flex-col">
            <LoadingSkeleton v-if="isPendingUsages" class="mb-1 h-8 w-32 rounded-full" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              :duration="1"
              :format="fractionAmount"
              :to="totalDebtAmount" />

            <LoadingSkeleton v-if="isPendingUsages" class="mt-1 h-5 w-48 rounded-full" />
            <div
              v-else-if="usages?.length"
              class="flex flex-row items-baseline justify-between text-sm">
              <span
                class="shrink grow basis-0 truncate font-normal text-gray-500 dark:text-gray-400">
                {{
                  $t(`${i18nKeyPrefix}.summary.debt.tickets`, {
                    count: totalDebtCount,
                  })
                }}
              </span>

              <div class="rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-800">
                {{ fractionPercentage(totalDebtAmount / totalAmount, $i18n.locale) }}
              </div>
            </div>
          </dd>
        </div>
      </dl>
    </section>

    <StatsUsageMembersDialog
      v-model="state.isDialogVisible"
      :date="date"
      :frequency="frequency"
      :from="from"
      :title="
        date === WHOLE_PERIOD_SUMMARY_ROUTE_PARAM
          ? $t('period.value', {
              start: dayjs(from).format('ll'),
              end: dayjs(to).format('ll'),
            })
          : getTooltipTitle(date)
      "
      :to="to" />
  </div>
</template>

<script lang="ts" setup>
import StatsUsageMembersDialog from './StatsUsageMembersDialog.vue';
import StatsUsagePeriodGraph from './StatsUsagePeriodGraph.vue';
import AnalyticsGraph from '@/assets/animations/analytics-graph.lottie';
import AppLink from '@/components/AppLink.vue';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingProgressBar from '@/components/LoadingProgressBar.vue';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { formatAmount, fractionAmount, fractionPercentage } from '@/helpers/currency';
import { DATE_FORMAT } from '@/helpers/dates';
import { MAX_MOBILE_WIDTH } from '@/helpers/environment';
import { doesRouteBelongsTo } from '@/router/helpers';
import { ROUTE_NAMES } from '@/router/names';
import { Frequency } from '@/services/api/stats/frequency';
import { getUsagePerFrequency, WHOLE_PERIOD_SUMMARY_ROUTE_PARAM } from '@/services/api/stats/usage';
import { statsQueryKeys, useAppQuery } from '@/services/query';
import { useStatsColors } from '@/views/Private/Stats/statsColors';
import { Head } from '@unhead/vue/components';
import { useWindowSize } from '@vueuse/core';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { computed, PropType, reactive, watch } from 'vue';
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
  /**
   * Whether to display the net income
   */
  net: {
    type: Boolean,
    default: false,
  },
  date: {
    type: String,
    default: null,
  },
});

const router = useRouter();
const i18n = useI18n();
const statsColors = useStatsColors();
const state = reactive({
  isDialogVisible: false,
});

const i18nKeyPrefix = computed(() => {
  switch (props.frequency) {
    case 'day':
      return 'stats.usage.daily';
    case 'week':
      return 'stats.usage.weekly';
    case 'month':
      return 'stats.usage.monthly';
    case 'year':
      return 'stats.usage.yearly';
    default:
      return 'stats.usage.unknown';
  }
});

const {
  isPending: isPendingUsages,
  isFetching: isFetchingUsages,
  data: usages,
  errorText: usagesErrorText,
} = useAppQuery(
  computed(() => ({
    queryKey: statsQueryKeys.usageInPeriod(props.frequency, props.from, props.to),
    queryFn: () => getUsagePerFrequency(props.frequency, props.from, props.to),
  })),
);

const totalAmount = computed(() =>
  (usages.value ?? []).reduce((acc, { data }) => acc + data.amount, 0),
);

const totalCharges = computed(() => {
  return (usages.value ?? []).reduce((acc, { data }) => acc + data.charges, 0);
});

const averageIncome = computed(() => {
  return totalAmount.value / (usages.value ?? []).length || 0;
});

const averageCharges = computed(() => {
  return totalCharges.value / (usages.value ?? []).length || 0;
});

const totalDebtCount = computed(() =>
  (usages.value ?? [])
    .map(({ data }) => data.tickets.debt.count)
    .reduce((acc, count) => acc + count, 0),
);

const totalDebtAmount = computed(() =>
  (usages.value ?? [])
    .map(({ data }) => data.tickets.debt.amount)
    .reduce((acc, amount) => acc + amount, 0),
);

const getTooltipTitle = (date: string) => {
  switch (props.frequency) {
    case 'day':
      return dayjs(date).format('dddd LL');
    case 'week':
      return i18n.t(`stats.usage.weekly.graph.tooltip.label`, {
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

const { width } = useWindowSize();
const options = computed<ComposeOption<GridComponentOption | TooltipComponentOption>>(() => ({
  tooltip: {
    className:
      '!p-0 !border-0 !rounded-xl !overflow-hidden !text-gray-700 dark:!text-gray-300 !bg-white dark:!bg-neutral-800',
    formatter: (params) => {
      const {
        data: { amount, tickets, subscriptions, charges },
        date, // @ts-ignore
      } = (usages.value ?? [])[params[0].dataIndex];
      const totalTicketsCount = tickets.count + (tickets.debt?.count ?? 0);
      const totalTicketsAmount = tickets.amount + (tickets.debt?.amount ?? 0);
      return `
        <dl class="flex flex-col gap-1 p-4">
          <dt class="ml-auto truncate font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
            ${getTooltipTitle(date)}
          </dt>

          <div class="flex flex-row justify-between items-start">
            <dt class="flex flex-row gap-1.5 items-start text-left text-base font-normal">
              <span class="mt-1.5 block h-3 w-3 rounded-full" style="background-color: ${
                statsColors.value.ticket
              };"></span>
              ${i18n.t(`stats.usage.tickets.label`, {
                count: totalTicketsCount,
              })}
            </dt>
            <dd class="ml-6 font-mono text-base font-medium text-gray-900 dark:text-gray-100">${formatAmount(
              totalTicketsAmount,
            )}</dd>
          </div>

          ${
            tickets.debt.count
              ? `<div class="flex flex-row justify-between items-start">
              <dt class="flex flex-row gap-1.5 items-start text-left text-base font-normal">
                <span class="mt-1.5 block h-3 w-3 rounded-full" style="background-color: ${
                  statsColors.value.debt
                };"></span>
                ${i18n.t(`stats.usage.tickets.debt.label`, {
                  count: tickets.debt.count,
                })}
              </dt>
              <dd class="ml-6 font-mono text-base font-medium text-gray-400">-${formatAmount(
                tickets.debt.amount,
              )}</dd>
            </div>`
              : ''
          }

          <div class="flex flex-row justify-between items-start">
            <dt class="flex flex-row gap-1.5 items-start text-left text-base font-normal">
              <span class="mt-1.5 block h-3 w-3 rounded-full" style="background-color: ${
                statsColors.value.subscription
              };"></span>
              ${i18n.t(
                width.value <= MAX_MOBILE_WIDTH
                  ? `stats.usage.subscriptions.count`
                  : `stats.usage.subscriptions.label`,
                {
                  count: subscriptions.count,
                },
              )}${
                subscriptions.attending.count
                  ? `<br />${i18n.t(`stats.usage.subscriptions.attending`, {
                      count: subscriptions.attending.count,
                    })}`
                  : ''
              }
            </dt>
            <dd class="ml-6 font-mono text-base font-medium text-gray-900 dark:text-gray-100">${fractionAmount(
              subscriptions.amount,
            )}</dd>
          </div>

          <dd class="ml-auto text-3xl font-semibold text-gray-900 dark:text-gray-100">
            ${formatAmount(amount)}
          </dd>

          <div class="flex flex-row justify-between items-start">
            <dt class="flex flex-row gap-1.5 items-start text-left text-base font-normal">
              <span class="shrink-0 mt-1.5 block h-3 w-3 rounded-full" style="background-color: ${
                statsColors.value.charges
              };"></span>
              <span class="max-sm:max-w-32 truncate">${i18n.t(`${i18nKeyPrefix.value}.graph.threshold`)}</span>
            </dt>
            <dd class="ml-6 font-mono text-base font-medium text-gray-900 dark:text-gray-100">${formatAmount(-charges)}</dd>
          </div>

          <div class="-mr-2.5 inline-flex self-end items-baseline px-2.5 py-0.5 rounded-full font-mono text-base font-medium md:mt-2 lg:mt-0 ${
            amount > charges ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }">
            ${amount > charges ? '+' : ''}${formatAmount(amount - charges)}
          </div>
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
  const element = (usages.value ?? [])[dataIndex];
  const { date } = element;
  router.push({
    name: router.currentRoute.value.name,
    query: router.currentRoute.value.query,
    params: {
      date: dayjs(date).format(DATE_FORMAT),
    },
  });
};

const onDialogChange = debounce((isVisible: boolean) => {
  if (!isVisible && doesRouteBelongsTo(router.currentRoute.value, ROUTE_NAMES.STATS.USAGE)) {
    router.replace({
      name: router.currentRoute.value.name,
      query: router.currentRoute.value.query,
    });
  }
}, 300);

watch(() => state.isDialogVisible, onDialogChange);
watch(
  () => props.date,
  (newDate) => {
    state.isDialogVisible = !!newDate;
  },
  { immediate: true },
);
</script>
