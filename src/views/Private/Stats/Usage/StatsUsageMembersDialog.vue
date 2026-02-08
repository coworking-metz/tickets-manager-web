<template>
  <AppDialog
    v-model="isVisible"
    v-bind="$attrs"
    dialog-class="flex flex-col pt-4 relative overflow-hidden max-h-[min(90vh,840px)] max-w-xl h-full grow">
    <LoadingProgressBar v-if="isFetchingUsages" class="absolute top-0 h-px w-full" />
    <header v-if="title" class="mx-3 flex flex-row items-start justify-center sm:mx-12">
      <AppButtonText
        class="mx-auto shrink overflow-hidden"
        color="gray"
        @click="() => (state.isSummaryVisible = !state.isSummaryVisible)">
        <h2
          class="shrink truncate text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          {{ title }}
        </h2>
        <SvgIcon
          aria-hidden="true"
          class="shrink-0 dark:text-gray-500"
          :path="state.isSummaryVisible ? mdiUnfoldLessHorizontal : mdiUnfoldMoreHorizontal"
          type="mdi" />
      </AppButtonText>
    </header>

    <div class="flex shrink grow basis-0 flex-col">
      <dl
        v-if="selectedUsage && state.isSummaryVisible"
        class="flex w-full flex-col gap-1 p-4 sm:pr-6 dark:text-gray-300">
        <div class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.ticket};`" />
            <i18n-t keypath="stats.usage.tickets.label" :plural="totalTicketsCount" scope="global">
              <template #count>
                {{ fractionNumber(totalTicketsCount) }}
              </template>
            </i18n-t>
          </dt>
          <dd class="font-mono text-base font-medium text-gray-900 dark:text-gray-100">
            {{ formatAmount(totalTicketsAmount) }}
          </dd>
        </div>
        <div
          v-if="selectedUsage.data.tickets.debt?.count"
          class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.debt};`" />
            <i18n-t
              keypath="stats.usage.tickets.debt.label"
              :plural="selectedUsage.data.tickets.debt.count"
              scope="global">
              <template #count>
                {{ fractionNumber(selectedUsage.data.tickets.debt.count) }}
              </template>
            </i18n-t>
          </dt>
          <dd class="font-mono text-base font-medium text-gray-400">
            {{ `-${formatAmount(selectedUsage.data.tickets.debt.amount)}` }}
          </dd>
        </div>
        <div class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.subscription};`" />
            <i18n-t
              keypath="stats.usage.subscriptions.label"
              :plural="selectedUsage.data.subscriptions.count"
              scope="global">
              <template #count>
                {{ fractionNumber(selectedUsage.data.subscriptions.count) }}
              </template>
            </i18n-t>
            <template v-if="selectedUsage.data.subscriptions.attending.count">
              <br />
              <i18n-t
                keypath="stats.usage.subscriptions.attending"
                :plural="selectedUsage.data.subscriptions.attending.count"
                scope="global">
                <template #count>
                  {{ fractionNumber(selectedUsage.data.subscriptions.attending.count) }}
                </template>
              </i18n-t>
            </template>
          </dt>
          <dd class="font-mono text-base font-medium text-gray-900 dark:text-gray-100">
            {{ formatAmount(selectedUsage.data.subscriptions.amount) }}
          </dd>
        </div>

        <dd class="ml-auto text-3xl font-semibold text-gray-900 dark:text-gray-100">
          {{ formatAmount(selectedUsage.data.amount) }}
        </dd>

        <div class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.charges}`" />
            {{ $t(`${i18nKeyPrefix}.graph.threshold`) }}
          </dt>
          <dd class="font-mono text-base font-medium text-gray-400">
            {{ formatAmount(-selectedUsage.data.charges) }}
          </dd>
        </div>

        <div
          :class="[
            '-mr-2.5 mt-2 inline-flex items-baseline self-end rounded-full px-2.5 py-0.5 font-mono text-base font-medium',
            selectedUsage.data.amount > selectedUsage.data.charges
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800',
          ]">
          {{
            `${selectedUsage.data.amount > selectedUsage.data.charges ? '+' : ''}${formatAmount(selectedUsage.data.amount - selectedUsage.data.charges)}`
          }}
        </div>
      </dl>

      <div class="flex min-h-80 shrink grow basis-0 flex-col self-stretch overflow-hidden">
        <LoadingSpinner v-if="isPendingUsages" class="mx-auto size-16 grow" />
        <ErrorState
          v-else-if="usagesErrorText"
          class="m-auto"
          :description="usagesErrorText"
          :title="$t('stats.usage.onFetch.fail')">
          <template #action>
            <AppButtonPlain
              class="mt-6 dark:focus:ring-offset-neutral-800"
              color="neutral"
              :icon="mdiRefresh"
              :loading="isPendingUsages"
              @click="refetchUsages">
              {{ $t('action.retry') }}
            </AppButtonPlain>
          </template>
        </ErrorState>
        <ErrorState
          v-else-if="!selectedUsage"
          class="m-auto"
          :description="$t('stats.usage.members.onMissingDate.description')"
          :title="$t('stats.usage.members.onMissingDate.title')">
          <template #action><i></i></template>
        </ErrorState>
        <template v-else>
          <AppTextField
            id="members-search"
            v-model="state.search"
            class="m-4 self-stretch"
            clearable
            hide-details
            input-class="pr-0"
            name="members-search"
            :placeholder="$t('stats.usage.members.search.placeholder')"
            :prepend-icon="mdiMagnify"
            type="search">
            <template #after>
              <Menu as="div" class="relative -ml-px block">
                <MenuButton
                  class="relative -ml-px inline-flex h-full items-center rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:border-neutral-600 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700/50 dark:active:bg-zinc-700/80">
                  <SvgIcon
                    aria-hidden="true"
                    class="size-5 shrink-0 text-gray-400"
                    :path="mdiSort"
                    type="mdi" />
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
                  <SvgIcon
                    aria-hidden="true"
                    class="-mr-1.5 ml-2.5 size-5 text-gray-400"
                    :path="mdiChevronDown"
                    type="mdi" />
                </MenuButton>
                <Transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95">
                  <MenuItems
                    class="absolute right-0 z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md bg-white text-gray-700 shadow-lg ring-1 ring-black ring-opacity-[5%] focus:outline-none dark:border dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-300">
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
                          <SvgIcon
                            v-if="listSorter.key === state.sort"
                            aria-hidden="true"
                            class="-mr-1.5 ml-2.5 size-4 shrink-0"
                            :path="mdiCheck"
                            type="mdi" />
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>
            </template>
          </AppTextField>
          <EmptyState
            v-if="!filteredList.length"
            :animation="EmptyOffice"
            animation-class="!-my-8"
            class="m-auto"
            :description="$t('stats.usage.members.empty.description')"
            loop
            :title="$t('stats.usage.members.empty.title')" />
          <ol
            v-else
            class="grow divide-y divide-gray-200 overflow-y-scroll border-t border-gray-200 bg-white pb-4 text-sm ring-1 ring-black/5 dark:divide-neutral-700 dark:border-neutral-700 dark:bg-neutral-800">
            <UsageMemberCard
              v-for="member in filteredList"
              :key="member._id"
              as="li"
              class="w-full"
              :member="member">
              <template v-if="state.sort === 'activity'" #chips:prepend>
                <span
                  class="shrink truncate whitespace-nowrap rounded-full px-2 py-0.5 text-center text-xs leading-6 text-gray-800 ring-1 ring-inset dark:text-gray-100"
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
          </ol>
        </template>
      </div>
    </div>

    <AppButtonIcon
      class="absolute right-3 top-3 dark:ring-offset-neutral-800"
      :icon="mdiClose"
      tabindex="1"
      :title="$t('action.close')"
      @click="() => (isVisible = false)" />
  </AppDialog>
