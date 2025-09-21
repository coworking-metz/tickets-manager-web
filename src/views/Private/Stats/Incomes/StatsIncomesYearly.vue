<template>
  <div class="mx-auto flex w-full max-w-5xl grow flex-col">
    <Head>
      <title>{{ $t('stats.incomes.yearly.head.title') }}</title>
    </Head>
    <section class="flex min-h-[320px] grow flex-col">
      <StatsIncomesPeriodGraph
        disabled
        :incomes="state.incomes"
        :loading="state.isFetchingIncomes"
        :options="options"
        :threshold-formatter="
          ({ value }) =>
            $t('stats.incomes.yearly.graph.threshold', {
              amount: fractionAmount(value),
            })
        "
        :waterfall="net" />
    </section>

    <section class="mx-3 sm:mx-6">
      <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
        {{ $t('stats.incomes.yearly.summary.label') }}
      </h3>
      <dl
        class="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow md:grid-cols-2 md:divide-x md:divide-y-0 dark:divide-gray-700 dark:bg-neutral-800">
        <div class="px-4 py-5 sm:p-6">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t('stats.incomes.yearly.summary.average.label') }}
          </dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div
              v-if="state.isFetchingIncomes"
              class="mb-1 h-8 w-32 animate-pulse rounded-3xl bg-slate-200" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              :duration="1"
              :format="fractionAmount"
              :to="averageIncome" />
          </dd>

          <div
            v-if="state.isFetchingIncomes"
            class="mt-1 h-5 w-48 animate-pulse rounded-3xl bg-slate-200" />
          <div
            v-else-if="state.incomes.length"
            class="flex flex-row items-baseline justify-between text-sm">
            <span class="shrink grow basis-0 truncate font-normal text-gray-500 dark:text-gray-400">
              {{
                $t('stats.incomes.yearly.summary.average.threshold', {
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
            {{ $t('stats.incomes.yearly.summary.total.label') }}
          </dt>
          <dd class="mt-1 flex flex-col">
            <div
              v-if="state.isFetchingIncomes"
              class="mb-1 h-8 w-32 animate-pulse rounded-3xl bg-slate-200" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              :duration="1"
              :format="fractionAmount"
              :to="totalIncome" />

            <div
              v-if="state.isFetchingIncomes"
              class="mt-1 h-5 w-48 animate-pulse rounded-3xl bg-slate-200" />
            <div
              v-else-if="state.incomes.length"
              class="flex flex-row items-baseline justify-between text-sm">
              <span
                class="shrink grow basis-0 truncate font-normal text-gray-500 dark:text-gray-400">
                {{
                  $t('stats.incomes.yearly.summary.total.threshold', {
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
  </div>
</template>

<script lang="ts" setup>
import StatsIncomesPeriodGraph from './StatsIncomesPeriodGraph.vue';
import { fractionAmount, fractionPercentage } from '@/helpers/currency';
import { handleSilentError } from '@/helpers/errors';
import { IncomePeriodWithTotal, getIncomesPerYear } from '@/services/api/incomes';
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
  /**
   * Whether to display the net income
   */
  net: {
    type: Boolean,
    default: false,
  },
});

const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const state = reactive({
  isFetchingIncomes: false,
  incomes: [] as IncomePeriodWithTotal<'year'>[],
});

const totalIncome = computed(() =>
  state.incomes.map(({ data }) => data.incomes).reduce((acc, income) => acc + income, 0),
);

const totalCharges = computed(() => {
  return state.incomes.map(({ data }) => data.charges).reduce((acc, charges) => acc + charges, 0);
});

const averageIncome = computed(() => {
  return totalIncome.value / state.incomes.length || 0;
});

const averageCharges = computed(() => {
  return totalCharges.value / state.incomes.length || 0;
});

const options = computed<ComposeOption<GridComponentOption | TooltipComponentOption>>(() => ({
  tooltip: {
    formatter: (params) => {
      const {
        data: { incomes, tickets, subscriptions, charges },
        date, // @ts-ignore
      } = state.incomes[params[0].dataIndex];
      return `
        <dl class="flex flex-col gap-1">
          <dt class="ml-auto truncate font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
            ${dayjs(date).format('YYYY')}
          </dt>

          ${
            tickets.debt.count
              ? `<div class="flex flex-row justify-between place-items-end">
              <dt class="flex flex-row gap-1 items-center text-base font-normal">
                <span class="block h-3 w-3 rounded-full" style="background-color: ${
                  theme.azureishWhite
                };"></span>
                ${i18n.t('stats.incomes.yearly.graph.tooltip.tickets.debt', {
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
                theme.babyBlueEyes
              };"></span>
              ${i18n.t('stats.incomes.yearly.graph.tooltip.tickets.label', {
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
                theme.peachYellow
              };"></span>
              ${i18n.t('stats.incomes.yearly.graph.tooltip.subscriptions.label', {
                count: subscriptions.count,
              })}
            </dt>
            <dd class="ml-6 text-base font-medium text-gray-900 dark:text-gray-100">${fractionAmount(
              subscriptions.amount,
            )}</dd>
          </div>

          <dd class="ml-auto text-3xl font-semibold text-gray-900 dark:text-gray-100">
            ${fractionAmount(incomes)}
          </dd>

          <div class="flex flex-row justify-between place-items-end">
            <dt class="flex flex-row gap-1 items-center text-base font-normal">
              <span class="block h-3 w-3 rounded-full" style="background-color: ${
                theme.charlestonGreen
              };"></span>
              ${i18n.t('stats.incomes.yearly.graph.threshold')}
            </dt>
            <dd class="ml-6 text-base font-medium text-gray-900 dark:text-gray-100">${fractionAmount(-charges)}</dd>
          </div>

          <div class="inline-flex self-end items-baseline px-2.5 py-0.5 rounded-full text-base font-medium md:mt-2 lg:mt-0 ${
            incomes > charges ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }">
            ${incomes > charges ? '+' : ''}${fractionAmount(incomes - charges)}
          </div>
        </dl>
      `;
    },
  },
  xAxis: {
    axisLabel: {
      formatter: (value: string) => dayjs(value).format('YYYY'),
      align: 'center',
    },
  },
}));

const fetchIncomes = (from: string, to: string) => {
  state.isFetchingIncomes = true;
  Promise.all([
    getIncomesPerYear(from, to)
      .then((incomes) => {
        state.incomes = incomes;
      })
      .catch(handleSilentError)
      .catch((error) => {
        notificationsStore.addErrorNotification(error, i18n.t('stats.incomes.yearly.onFetch.fail'));
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
