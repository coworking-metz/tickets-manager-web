<template>
  <AppDialog
    v-model="isVisible"
    v-bind="$attrs"
    dialog-class="flex flex-col pt-4 relative overflow-hidden max-h-[min(90vh,840px)] max-w-[1280px] 4xl:max-w-[1440px] h-full grow">
    <LoadingProgressBar v-if="isFetchingUsages" class="absolute top-0 h-px w-full" />
    <header class="mx-3 flex flex-row items-start justify-center sm:mx-24">
      <div class="mx-auto flex shrink flex-row items-center overflow-hidden">
        <h2
          v-if="title"
          class="shrink truncate py-1.5 text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          {{ title }}
        </h2>
        <ErrorBadge
          v-if="usagesErrorText"
          class="ml-2 shrink-0"
          :description="usagesErrorText"
          :retrying="isFetchingUsages"
          :title="$t('stats.usage.onFetch.fail')"
          @retry="refetchUsages" />
      </div>
      <div
        class="absolute top-3 right-3 flex flex-row items-center gap-1 rounded-full bg-white/5 backdrop-blur-xl dark:bg-neutral-800/5">
        <div class="relative">
          <AppButtonIcon
            :aria-pressed="state.isMembersListVisible"
            class="dark:ring-offset-neutral-800"
            :icon="state.isMembersListVisible ? mdiAccountMultiple : mdiAccountMultipleOutline"
            tabindex="-1"
            :title="
              $t(
                state.isMembersListVisible
                  ? 'stats.usage.members.toggle.hide'
                  : 'stats.usage.members.toggle.show',
              )
            "
            @click="() => (state.isMembersListVisible = !state.isMembersListVisible)" />
          <!-- Members matching the current selection (and search) -->
          <span
            v-if="selectedUsage"
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
      <!-- Summary: skeleton while loading, content, or empty state. Scrolls on its own when its content does not fit -->
      <section
        class="flex h-full shrink grow basis-0 flex-row flex-wrap items-stretch gap-4 overflow-y-auto p-4 sm:pr-6">
        <template v-if="isPendingUsages">
          <div class="flex w-full min-w-64 shrink grow basis-0 items-center justify-center">
            <!-- Sunburst ring -->
            <div class="relative aspect-square w-full max-w-64">
              <LoadingSkeleton class="size-full rounded-full" />
              <div
                aria-hidden="true"
                class="absolute inset-1/4 rounded-full bg-white dark:bg-neutral-800" />
            </div>
          </div>
          <StatsPeriodSummarySkeleton
            class="mx-auto w-full max-w-md min-w-64 shrink grow basis-0" />
        </template>
        <template v-else-if="selectedUsage">
          <div
            :class="[
              'relative flex w-full min-w-64 shrink grow basis-0 flex-col overflow-hidden',
              !state.isMembersListVisible && 'min-h-72',
            ]">
            <StatsUsageDistributionChart
              v-model:selected="state.filters"
              class="min-h-40 shrink grow basis-0 overflow-hidden"
              :usage="selectedUsage.data" />
            <AppButtonIcon
              v-if="state.filters.length"
              class="absolute! top-1/2 left-1/2 -translate-1/2"
              :icon="mdiFilterOff"
              :title="$t('action.reset')"
              @click="() => (state.filters = [])" />
          </div>
          <StatsPeriodSummary
            v-if="summary"
            class="mx-auto w-full max-w-md min-w-64 shrink grow basis-0 self-center dark:text-gray-300"
            interactive
            v-bind="summary"
            @select="onSummarySelect" />
        </template>
        <EmptyState
          v-else
          class="m-auto"
          :description="$t('stats.usage.members.onMissingDate.description')"
          :title="$t('stats.usage.members.onMissingDate.title')" />
      </section>

      <!-- Members: skeleton while loading, list, or empty state -->
      <section
        v-if="state.isMembersListVisible"
        class="flex max-w-lg shrink grow flex-col self-stretch overflow-hidden">
        <AppSearchField
          id="members-search"
          v-model="state.search"
          class="m-4 self-stretch"
          clearable
          hide-details
          input-class="pr-0"
          name="members-search"
          :placeholder="$t('stats.usage.members.search.placeholder')">
          <template #after>
            <Menu as="div" class="relative -ml-px block">
              <MenuButton
                class="relative -ml-px inline-flex h-full items-center rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-neutral-600 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700/50 dark:active:bg-zinc-700/80">
                <AppIcon class="size-5 shrink-0 text-gray-400" :icon="mdiSort" />
                <span class="ml-2 whitespace-nowrap max-sm:hidden">
                  {{
                    $t('stats.usage.members.sort.label', {
                      ...(state.sort && {
                        suffix: $t(
                          `stats.usage.members.sort.value.${state.sort}`,
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
                        {{ $t(`stats.usage.members.sort.value.${listSorter.key}`) }}
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
        <ol
          v-if="isPendingUsages"
          aria-hidden="true"
          class="grow divide-y divide-gray-200 overflow-hidden border-t border-gray-200 bg-white text-sm ring-1 ring-black/5 dark:divide-neutral-700 dark:border-neutral-700 dark:bg-neutral-800">
          <li v-for="index in 8" :key="`member-skeleton-${index}`">
            <MemberCard loading />
          </li>
        </ol>
        <EmptyState
          v-else-if="!filteredList.length"
          :animation="EmptyOffice"
          animation-class="!-my-8"
          class="m-auto"
          :description="$t('stats.usage.members.empty.description')"
          loop
          :title="$t('stats.usage.members.empty.title')" />
        <ol
          v-else
          ref="membersList"
          class="grow divide-y divide-gray-200 overflow-y-scroll border-t border-gray-200 bg-white pb-4 text-sm ring-1 ring-black/5 dark:divide-neutral-700 dark:border-neutral-700 dark:bg-neutral-800">
          <UsageMemberCard
            v-for="member in slicedList"
            :key="member._id"
            as="li"
            class="w-full"
            :filters="state.filters"
            :member="member"
            :prices="{ tickets: ticketsPrices, subscriptions: subscriptionsPrices }">
            <template v-if="state.sort === 'activity'" #chips:prepend>
              <span
                class="shrink truncate rounded-full px-2 py-0.5 text-center text-xs leading-6 whitespace-nowrap text-gray-800 ring-1 ring-inset dark:text-gray-100"
                :style="`background-color: ${statsColors.activity}88; --tw-ring-color: ${statsColors.activity};`">
                <i18n-t
                  keypath="stats.usage.activity.count"
                  :plural="computeActivityFromUsage(member.usage)"
                  scope="global">
                  <template #count>
                    {{ fractionNumber(computeActivityFromUsage(member.usage)) }}
                  </template>
                </i18n-t>
              </span>
            </template>
          </UsageMemberCard>
          <!-- Next members are rendered when reaching the end of the list -->
          <li v-if="hasMore" ref="endOfList" class="flex justify-center py-4">
            <LoadingSpinner class="size-6" />
          </li>
        </ol>
      </section>
    </div>
  </AppDialog>
</template>

<script setup lang="ts">
import StatsUsageDistributionChart from './StatsUsageDistributionChart.vue';
import UsageMemberCard from './UsageMemberCard.vue';
import StatsPeriodSummary from '../StatsPeriodSummary.vue';
import StatsPeriodSummarySkeleton from '../StatsPeriodSummarySkeleton.vue';
import { getDistinctPrices } from '../priceBreakdown';
import { useStatsColors } from '../statsColors';
import { buildPriceRows, StatsTooltipRow } from '../statsTooltip';
import EmptyOffice from '@/assets/animations/empty-office.lottie';
import AppIcon from '@/components/AppIcon.vue';
import EmptyState from '@/components/EmptyState.vue';
import ErrorBadge from '@/components/ErrorBadge.vue';
import LoadingProgressBar from '@/components/LoadingProgressBar.vue';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import MemberCard from '@/components/MemberCard.vue';
import AppButtonIcon from '@/components/form/AppButtonIcon.vue';
import AppSearchField from '@/components/form/AppSearchField.vue';
import AppDialog from '@/components/layout/AppDialog.vue';
import { formatAmount, fractionNumber } from '@/helpers/currency';
import { useIncrementalList } from '@/helpers/list';
import { searchIn } from '@/helpers/text';
import { Frequency } from '@/services/api/stats/frequency';
import {
  computeActivityFromUsage,
  computeUsageAmountInFilters,
  getUsagePerFrequency,
  isUsageInFilters,
  isUsageFilterActive,
  isUsageFilterSelected,
  MemberListItemWithUsage,
  mergePriceBreakdowns,
  StatsUsage,
  toggleUsageFilter,
  UsageCategory,
  UsageFilter,
  WHOLE_PERIOD_SUMMARY_ROUTE_PARAM,
} from '@/services/api/stats/usage';
import { statsQueryKeys, useAppQuery } from '@/services/query';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {
  mdiAccountMultiple,
  mdiAccountMultipleOutline,
  mdiCheck,
  mdiChevronDown,
  mdiClose,
  mdiFilterOff,
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
  sort: (a: MemberListItemWithUsage, b: MemberListItemWithUsage) => number;
}

const ALL_LIST_SORTERS = computed<ListSorter[]>(() => [
  {
    key: 'usage',
    sort: (a, b) =>
      computeUsageAmountInFilters(b.usage, state.filters) -
      computeUsageAmountInFilters(a.usage, state.filters),
  },
  {
    key: 'debt',
    sort: (a, b) => (b.usage.tickets.debt.count ?? 0) - (a.usage.tickets.debt.count ?? 0),
  },
  {
    key: 'activity',
    sort: (a, b) => computeActivityFromUsage(b.usage) - computeActivityFromUsage(a.usage),
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
  sort: 'usage' as string | null,
  isMembersListVisible: isLargeScreen.value,
  filters: [] as UsageFilter[],
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

const filteredList = computed(() => {
  return (selectedUsage.value?.data.members || [])
    .filter((member) => isUsageInFilters(member.usage, state.filters))
    .filter((member) =>
      searchIn(
        state.search,
        compact([member.firstName, member.lastName]).join(' '),
        member.email,
        member.usage.tickets.debt.count &&
          i18n.t('stats.usage.tickets.debt.count', {
            count: member.usage.tickets.debt.count,
          }),
        member.usage.tickets.count &&
          i18n.t('stats.usage.tickets.label', {
            count: member.usage.tickets.count,
          }),
        member.usage.subscriptions.count &&
          i18n.t('stats.usage.subscriptions.count', {
            count: member.usage.subscriptions.count,
          }),
        i18n.t('stats.usage.activity.label', {
          count: computeActivityFromUsage(member.usage),
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
  resetOn: [() => state.filters, () => state.search, () => state.sort, () => props.date],
  onReset: () => membersList.value?.scrollTo({ top: 0 }),
});

const {
  isPending: isPendingUsages,
  isFetching: isFetchingUsages,
  data: usages,
  errorText: usagesErrorText,
  refetch: refetchUsages,
} = useAppQuery(
  computed(() => ({
    queryKey: statsQueryKeys.usageInPeriod(props.frequency, props.from, props.to),
    queryFn: () => getUsagePerFrequency(props.frequency, props.from, props.to),
    enabled: isVisible.value,
  })),
);

const addAdditionalDataToUsage = (usage: StatsUsage, additionalData: StatsUsage) => {
  return {
    amount: usage.amount + additionalData.amount,
    tickets: {
      count: usage.tickets.count + additionalData.tickets.count,
      amount: usage.tickets.amount + additionalData.tickets.amount,
      byPrice: mergePriceBreakdowns(usage.tickets.byPrice, additionalData.tickets.byPrice),
      debt: {
        count: (usage.tickets.debt?.count ?? 0) + (additionalData.tickets.debt?.count ?? 0),
        amount: (usage.tickets.debt?.amount ?? 0) + (additionalData.tickets.debt?.amount ?? 0),
      },
    },
    subscriptions: {
      count: usage.subscriptions.count + additionalData.subscriptions.count,
      amount: usage.subscriptions.amount + additionalData.subscriptions.amount,
      byPrice: mergePriceBreakdowns(
        usage.subscriptions.byPrice,
        additionalData.subscriptions.byPrice,
      ),
      attending: {
        count:
          (usage.subscriptions.attending?.count ?? 0) +
          (additionalData.subscriptions.attending?.count ?? 0),
        amount:
          (usage.subscriptions.attending?.amount ?? 0) +
          (additionalData.subscriptions.attending?.amount ?? 0),
      },
    },
  };
};

const selectedUsage = computed(() => {
  if (props.date === WHOLE_PERIOD_SUMMARY_ROUTE_PARAM) {
    const totalMembersOverPeriod: MemberListItemWithUsage[] = [];
    let totalUsageOverPeriod: StatsUsage & { charges: number } = {
      amount: 0,
      charges: 0,
      tickets: {
        count: 0,
        amount: 0,
        debt: {
          count: 0,
          amount: 0,
        },
      },
      subscriptions: {
        count: 0,
        amount: 0,
        attending: {
          count: 0,
          amount: 0,
        },
      },
    };

    usages.value?.forEach((usage) => {
      totalUsageOverPeriod = {
        ...addAdditionalDataToUsage(usage.data, totalUsageOverPeriod),
        charges: usage.data.charges + totalUsageOverPeriod.charges,
      };
      usage.data.members.forEach((member) => {
        const memberIndexInPeriod = totalMembersOverPeriod.findIndex((m) => m._id === member._id);
        if (memberIndexInPeriod >= 0) {
          const memberUsage = addAdditionalDataToUsage(
            totalMembersOverPeriod[memberIndexInPeriod].usage,
            member.usage,
          );
          totalMembersOverPeriod[memberIndexInPeriod] = {
            ...totalMembersOverPeriod[memberIndexInPeriod],
            usage: memberUsage,
          };
        } else {
          totalMembersOverPeriod.push(member);
        }
      });
    });

    return {
      date: WHOLE_PERIOD_SUMMARY_ROUTE_PARAM,
      data: {
        ...totalUsageOverPeriod,
        members: totalMembersOverPeriod,
      },
    };
  }

  return usages.value?.find((m) => m.date === props.date) || null;
});

watch(isVisible, (visible) => {
  if (visible) {
    state.isMembersListVisible = isLargeScreen.value;
  }
});

watch(
  () => props.date,
  () => {
    state.filters = [];
  },
);

// Same prices as the distribution chart, so each price gets the same shade
const ticketsPrices = computed(() =>
  getDistinctPrices([selectedUsage.value?.data.tickets.byPrice]),
);
const subscriptionsPrices = computed(() =>
  getDistinctPrices([selectedUsage.value?.data.subscriptions.byPrice]),
);

const onSummarySelect = (filter: unknown) => {
  state.filters = toggleUsageFilter(state.filters, filter as UsageFilter);
};

/**
 * Rows reflect and drive the same selection as the distribution chart.
 */
const withSelection = (row: StatsTooltipRow, category: UsageCategory): StatsTooltipRow => ({
  ...row,
  data: { category },
  selected: isUsageFilterSelected(state.filters, category),
  dimmed: !isUsageFilterActive(state.filters, category),
  children: row.children?.map((child) => {
    const price = child.data as number;
    return {
      ...child,
      data: { category, price },
      selected: isUsageFilterSelected(state.filters, category, price),
      dimmed: !isUsageFilterActive(state.filters, category, price),
    };
  }),
});

const summary = computed(() => {
  if (!selectedUsage.value) return null;
  const { tickets, subscriptions, amount, charges } = selectedUsage.value.data;
  const debtCount = tickets.debt?.count ?? 0;
  const attendingCount = subscriptions.attending?.count ?? 0;

  return {
    rows: [
      withSelection(
        {
          color: statsColors.value.ticket,
          label: i18n.t(
            'stats.usage.tickets.label',
            { count: fractionNumber(totalTicketsCount.value) },
            totalTicketsCount.value,
          ),
          amount: formatAmount(totalTicketsAmount.value),
          children: buildPriceRows({
            byPrice: tickets.byPrice,
            prices: ticketsPrices.value,
            color: statsColors.value.ticket,
            ramp: statsColors.value.ticketPrices,
            formatLabel: ({ count, price }) =>
              i18n.t(
                'stats.usage.tickets.byPrice.label',
                { count: fractionNumber(count), price: formatAmount(price) },
                count,
              ),
            formatAmount,
          }),
        },
        'tickets',
      ),
      ...(debtCount
        ? [
            withSelection(
              {
                color: statsColors.value.debtPattern,
                label: i18n.t(
                  'stats.usage.tickets.debt.label',
                  { count: fractionNumber(debtCount) },
                  debtCount,
                ),
                amount: `-${formatAmount(tickets.debt.amount)}`,
                muted: true,
              },
              'debt',
            ),
          ]
        : []),
      withSelection(
        {
          color: statsColors.value.subscription,
          label: i18n.t(
            'stats.usage.subscriptions.label',
            { count: fractionNumber(subscriptions.count) },
            subscriptions.count,
          ),
          ...(attendingCount && {
            sublabel: i18n.t(
              'stats.usage.subscriptions.attending',
              { count: fractionNumber(attendingCount) },
              attendingCount,
            ),
          }),
          amount: formatAmount(subscriptions.amount),
          children: buildPriceRows({
            byPrice: subscriptions.byPrice,
            prices: subscriptionsPrices.value,
            color: statsColors.value.subscription,
            ramp: statsColors.value.subscriptionPrices,
            formatLabel: ({ count, price }) =>
              i18n.t(
                'stats.usage.subscriptions.byPrice.label',
                { count: fractionNumber(count), price: formatAmount(price) },
                count,
              ),
            formatAmount,
          }),
        },
        'subscriptions',
      ),
    ],
    total: amount,
    charges,
    chargesLabel: i18n.t(`${i18nKeyPrefix.value}.graph.threshold`),
    chargesColor: statsColors.value.charges,
  };
});

const totalTicketsCount = computed(
  () =>
    (selectedUsage.value?.data.tickets.count ?? 0) +
    (selectedUsage.value?.data.tickets.debt?.count ?? 0),
);
const totalTicketsAmount = computed(
  () =>
    (selectedUsage.value?.data.tickets.amount ?? 0) +
    (selectedUsage.value?.data.tickets.debt?.amount ?? 0),
);
</script>