</template>

<script setup lang="ts">
import UsageMemberCard from './UsageMemberCard.vue';
import { useStatsColors } from '../statsColors';
import EmptyOffice from '@/assets/animations/empty-office.lottie';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingProgressBar from '@/components/LoadingProgressBar.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppButtonIcon from '@/components/form/AppButtonIcon.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppButtonText from '@/components/form/AppButtonText.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppDialog from '@/components/layout/AppDialog.vue';
import { formatAmount, fractionNumber } from '@/helpers/currency';
import { searchIn } from '@/helpers/text';
import { Frequency } from '@/services/api/stats/frequency';
import {
  computeActivityFromUsage,
  getUsagePerFrequency,
  MemberListItemWithUsage,
  StatsUsage,
  WHOLE_PERIOD_SUMMARY_ROUTE_PARAM,
} from '@/services/api/stats/usage';
import { statsQueryKeys, useAppQuery } from '@/services/query';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {
  mdiCheck,
  mdiChevronDown,
  mdiClose,
  mdiMagnify,
  mdiRefresh,
  mdiSort,
  mdiUnfoldLessHorizontal,
  mdiUnfoldMoreHorizontal,
} from '@mdi/js';
import { compact } from 'lodash';
import { computed, PropType, reactive } from 'vue';
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
    sort: (a, b) => b.usage.amount - a.usage.amount,
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
const state = reactive({
  search: null as string | null,
  sort: 'usage' as string | null,
  isSummaryVisible: false,
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
    .filter((member) =>
      searchIn(
        state.search,
        compact([member.firstName, member.lastName]).join(' '),
        member.email,
        member.usage.tickets.debt.count &&
          i18n.t('stats.usage.tickets.debt.count', { count: member.usage.tickets.debt.count }),
        member.usage.tickets.count &&
          i18n.t('stats.usage.tickets.label', { count: member.usage.tickets.count }),
        member.usage.subscriptions.count &&
          i18n.t('stats.usage.subscriptions.count', { count: member.usage.subscriptions.count }),
        i18n.t('stats.usage.activity.label', {
          count: computeActivityFromUsage(member.usage),
        }),
      ),
    )
    .sort(ALL_LIST_SORTERS.value.find((s) => s.key === state.sort)?.sort);
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
      debt: {
        count: (usage.tickets.debt?.count ?? 0) + (additionalData.tickets.debt?.count ?? 0),
        amount: (usage.tickets.debt?.amount ?? 0) + (additionalData.tickets.debt?.amount ?? 0),
      },
    },
    subscriptions: {
      count: usage.subscriptions.count + additionalData.subscriptions.count,
      amount: usage.subscriptions.amount + additionalData.subscriptions.amount,
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
