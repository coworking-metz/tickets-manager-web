<template>
  <AppDialog
    v-model="isVisible"
    v-bind="$attrs"
    dialog-class="flex flex-col pt-4 relative overflow-hidden max-h-[min(90vh,840px)] max-w-[1680px] h-full grow">
    <LoadingProgressBar v-if="isFetchingIncomes" class="absolute top-0 h-px w-full" />
    <header class="mx-3 flex flex-row items-start justify-center sm:mx-24">
      <h2
        v-if="title"
        class="mx-auto shrink truncate py-1.5 text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        {{ title }}
      </h2>
      <div
        class="absolute top-3 right-3 flex flex-row items-center gap-1 rounded-full bg-white/5 backdrop-blur-xl dark:bg-neutral-800/5">
        <div class="relative">
          <AppButtonIcon
            :aria-pressed="state.isMembersListVisible"
            class="dark:ring-offset-neutral-800"
            :icon="state.isMembersListVisible ? mdiAccountMultiple : mdiAccountMultipleOutline"
            tabindex="0"
            :title="
              $t(
                state.isMembersListVisible
                  ? 'stats.incomes.members.toggle.hide'
                  : 'stats.incomes.members.toggle.show',
              )
            "
            @click="() => (state.isMembersListVisible = !state.isMembersListVisible)" />
          <span
            v-if="selectedIncome"
            class="pointer-events-none absolute -bottom-2 -left-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] leading-none font-semibold text-white tabular-nums ring-2 ring-white dark:bg-indigo-500 dark:ring-neutral-800">
            {{ filteredList.length }}
          </span>
        </div>
        <AppButtonIcon
          class="dark:ring-offset-neutral-800"
          :icon="mdiClose"
          tabindex="0"
          :title="$t('action.close')"
          @click="() => (isVisible = false)" />
      </div>
    </header>

    <div
      class="flex shrink grow basis-0 flex-row divide-x divide-gray-200 overflow-hidden dark:divide-neutral-700">
      <!-- Scrolls on its own when its content does not fit -->
      <section
        v-if="selectedIncome"
        class="flex h-full shrink grow basis-0 flex-col items-center gap-4 overflow-y-auto p-4 sm:pr-6">
        <StatsIncomeSankeyChart
          class="min-h-64 w-full shrink grow basis-0 overflow-hidden"
          :income="selectedIncome.data" />
        <dl
          class="flex w-full max-w-md min-w-80 shrink grow basis-0 flex-col gap-1 dark:text-gray-300">
          <div
            v-if="selectedIncome.data.tickets.count"
            class="flex flex-row items-start justify-between">
            <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
              <span
                class="mt-1.5 block size-3 shrink-0 rounded-full"
                :style="`background-color: ${statsColors.ticketOrder};`" />
              <i18n-t
                keypath="stats.incomes.tickets.label"
                :plural="selectedIncome.data.tickets.count"
                scope="global">
                <template #count>
                  {{ fractionNumber(selectedIncome.data.tickets.count) }}
                </template>
              </i18n-t>
            </dt>
            <dd class="font-mono text-base font-medium text-gray-900 dark:text-gray-100">
              {{ formatAmount(selectedIncome.data.tickets.amount) }}
            </dd>
          </div>
          <div
            v-for="entry in selectedIncome.data.tickets.byPrice.length > 1
              ? selectedIncome.data.tickets.byPrice
              : []"
            :key="`tickets-price-${entry.price}`"
            class="flex flex-row items-start justify-between pl-4">
            <dt class="text-sm font-normal text-gray-500 dark:text-gray-400">
              <i18n-t
                keypath="stats.incomes.tickets.byPrice.label"
                :plural="entry.count"
                scope="global">
                <template #count>{{ fractionNumber(entry.count) }}</template>
                <template #price>{{ formatAmount(entry.price) }}</template>
              </i18n-t>
            </dt>
            <dd class="font-mono text-sm text-gray-500 dark:text-gray-400">
              {{ formatAmount(entry.amount) }}
            </dd>
          </div>
          <div
            v-if="selectedIncome.data.subscriptions.count"
            class="flex flex-row items-start justify-between">
            <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
              <span
                class="mt-1.5 block size-3 shrink-0 rounded-full"
                :style="`background-color: ${statsColors.subscriptionOrder};`" />
              <i18n-t
                keypath="stats.incomes.subscriptions.label"
                :plural="selectedIncome.data.subscriptions.count"
                scope="global">
                <template #count>
                  {{ fractionNumber(selectedIncome.data.subscriptions.count) }}
                </template>
              </i18n-t>
            </dt>
            <dd class="font-mono text-base font-medium text-gray-900 dark:text-gray-100">
              {{ formatAmount(selectedIncome.data.subscriptions.amount) }}
            </dd>
          </div>
          <div
            v-for="entry in selectedIncome.data.subscriptions.byPrice.length > 1
              ? selectedIncome.data.subscriptions.byPrice
              : []"
            :key="`subscriptions-price-${entry.price}`"
            class="flex flex-row items-start justify-between pl-4">
            <dt class="text-sm font-normal text-gray-500 dark:text-gray-400">
              <i18n-t
                keypath="stats.incomes.subscriptions.byPrice.label"
                :plural="entry.count"
                scope="global">
                <template #count>{{ fractionNumber(entry.count) }}</template>
                <template #price>{{ formatAmount(entry.price) }}</template>
              </i18n-t>
            </dt>
            <dd class="font-mono text-sm text-gray-500 dark:text-gray-400">
              {{ formatAmount(entry.amount) }}
            </dd>
          </div>
          <div
            v-if="selectedIncome.data.memberships.count"
            class="flex flex-row items-start justify-between">
            <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
              <span
                class="mt-1.5 block size-3 shrink-0 rounded-full"
                :style="`background-color: ${statsColors.membershipOrder};`" />
              <i18n-t
                keypath="stats.incomes.memberships.label"
                :plural="selectedIncome.data.memberships.count"
                scope="global">
                <template #count>
                  {{ fractionNumber(selectedIncome.data.memberships.count) }}
                </template>
              </i18n-t>
            </dt>
            <dd class="font-mono text-base font-medium text-gray-900 dark:text-gray-100">
              {{ formatAmount(selectedIncome.data.memberships.amount) }}
            </dd>
          </div>

          <dd class="ml-auto text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {{ formatAmount(selectedIncome.data.income) }}
          </dd>

          <div class="flex flex-row items-start justify-between">
            <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
              <span
                class="mt-1.5 block size-3 shrink-0 rounded-full"
                :style="`background-color: ${statsColors.charges}`" />
              {{ $t(`${i18nKeyPrefix}.graph.threshold`) }}
            </dt>
            <dd class="font-mono text-base font-medium text-gray-400">
              {{ formatAmount(-selectedIncome.data.charges) }}
            </dd>
          </div>
          <div
            v-for="entry in selectedIncome.data.chargesBreakdown.length > 1
              ? selectedIncome.data.chargesBreakdown
              : []"
            :key="`charges-${entry.label}`"
            class="flex flex-row items-start justify-between pl-4">
            <dt class="text-sm font-normal text-gray-500 dark:text-gray-400">
              {{ $t(`stats.incomes.charges.${entry.label}`) }}
            </dt>
            <dd class="font-mono text-sm text-gray-400">
              {{ formatAmount(-entry.amount) }}
            </dd>
          </div>

          <div
            :class="[
              'mt-2 -mr-2.5 inline-flex items-baseline self-end rounded-full px-2.5 py-0.5 font-mono text-base font-medium',
              selectedIncome.data.income > selectedIncome.data.charges
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800',
            ]">
            {{
              `${selectedIncome.data.income > selectedIncome.data.charges ? '+' : ''}${formatAmount(selectedIncome.data.income - selectedIncome.data.charges)}`
            }}
          </div>
        </dl>
      </section>

      <!-- Kept while loading or on error, to display these states -->
      <section
        v-if="state.isMembersListVisible || !selectedIncome"
        class="flex max-w-xl shrink grow flex-col self-stretch overflow-hidden">
        <LoadingSpinner v-if="isPendingIncomes" class="mx-auto size-16 grow" />
        <ErrorState
          v-else-if="incomesErrorText"
          class="m-auto"
          :description="incomesErrorText"
          :title="$t('stats.incomes.onFetch.fail')">
          <template #action>
            <AppButtonPlain
              class="mt-6 dark:focus:ring-offset-neutral-800"
              color="neutral"
              :icon="mdiRefresh"
              :loading="isPendingIncomes"
              @click="refetchIncomes">
              {{ $t('action.retry') }}
            </AppButtonPlain>
          </template>
        </ErrorState>
        <ErrorState
          v-else-if="!selectedIncome"
          class="m-auto"
          :description="$t('stats.incomes.members.onMissingDate.description')"
          :title="$t('stats.incomes.members.onMissingDate.title')">
          <template #action><i></i></template>
        </ErrorState>
        <template v-else>
          <AppSearchField
            id="members-search"
            v-model="state.search"
            class="m-4 self-stretch"
            clearable
            hide-details
            input-class="pr-0"
            name="members-search"
            :placeholder="$t('stats.incomes.members.search.placeholder')">
            <template #after>
              <Menu as="div" class="relative -ml-px block">
                <MenuButton
                  class="relative -ml-px inline-flex h-full items-center rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-neutral-600 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700/50 dark:active:bg-zinc-700/80">
                  <AppIcon class="size-5 shrink-0 text-gray-400" :icon="mdiSort" />
                  <span class="ml-2 whitespace-nowrap max-sm:hidden">
                    {{
                      $t('stats.incomes.members.sort.label', {
                        ...(state.sort && {
                          suffix: $t(
                            `stats.incomes.members.sort.value.${state.sort}`,
                          ).toLocaleLowerCase(),
                        }),
                      })
                    }}
                  </span>
                  <AppIcon class="-mr-1.5 ml-2.5 size-5 text-gray-400" :icon="mdiChevronDown" />
                </MenuButton>
                <Transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95">
                  <MenuItems
                    class="absolute right-0 z-10 mt-2 -mr-1 w-56 origin-top-right rounded-md bg-white text-gray-700 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-300">
                    <div class="py-1">
                      <MenuItem
                        v-for="listSorter in ALL_LIST_SORTERS"
                        :key="`members-list-sort-${listSorter.key}`"
                        v-slot="{ active, close }">
                        <button
                          :class="[
                            active &&
                              'bg-gray-100 text-gray-900 dark:bg-neutral-900 dark:text-gray-100',
                            'flex w-full flex-row justify-between gap-3 px-4 py-2 sm:text-sm',
                          ]"
                          @click="
                            () => {
                              state.sort = listSorter.key !== state.sort ? listSorter.key : null;
                              close();
                            }
                          ">
                          {{ $t(`stats.incomes.members.sort.value.${listSorter.key}`) }}
                          <AppIcon
                            v-if="listSorter.key === state.sort"
                            class="-mr-1.5 ml-2.5 size-4 shrink-0"
                            :icon="mdiCheck" />
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>
            </template>
          </AppSearchField>
          <EmptyState
            v-if="!filteredList.length"
            :animation="EmptyOffice"
            animation-class="!-my-8"
            class="m-auto"
            :description="$t('stats.incomes.members.empty.description')"
            loop
            :title="$t('stats.incomes.members.empty.title')" />
          <ol
            v-else
            ref="membersList"
            class="grow divide-y divide-gray-200 overflow-y-scroll border-t border-gray-200 bg-white pb-4 text-sm ring-1 ring-black/5 dark:divide-neutral-700 dark:border-neutral-700 dark:bg-neutral-800">
            <IncomeMemberCard
              v-for="member in slicedList"
              :key="member._id"
              as="li"
              class="w-full"
              :member="member" />
            <!-- Next members are rendered when reaching the end of the list -->
            <li v-if="hasMore" ref="endOfList" class="flex justify-center py-4">
              <LoadingSpinner class="size-6" />
            </li>
          </ol>
        </template>
      </section>
    </div>
  </AppDialog>
