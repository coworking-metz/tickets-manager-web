<template>
  <div class="mx-auto flex w-full max-w-5xl grow flex-col">
    <Head>
      <title>{{ $t('stats.incomes.daily.head.title') }}</title>
    </Head>
    <section class="flex min-h-[320px] grow flex-col">
      <LoadingSpinner v-if="state.isFetchingIncomes" class="m-auto h-16 w-16" />
      <EmptyState
        v-else-if="!state.incomes.length"
        :animation="AnalyticsGraph"
        class="m-auto py-8"
        :description="$t('stats.incomes.empty.description')"
        :title="$t('stats.incomes.empty.title')" />
      <VueECharts v-else class="h-full w-full" :option="options" />
    </section>

    <section class="mx-6 lg:mx-8">
      <h3 class="text-lg font-medium leading-6 text-gray-900">
        {{ $t('stats.incomes.daily.summary.label') }}
      </h3>
      <dl
        class="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow md:grid-cols-2 md:divide-x md:divide-y-0">
        <div class="px-4 py-5 sm:p-6">
          <dt class="truncate font-medium text-gray-500 sm:text-sm">
            {{ $t('stats.incomes.daily.summary.average.label') }}
          </dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div
              v-if="state.isFetchingIncomes"
              class="mb-1 h-8 w-32 animate-pulse rounded-3xl bg-slate-200" />
            <animated-counter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900"
              :decimals="Number.isInteger(averageIncome) ? 0 : 2"
              :duration="1"
              :end-amount="averageIncome"
              separator=" "
              suffix=" €" />
          </dd>

          <div
            v-if="state.isFetchingIncomes"
            class="mt-1 h-5 w-48 animate-pulse rounded-3xl bg-slate-200" />
          <div
            v-else-if="state.incomes.length"
            class="flex flex-row items-baseline justify-between text-sm">
            <span class="shrink grow basis-0 truncate font-normal text-gray-500">
              {{
                $t('stats.incomes.daily.summary.average.threshold', {
                  amount: fractionAmount(MINIMUM_INCOME),
                })
              }}
            </span>
            <div
              :class="[
                'rounded-full px-2.5 py-0.5 font-medium',
                averageIncome > MINIMUM_INCOME
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800',
              ]">
              {{
                `${averageIncome > MINIMUM_INCOME ? '+' : ''}${fractionAmount(
                  averageIncome - MINIMUM_INCOME,
                )}`
              }}
            </div>
          </div>
        </div>

        <div class="px-4 py-5 sm:p-6">
          <dt class="truncate font-medium text-gray-500 sm:text-sm">
            {{ $t('stats.incomes.daily.summary.total.label') }}
          </dt>
          <dd class="mt-1 flex flex-col">
            <div
              v-if="state.isFetchingIncomes"
              class="mb-1 h-8 w-32 animate-pulse rounded-3xl bg-slate-200" />
            <animated-counter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900"
              :decimals="Number.isInteger(totalIncome) ? 0 : 2"
              :duration="1"
              :end-amount="totalIncome"
              separator=" "
              suffix=" €" />

            <div
              v-if="state.isFetchingIncomes"
              class="mt-1 h-5 w-48 animate-pulse rounded-3xl bg-slate-200" />
            <div
              v-else-if="state.incomes.length"
              class="flex flex-row items-baseline justify-between text-sm">
              <span class="shrink grow basis-0 truncate font-normal text-gray-500">
                {{
                  $t('stats.incomes.daily.summary.total.threshold', {
                    amount: fractionAmount(MINIMUM_INCOME * state.incomes.length),
                  })
                }}
              </span>
              <div
                :class="[
                  'rounded-full px-2.5 py-0.5 font-medium',
                  totalIncome > MINIMUM_INCOME * state.incomes.length
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]">
                {{
                  `${
                    totalIncome > MINIMUM_INCOME * state.incomes.length ? '+' : ''
                  }${fractionAmount(totalIncome - MINIMUM_INCOME * state.incomes.length)}`
                }}
              </div>
            </div>
          </dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<script lang="ts" setup>
import AnalyticsGraph from '@/assets/animations/analytics-graph.lottie';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { fractionAmount } from '@/helpers/currency';
import { handleSilentError } from '@/helpers/errors';
import {
  INCOME_PER_SUBSCRIPTION_DAY,
  INCOME_PER_TICKET,
  IncomePeriod,
  MONTHLY_MINIMUM_INCOME,
  getIncomesPerDay,
} from '@/services/api/stats';
import { useNotificationsStore } from '@/store/notifications';
import { theme } from '@/styles/colors';
import { Head } from '@unhead/vue/components';
import dayjs from 'dayjs';
import { BarChart } from 'echarts/charts.js';
import { GridComponent, TooltipComponent, MarkLineComponent } from 'echarts/components.js';
import { use } from 'echarts/core.js';
import { CanvasRenderer } from 'echarts/renderers.js';
import { computed, reactive, watch } from 'vue';
import VueECharts from 'vue-echarts';
import { useI18n } from 'vue-i18n';
import type {
  GridComponentOption,
  MarkLineComponentOption,
  TooltipComponentOption,
} from 'echarts/components.js';
import type { ComposeOption } from 'echarts/core.js';

