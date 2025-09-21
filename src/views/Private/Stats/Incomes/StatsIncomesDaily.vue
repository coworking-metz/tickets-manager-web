<template>
  <div class="mx-auto flex w-full max-w-5xl grow flex-col">
    <Head>
      <title>{{ $t('stats.incomes.daily.head.title') }}</title>
    </Head>
    <section class="flex min-h-[320px] grow flex-col">
      <StatsIncomesPeriodGraph
        :incomes="incomes"
        :loading="isFetchingIncomes"
        :options="options"
        :threshold-formatter="
          ({ value }) =>
            $t('stats.incomes.daily.graph.threshold', {
              amount: fractionAmount(value),
            })
        "
        :waterfall="net"
        @click="onBarSelect" />
    </section>

    <section class="mx-3 sm:mx-6">
      <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
        {{ $t('stats.incomes.daily.summary.label') }}
      </h3>
      <dl
        class="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow lg:grid-cols-3 lg:divide-x lg:divide-y-0 dark:divide-gray-700 dark:bg-neutral-800">
        <div class="px-4 py-5 sm:p-6">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t('stats.incomes.daily.summary.average.label') }}
          </dt>
          <dd class="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div
              v-if="isFetchingIncomes"
              class="mb-1 h-8 w-32 animate-pulse rounded-3xl bg-slate-200" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              :duration="1"
              :format="fractionAmount"
              :to="averageIncome" />
          </dd>

          <div
            v-if="isFetchingIncomes"
            class="mt-1 h-5 w-48 animate-pulse rounded-3xl bg-slate-200" />
          <div
            v-else-if="incomes?.length"
            class="flex flex-row items-baseline justify-between text-sm">
            <span class="shrink grow basis-0 truncate font-normal text-gray-500 dark:text-gray-400">
              {{
                $t('stats.incomes.daily.summary.average.threshold', {
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
            {{ $t('stats.incomes.daily.summary.total.label') }}
          </dt>
          <dd class="mt-1 flex flex-col">
            <div
              v-if="isFetchingIncomes"
              class="mb-1 h-8 w-32 animate-pulse rounded-3xl bg-slate-200" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              :duration="1"
              :format="fractionAmount"
              :to="totalIncome" />

            <div
              v-if="isFetchingIncomes"
              class="mt-1 h-5 w-48 animate-pulse rounded-3xl bg-slate-200" />
            <div
              v-else-if="incomes?.length"
              class="flex flex-row items-baseline justify-between text-sm">
              <span
                class="shrink grow basis-0 truncate font-normal text-gray-500 dark:text-gray-400">
                {{
                  $t('stats.incomes.daily.summary.total.threshold', {
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
            {{ $t('stats.incomes.daily.summary.debt.label') }}
          </dt>
          <dd class="mt-1 flex flex-col">
            <div
              v-if="isFetchingIncomes"
              class="mb-1 h-8 w-32 animate-pulse rounded-3xl bg-slate-200" />
            <AnimatedCounter
              v-else
              class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              :duration="1"
              :format="fractionAmount"
              :to="totalDebtAmount" />

            <div
              v-if="isFetchingIncomes"
              class="mt-1 h-5 w-48 animate-pulse rounded-3xl bg-slate-200" />
            <div
              v-else-if="incomes?.length"
              class="flex flex-row items-baseline justify-between text-sm">
              <span
                class="shrink grow basis-0 truncate font-normal text-gray-500 dark:text-gray-400">
                {{
                  $t('stats.incomes.daily.summary.debt.tickets', {
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
import { fractionAmount, fractionPercentage } from '@/helpers/currency';
import { DATE_FORMAT } from '@/helpers/dates';
import { isSilentError } from '@/helpers/errors';
import { ROUTE_NAMES } from '@/router/names';
import { IncomePeriodWithTotal, getIncomesPerDay } from '@/services/api/incomes';
import { useTheme } from '@/services/theme';
import { useNotificationsStore } from '@/store/notifications';
import { theme } from '@/styles/colors';
import { useQuery } from '@tanstack/vue-query';
import { Head } from '@unhead/vue/components';
import dayjs from 'dayjs';
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
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

const router = useRouter();
const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const currentTheme = useTheme();

const {
  isFetching: isFetchingIncomes,
  data: incomes,
  error: incomesError,
} = useQuery<IncomePeriodWithTotal<'day'>[]>(
  computed(() => ({
    queryKey: ['stats', 'incomes', props.from, props.to],
    queryFn: () => getIncomesPerDay(props.from, props.to),
    staleTime: 300_000,
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

const options = computed<ComposeOption<GridComponentOption | TooltipComponentOption>>(() => ({
  tooltip: {
    className: '!p-0 !border-0',
    formatter: (params) => {
      const {
        data: { incomes: incomeAmount, tickets, subscriptions, charges },
        date, // @ts-ignore
      } = (incomes.value ?? [])[params[0].dataIndex];
      return `
        <dl class="flex flex-col gap-1 bg-white dark:bg-neutral-800 p-4 text-gray-700 dark:text-gray-300">
          <dt class="ml-auto truncate font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
            ${dayjs(date).format('dddd LL')}
          </dt>

          ${
            tickets.debt.count
              ? `<div class="flex flex-row justify-between place-items-end">
              <dt class="flex flex-row gap-1 items-center text-base font-normal">
                <span class="block h-3 w-3 rounded-full" style="background-color: ${
                  theme.azureishWhite
                };"></span>
                ${i18n.t('stats.incomes.daily.graph.tooltip.tickets.debt', {
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
              ${i18n.t('stats.incomes.daily.graph.tooltip.tickets.label', {
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
              ${i18n.t('stats.incomes.daily.graph.tooltip.subscriptions.label', {
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
                currentTheme.value === 'light' ? theme.charlestonGreen : theme.azureishWhite
              };"></span>
              ${i18n.t('stats.incomes.daily.graph.threshold')}
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

// const fetchIncomes = (from: string, to: string) => {
//   state.isFetchingIncomes = true;
//   Promise.all([
//     getIncomesPerDay(from, to)
//       .then((incomes) => {
//         state.incomes = incomes;
//       })
//       .catch(handleSilentError)
//       .catch((error) => {
//         notificationsStore.addErrorNotification(error, i18n.t('stats.incomes.daily.onFetch.fail'));
//         return Promise.reject(error);
//       }),
//     // wait at least 500ms
//     // because the is the time for the transition to fully animate
//     // and it needs to be done before echarts can be rendered
//     new Promise((resolve) => setTimeout(resolve, 400)),
//   ]).finally(() => {
//     state.isFetchingIncomes = false;
//   });
// };

const onBarSelect = ({ dataIndex }: { dataIndex: number }) => {
  const { date } = (incomes.value ?? [])[dataIndex];
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
      // fetchIncomes(from, to);
    }
  },
  { immediate: true },
);

watch(
  () => incomesError.value,
  (error) => {
    if (error && !isSilentError(error)) {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('stats.incomes.daily.onFetch.fail', {
          start: dayjs(props.from).format('L'),
          end: dayjs(props.to).format('L'),
        }),
      );
    }
  },
);
</script>