</template>

<script setup lang="ts">
import IncomeMemberCard from './IncomeMemberCard.vue';
import StatsIncomeSankeyChart from './StatsIncomeSankeyChart.vue';
import { useStatsColors } from '../statsColors';
import EmptyOffice from '@/assets/animations/empty-office.lottie';
import AppIcon from '@/components/AppIcon.vue';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingProgressBar from '@/components/LoadingProgressBar.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppButtonIcon from '@/components/form/AppButtonIcon.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppSearchField from '@/components/form/AppSearchField.vue';
import AppDialog from '@/components/layout/AppDialog.vue';
import { formatAmount, fractionNumber } from '@/helpers/currency';
import { useIncrementalList } from '@/helpers/list';
import { searchIn } from '@/helpers/text';
import { Frequency } from '@/services/api/stats/frequency';
import {
  ChargeBreakdown,
  ChargeLabel,
  getIncomePerPeriod,
  IncomePeriod,
  MemberListItemWithIncome,
  PriceBreakdown,
  StatsIncome,
  WHOLE_PERIOD_SUMMARY_ROUTE_PARAM,
} from '@/services/api/stats/income';
import { statsQueryKeys, useAppQuery } from '@/services/query';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {
  mdiAccountMultiple,
  mdiAccountMultipleOutline,
  mdiCheck,
  mdiChevronDown,
  mdiClose,
  mdiRefresh,
  mdiSort,
} from '@mdi/js';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import { compact } from 'lodash';
import { computed, PropType, reactive, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const isVisible = defineModel({
  type: Boolean,
  default: false,
});

interface ListSorter {
  key: string;
  sort: (a: MemberListItemWithIncome, b: MemberListItemWithIncome) => number;
}

const ALL_LIST_SORTERS = computed<ListSorter[]>(() => [
  {
    key: 'income',
    sort: (a, b) => b.income.amount - a.income.amount,
  },
  {
    key: 'tickets',
    sort: (a, b) => b.income.tickets.amount - a.income.tickets.amount,
  },
  {
    key: 'subscriptions',
    sort: (a, b) => b.income.subscriptions.amount - a.income.subscriptions.amount,
  },
  {
    key: 'memberships',
    sort: (a, b) => b.income.memberships.amount - a.income.memberships.amount,
  },
]);

const props = defineProps({
  title: {
    type: String,
    default: null,
  },
  frequency: {
    type: String as PropType<Frequency>,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: null,
  },
});

const i18n = useI18n();
const statsColors = useStatsColors();
// Below lg, the members list is hidden by default to leave room for the summary
const isLargeScreen = useBreakpoints(breakpointsTailwind).greaterOrEqual('lg');
const state = reactive({
  search: null as string | null,
  sort: 'income' as string | null,
  isMembersListVisible: isLargeScreen.value,
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

const filteredList = computed(() => {
  return (selectedIncome.value?.data.members || [])
    .filter((member) =>
      searchIn(
        state.search,
        compact([member.firstName, member.lastName]).join(' '),
        member.email,
        member.income.tickets.count &&
          i18n.t('stats.incomes.tickets.label', {
            count: member.income.tickets.count,
          }),
        member.income.subscriptions.count &&
          i18n.t('stats.incomes.subscriptions.label', {
            count: member.income.subscriptions.count,
          }),
        member.income.memberships.count &&
          i18n.t('stats.incomes.memberships.label', {
            count: member.income.memberships.count,
          }),
      ),
    )
    .sort(ALL_LIST_SORTERS.value.find((s) => s.key === state.sort)?.sort);
});

// Rendering hundreds of member cards at once is slow: render them progressively while scrolling
const membersList = useTemplateRef<HTMLElement>('membersList');
const endOfList = useTemplateRef<HTMLElement>('endOfList');
const { slicedList, hasMore } = useIncrementalList(filteredList, endOfList, {
  step: 20,
  resetOn: [() => state.search, () => state.sort, () => props.date],
  onReset: () => membersList.value?.scrollTo({ top: 0 }),
});

const {
  isPending: isPendingIncomes,
  isFetching: isFetchingIncomes,
  data: incomes,
  errorText: incomesErrorText,
  refetch: refetchIncomes,
} = useAppQuery(
  computed(() => ({
    queryKey: statsQueryKeys.incomeInPeriod(props.frequency, props.from, props.to),
    queryFn: () => getIncomePerPeriod(props.frequency, props.from, props.to),
    enabled: isVisible.value,
  })),
);

type IncomeBreakdown = Pick<StatsIncome, 'tickets' | 'subscriptions' | 'memberships'>;

const addIncomeBreakdowns = (income: IncomeBreakdown, additionalData: IncomeBreakdown) => ({
  tickets: {
    count: income.tickets.count + additionalData.tickets.count,
    amount: income.tickets.amount + additionalData.tickets.amount,
  },
  subscriptions: {
    count: income.subscriptions.count + additionalData.subscriptions.count,
    amount: income.subscriptions.amount + additionalData.subscriptions.amount,
  },
  memberships: {
    count: income.memberships.count + additionalData.memberships.count,
    amount: income.memberships.amount + additionalData.memberships.amount,
  },
});

const mergePriceBreakdown = (a: PriceBreakdown[], b: PriceBreakdown[]): PriceBreakdown[] => {
  const byPrice = new Map<number, PriceBreakdown>();
  for (const entry of [...a, ...b]) {
    const existing = byPrice.get(entry.price);
    byPrice.set(entry.price, {
      price: entry.price,
      count: (existing?.count ?? 0) + entry.count,
      amount: (existing?.amount ?? 0) + entry.amount,
    });
  }
  return [...byPrice.values()].sort((x, y) => x.price - y.price);
};

const mergeChargesBreakdown = (a: ChargeBreakdown[], b: ChargeBreakdown[]): ChargeBreakdown[] => {
  const byLabel = new Map<ChargeLabel, number>();
  for (const entry of [...a, ...b]) {
    byLabel.set(entry.label, (byLabel.get(entry.label) ?? 0) + entry.amount);
  }
  return [...byLabel.entries()].map(([label, amount]) => ({ label, amount }));
};

const addAdditionalDataToPeriodIncome = (
  income: Omit<IncomePeriod<Frequency>['data'], 'members'>,
  additionalData: Omit<IncomePeriod<Frequency>['data'], 'members'>,
) => ({
  income: income.income + additionalData.income,
  ...addIncomeBreakdowns(income, additionalData),
  tickets: {
    ...addIncomeBreakdowns(income, additionalData).tickets,
    byPrice: mergePriceBreakdown(income.tickets.byPrice, additionalData.tickets.byPrice),
  },
  subscriptions: {
    ...addIncomeBreakdowns(income, additionalData).subscriptions,
    byPrice: mergePriceBreakdown(
      income.subscriptions.byPrice,
      additionalData.subscriptions.byPrice,
    ),
  },
  chargesBreakdown: mergeChargesBreakdown(income.chargesBreakdown, additionalData.chargesBreakdown),
});

const addAdditionalDataToMemberIncome = (income: StatsIncome, additionalData: StatsIncome) => ({
  amount: income.amount + additionalData.amount,
  ...addIncomeBreakdowns(income, additionalData),
});

const selectedIncome = computed(() => {
  if (props.date === WHOLE_PERIOD_SUMMARY_ROUTE_PARAM) {
    const totalMembersOverPeriod: MemberListItemWithIncome[] = [];
    let totalIncomeOverPeriod: Omit<IncomePeriod<Frequency>['data'], 'members'> = {
      income: 0,
      charges: 0,
      chargesBreakdown: [],
      tickets: { count: 0, amount: 0, byPrice: [] },
      subscriptions: { count: 0, amount: 0, byPrice: [] },
      memberships: { count: 0, amount: 0 },
    };

    incomes.value?.forEach((income) => {
      totalIncomeOverPeriod = {
        ...addAdditionalDataToPeriodIncome(income.data, totalIncomeOverPeriod),
        charges: income.data.charges + totalIncomeOverPeriod.charges,
      };
      income.data.members.forEach((member) => {
        const memberIndexInPeriod = totalMembersOverPeriod.findIndex((m) => m._id === member._id);
        if (memberIndexInPeriod >= 0) {
          const memberIncome = addAdditionalDataToMemberIncome(
            totalMembersOverPeriod[memberIndexInPeriod].income,
            member.income,
          );
          totalMembersOverPeriod[memberIndexInPeriod] = {
            ...totalMembersOverPeriod[memberIndexInPeriod],
            income: memberIncome,
          };
        } else {
          totalMembersOverPeriod.push(member);
        }
      });
    });

    return {
      date: WHOLE_PERIOD_SUMMARY_ROUTE_PARAM,
      data: {
        ...totalIncomeOverPeriod,
        members: totalMembersOverPeriod,
      },
    };
  }

  return incomes.value?.find((m) => m.date === props.date) || null;
});

watch(isVisible, (visible) => {
  if (visible) {
    state.isMembersListVisible = isLargeScreen.value;
  }
});
</script>