use([MarkLineComponent, TooltipComponent, GridComponent, BarChart, CanvasRenderer]);

/**
 * @see https://echarts.apache.org/en/cheat-sheet.html
 */

const MINIMUM_INCOME = MONTHLY_MINIMUM_INCOME / 30;

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
  isFetchingIncomes: false,
  incomes: [] as IncomePeriod<'day'>[],
});

const averageIncome = computed(() => {
  return (
    state.incomes.map(({ data }) => data.incomes).reduce((acc, income) => acc + income, 0) /
      state.incomes.length || 0
  );
});

const totalIncome = computed(() =>
  state.incomes.map(({ data }) => data.incomes).reduce((acc, income) => acc + income, 0),
);

const options = computed<
  ComposeOption<GridComponentOption | TooltipComponentOption | MarkLineComponentOption>
>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
    formatter: (params) => {
      const {
        data: { incomes, usedTickets, daysAbo },
        date, // @ts-ignore
      } = state.incomes[params[0].dataIndex];
      return `
        <dl class="flex flex-col gap-1">
          <dt class="ml-auto truncate font-medium text-gray-500 sm:text-sm">
            ${dayjs(date).format('dddd LL')}
          </dt>

          <div class="flex flex-row justify-between place-items-end">
            <dt class="flex flex-row gap-1 items-center text-base font-normal">
              <span class="block h-3 w-3 rounded-full" style="background-color: ${
                theme.babyBlueEyes
              };"></span>
              ${i18n.t('stats.incomes.daily.graph.tooltip.tickets.label', {
                count: usedTickets,
              })}
            </dt>
            <dd class="ml-6 text-base font-medium text-gray-900">${fractionAmount(
              usedTickets * 6,
            )}</dd>
          </div>
          <div class="flex flex-row justify-between place-items-end">
            <dt class="flex flex-row gap-1 items-center text-base font-normal">
              <span class="block h-3 w-3 rounded-full" style="background-color: ${
                theme.peachYellow
              };"></span>
              ${i18n.t('stats.incomes.daily.graph.tooltip.subscriptions.label', {
                count: daysAbo,
              })}
            </dt>
            <dd class="ml-6 text-base font-medium text-gray-900">${fractionAmount(daysAbo * 2)}</dd>
          </div>

          <dd class="ml-auto text-3xl font-semibold text-gray-900">
            ${fractionAmount(incomes)}
          </dd>

          <div class="inline-flex self-end items-baseline px-2.5 py-0.5 rounded-full text-base font-medium md:mt-2 lg:mt-0 ${
            incomes > MINIMUM_INCOME ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }">
            ${incomes > MINIMUM_INCOME ? '+' : ''}${fractionAmount(incomes - MINIMUM_INCOME)}
          </div>
        </dl>
      `;
    },
  },
  xAxis: {
    type: 'category',
    data: state.incomes.map(({ date }) => date),
    axisLabel: {
      formatter: (value: string) => dayjs(value).format('ll').slice(0, -4),
      align: 'center',
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: (value: number) => fractionAmount(value),
      align: 'right',
    },
  },
  series: [
    {
      silent: true,
      name: 'subscriptions',
      data: state.incomes.map(({ data }) => ({
        value: data.daysAbo * INCOME_PER_SUBSCRIPTION_DAY,
        itemStyle: {
          color: theme.peachYellow,
        },
      })),
      type: 'bar',
      stack: 'incomes',
    },
    {
      silent: true,
      name: 'tickets',
      data: state.incomes.map(({ data }) => ({
        value: data.usedTickets * INCOME_PER_TICKET,
        itemStyle: {
          color: theme.babyBlueEyes,
        },
      })),
      type: 'bar',
      stack: 'incomes',
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: {
          type: 'solid',
          color: theme.charlestonGreen,
          width: 2,
          cap: 'round',
        },
        data: [
          {
            label: {
              show: true,
              formatter: ({ value }: { value: number }) =>
                i18n.t('stats.incomes.daily.graph.threshold', {
                  amount: fractionAmount(value),
                }),
              overflow: 'break',
              lineHeight: 16,
            },
            yAxis: MINIMUM_INCOME,
          },
        ],
      },
    },
  ],
}));

const fetchIncomes = (from: string, to: string) => {
  state.isFetchingIncomes = true;
  Promise.all([
    getIncomesPerDay(from, to)
      .then((incomes) => {
        state.incomes = incomes;
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
    state.isFetchingIncomes = false;
  });
};

watch(
  [() => props.from, () => props.to],
  ([from, to]) => {
    if (dayjs(from).isValid() || dayjs(to).isValid()) {
      fetchIncomes(from, to);
    }
  },
  { immediate: true },
);
</script>
