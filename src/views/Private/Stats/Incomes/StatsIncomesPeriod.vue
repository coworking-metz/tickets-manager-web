<template>
  <div class="mx-auto flex w-full max-w-5xl grow flex-col">
    <Head>
      <title>{{ $t(`${i18nKeyPrefix}.head.title`) }}</title>
    </Head>
    <section class="flex min-h-[320px] grow flex-col">
      <LoadingSpinner v-if="isFetchingIncomes" class="m-auto size-16" />
      <ErrorState
        v-else-if="incomesErrorText"
        class="m-auto pb-16"
        :description="incomesErrorText"
        :title="$t(`${i18nKeyPrefix}.onFetch.fail`)" />
      <EmptyState
        v-else-if="!incomes?.length"
        :animation="AnalyticsGraph"
        class="m-auto pb-16"
        :description="$t('stats.incomes.empty.description')"
        :title="$t('stats.incomes.empty.title')" />
      <StatsIncomesPeriodGraph
        v-else
        :incomes="incomes"
        :options="options"
        :threshold-formatter="
          ({ value }) =>
            $t(`${i18nKeyPrefix}.graph.threshold`, {
              amount: fractionAmount(value),
            })
        "
        :waterfall="net"
        @click="onBarSelect" />
    </section>

    <section class="max-sm:mx-3">
      <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
        {{ $t(`${i18nKeyPrefix}.summary.label`) }}
      </h3>
      <dl
        class="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow lg:grid-cols-3 lg:divide-x lg:divide-y-0 dark:divide-stone-700 dark:bg-neutral-800">
        <div class="px-4 py-5 sm:p-6">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t(`${i18nKeyPrefix}.summary.average.label`) }}
          </dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <LoadingSkeleton v-if="isFetchingIncomes" class="mb-1 h-8 w-32 rounded-full" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              :duration="1"
              :format="fractionAmount"
              :to="averageIncome" />
          </dd>

          <LoadingSkeleton v-if="isFetchingIncomes" class="mt-1 h-5 w-48 rounded-full" />
          <div
            v-else-if="incomes?.length"
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
            <LoadingSkeleton v-if="isFetchingIncomes" class="mb-1 h-8 w-32 rounded-full" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              :duration="1"
              :format="fractionAmount"
              :to="totalIncome" />

            <LoadingSkeleton v-if="isFetchingIncomes" class="mt-1 h-5 w-48 rounded-full" />
            <div
              v-else-if="incomes?.length"
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
                  totalIncome > totalCharges
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]">
                {{
                  `${totalIncome > totalCharges ? '+' : ''}${fractionAmount(
                    totalIncome - totalCharges,
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
            <LoadingSkeleton v-if="isFetchingIncomes" class="mb-1 h-8 w-32 rounded-full" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              :duration="1"
              :format="fractionAmount"
              :to="totalDebtAmount" />

            <LoadingSkeleton v-if="isFetchingIncomes" class="mt-1 h-5 w-48 rounded-full" />
            <div
              v-else-if="incomes?.length"
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
                {{ fractionPercentage(totalDebtAmount / totalIncome, $i18n.locale) }}
              </div>
            </div>
          </dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<script lang="ts" setup>
import StatsIncomesPeriodGraph from './StatsIncomesPeriodGraph.vue';
import AnalyticsGraph from '@/assets/animations/analytics-graph.lottie';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { fractionAmount, fractionPercentage } from '@/helpers/currency';
import { DATE_FORMAT } from '@/helpers/dates';
import { ROUTE_NAMES } from '@/router/names';
import { IncomePeriodWithTotal, PeriodType, getIncomesPerPeriod } from '@/services/api/incomes';
import { statsQueryKeys, useAppQuery } from '@/services/query';
import { useStatsColors } from '@/views/Private/Stats/statsColors';
import { Head } from '@unhead/vue/components';
import dayjs from 'dayjs';
import { computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components.js';
import type { ComposeOption } from 'echarts/core.js';

const props = defineProps({
  period: {
    type: String as PropType<PeriodType>,
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
});

const router = useRouter();
const i18n = useI18n();
const statsColors = useStatsColors();

const i18nKeyPrefix = computed(() => {
  switch (props.period) {
    case 'day':
      return 'stats.incomes.daily';
    case 'week':
      return 'stats.incomes.weekly';
    case 'month':
      return 'stats.incomes.monthly';
    case 'year':
      return 'stats.incomes.yearly';
    default:
      return 'stats.incomes.unknown';
  }
});

const {
  isFetching: isFetchingIncomes,
  data: incomes,
  errorText: incomesErrorText,
} = useAppQuery<IncomePeriodWithTotal<PeriodType>[]>(
  computed(() => ({
    queryKey: statsQueryKeys.incomesInPeriod(props.period, props.from, props.to),
    queryFn: () => getIncomesPerPeriod(props.period, props.from, props.to),
  })),
);

const totalIncome = computed(() =>
  (incomes.value ?? [])
    .map(({ data }) => data.tickets.amount + data.subscriptions.amount)
    .reduce((acc, income) => acc + income, 0),
);

const totalCharges = computed(() => {
  return (incomes.value ?? [])
    .map(({ data }) => data.charges)
    .reduce((acc, charges) => acc + charges, 0);
});

const averageIncome = computed(() => {
  return totalIncome.value / (incomes.value ?? []).length || 0;
});

const averageCharges = computed(() => {
  return totalCharges.value / (incomes.value ?? []).length || 0;
});

const totalDebtCount = computed(() =>
  (incomes.value ?? [])
    .map(({ data }) => data.tickets.debt.count)
    .reduce((acc, count) => acc + count, 0),
);

const totalDebtAmount = computed(() =>
  (incomes.value ?? [])
    .map(({ data }) => data.tickets.debt.amount)
    .reduce((acc, amount) => acc + amount, 0),
);

const getTooltipTitle = (date: string) => {
  switch (props.period) {
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
        data: { incomes: incomeAmount, tickets, subscriptions, charges },
        date, // @ts-ignore
      } = (incomes.value ?? [])[params[0].dataIndex];
      return `
        <dl class="flex flex-col gap-1 p-4 text-gray-700 bg-white dark:text-gray-300 dark:bg-neutral-800">
          <dt class="ml-auto truncate font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
            ${getTooltipTitle(date)}
          </dt>

          ${
            tickets.debt.count
              ? `<div class="flex flex-row justify-between place-items-end">
              <dt class="flex flex-row gap-1 items-center text-base font-normal">
                <span class="block h-3 w-3 rounded-full" style="background-color: ${
                  statsColors.value.debt
                };"></span>
                ${i18n.t(`${i18nKeyPrefix.value}.graph.tooltip.tickets.debt`, {
                  count: tickets.debt.count,
                })}
              </dt>
              <dd class="ml-6 text-base font-medium text-gray-400">${fractionAmount(
                tickets.debt.amount,
              )}</dd>
            </div>`
              : ''
          }
          <div class="flex flex-row justify-between place-items-end">
            <dt class="flex flex-row gap-1 items-center text-base font-normal">
              <span class="block h-3 w-3 rounded-full" style="background-color: ${
                statsColors.value.ticket
              };"></span>
              ${i18n.t(`${i18nKeyPrefix.value}.graph.tooltip.tickets.label`, {
                count: tickets.count,
              })}
            </dt>
            <dd class="ml-6 text-base font-medium text-gray-900 dark:text-gray-100">${fractionAmount(
              tickets.amount,
            )}</dd>
          </div>
          <div class="flex flex-row justify-between place-items-end">
            <dt class="flex flex-row gap-1 items-center text-base font-normal">
              <span class="block h-3 w-3 rounded-full" style="background-color: ${
                statsColors.value.subscription
              };"></span>
              ${i18n.t(`${i18nKeyPrefix.value}.graph.tooltip.subscriptions.label`, {
                count: subscriptions.count,
              })}
            </dt>
            <dd class="ml-6 text-base font-medium text-gray-900 dark:text-gray-100">${fractionAmount(
              subscriptions.amount,
            )}</dd>
          </div>

          <dd class="ml-auto text-3xl font-semibold text-gray-900 dark:text-gray-100">
            ${fractionAmount(incomeAmount)}
          </dd>

          <div class="flex flex-row justify-between place-items-end">
            <dt class="flex flex-row gap-1 items-center text-base font-normal">
              <span class="block h-3 w-3 rounded-full" style="background-color: ${
                statsColors.value.charges
              };"></span>
              ${i18n.t(`${i18nKeyPrefix.value}.graph.threshold`)}
            </dt>
            <dd class="ml-6 text-base font-medium text-gray-900 dark:text-gray-100">${fractionAmount(-charges)}</dd>
          </div>

          <div class="inline-flex self-end items-baseline px-2.5 py-0.5 rounded-full text-base font-medium md:mt-2 lg:mt-0 ${
            incomeAmount > charges ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }">
            ${incomeAmount > charges ? '+' : ''}${fractionAmount(incomeAmount - charges)}
          </div>
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

const onBarSelect = ({ dataIndex }: { dataIndex: number }) => {
  const { date } = (incomes.value ?? [])[dataIndex];
  router.push({
    name: ROUTE_NAMES.ATTENDANCE,
    params: {
      date: dayjs(date).format(DATE_FORMAT),
    },
  });
};
</script>
