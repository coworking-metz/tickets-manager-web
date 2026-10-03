<template>
  <div class="mx-auto flex w-full max-w-5xl grow flex-col">
    <Head>
      <title>{{ $t(`${i18nKeyPrefix}.head.title`) }}</title>
    </Head>
    <section class="flex grow basis-80 flex-col">
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
      <StatsIncomePeriodGraph
        v-else
        :disabled="frequency === 'day'"
        :incomes="incomes"
        :options="options"
        :threshold-formatter="
          ({ value }) =>
            $t(`${i18nKeyPrefix}.graph.threshold`, {
              amount: fractionAmount(value),
            })
        "
        :waterfall="net"
        @click="onSelectDate" />
    </section>

    <section class="max-sm:mx-3">
      <AppLink
        class="text-lg leading-6 font-medium"
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
        class="relative mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-stone-700 dark:bg-neutral-800">
        <LoadingProgressBar v-if="isFetchingIncomes" class="absolute inset-x-0 h-[2px]" />
        <div class="px-4 py-5 sm:p-6">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t(`${i18nKeyPrefix}.summary.average.label`) }}
          </dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <LoadingSkeleton v-if="isFetchingIncomes" class="mb-1 h-8 w-32 rounded-full" />
            <AnimatedNumber
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
            <AnimatedNumber
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
      </dl>
    </section>

    <StatsIncomeMembersDialog
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
import StatsIncomeMembersDialog from './StatsIncomeMembersDialog.vue';
import StatsIncomePeriodGraph from './StatsIncomePeriodGraph.vue';
import AnalyticsGraph from '@/assets/animations/analytics-graph.lottie';
import AnimatedNumber from '@/components/AnimatedNumber.vue';
import AppLink from '@/components/AppLink.vue';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingProgressBar from '@/components/LoadingProgressBar.vue';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { formatAmount, fractionAmount, fractionPercentage } from '@/helpers/currency';
import { DATE_FORMAT } from '@/helpers/dates';
import { doesRouteBelongsTo } from '@/router/helpers';
import { ROUTE_NAMES } from '@/router/names';
import { Frequency } from '@/services/api/stats/frequency';
import {
  getIncomePerPeriod,
  IncomePeriod,
  WHOLE_PERIOD_SUMMARY_ROUTE_PARAM,
} from '@/services/api/stats/income';
import { statsQueryKeys, useAppQuery } from '@/services/query';
import { useStatsColors } from '@/views/Private/Stats/statsColors';
import { Head } from '@unhead/vue/components';
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
} = useAppQuery<IncomePeriod<Frequency>[]>(
  computed(() => ({
    queryKey: statsQueryKeys.incomeInPeriod(props.frequency, props.from, props.to),
    queryFn: () => getIncomePerPeriod(props.frequency, props.from, props.to),
  })),
);

const totalIncome = computed(() =>
  (incomes.value ?? []).map(({ data }) => data.income).reduce((acc, income) => acc + income, 0),
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
    className:
      'p-0! border-0! rounded-xl! overflow-hidden! text-gray-700! dark:text-gray-300! bg-white! dark:bg-neutral-800!',
    formatter: (params) => {
      const {
        data: { income, tickets, subscriptions, memberships, charges },
        date, // @ts-ignore
      } = (incomes.value ?? [])[params[0].dataIndex];
      return `
        <dl class="flex flex-col gap-1 p-4">
          <dt class="ml-auto truncate font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
            ${getTooltipTitle(date)}
          </dt>

          <div class="flex flex-row justify-between place-items-end">
            <dt class="flex flex-row gap-1 items-center text-base font-normal">
              <span class="block h-3 w-3 rounded-full" style="background-color: ${
                statsColors.value.membershipOrder
              };"></span>
              ${i18n.t(`${i18nKeyPrefix.value}.graph.tooltip.memberships.label`, {
                count: memberships.count,
              })}
            </dt>
            <dd class="ml-6 text-base font-medium text-gray-900 dark:text-gray-100">${formatAmount(
              memberships.amount,
            )}</dd>
          </div>
          <div class="flex flex-row justify-between place-items-end">
            <dt class="flex flex-row gap-1 items-center text-base font-normal">
              <span class="block h-3 w-3 rounded-full" style="background-color: ${
                statsColors.value.ticketOrder
              };"></span>
              ${i18n.t(`${i18nKeyPrefix.value}.graph.tooltip.tickets.label`, {
                count: tickets.count,
              })}
            </dt>
            <dd class="ml-6 text-base font-medium text-gray-900 dark:text-gray-100">${formatAmount(
              tickets.amount,
            )}</dd>
          </div>
          ${
            tickets.byPrice.length > 1
              ? tickets.byPrice
                  .map(
                    ({ price, count }) => `
            <div class="flex flex-row justify-between place-items-end pl-4">
              <dt class="text-sm text-gray-500 dark:text-gray-400">
                ${i18n.t('stats.incomes.tickets.byPrice.label', {
                  count,
                  price: formatAmount(price),
                })}
              </dt>
            </div>`,
                  )
                  .join('')
              : ''
          }
          <div class="flex flex-row justify-between place-items-end">
            <dt class="flex flex-row gap-1 items-center text-base font-normal">
              <span class="block h-3 w-3 rounded-full" style="background-color: ${
                statsColors.value.subscriptionOrder
              };"></span>
              ${i18n.t(`${i18nKeyPrefix.value}.graph.tooltip.subscriptions.label`, {
                count: subscriptions.count,
              })}
            </dt>
            <dd class="ml-6 text-base font-medium text-gray-900 dark:text-gray-100">${formatAmount(
              subscriptions.amount,
            )}</dd>
          </div>

          <dd class="ml-auto text-3xl font-semibold text-gray-900 dark:text-gray-100">
            ${formatAmount(income)}
          </dd>

          <div class="flex flex-row justify-between place-items-end">
            <dt class="flex flex-row gap-1 items-center text-base font-normal">
              <span class="block h-3 w-3 rounded-full" style="background-color: ${
                statsColors.value.charges
              };"></span>
              ${i18n.t(`${i18nKeyPrefix.value}.graph.threshold`)}
            </dt>
            <dd class="ml-6 text-base font-medium text-gray-900 dark:text-gray-100">${formatAmount(-charges)}</dd>
          </div>

          <div class="-mr-2.5 inline-flex self-end items-baseline px-2.5 py-0.5 rounded-full text-base font-medium md:mt-2 lg:mt-0 ${
            income > charges ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }">
            ${income > charges ? '+' : ''}${formatAmount(income - charges)}
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
  const element = (incomes.value ?? [])[dataIndex];
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
  if (!isVisible && doesRouteBelongsTo(router.currentRoute.value, ROUTE_NAMES.STATS.INCOME)) {
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
