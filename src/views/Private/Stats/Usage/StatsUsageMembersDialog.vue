<template>
  <AppDialog
    v-model="isVisible"
    v-bind="$attrs"
    dialog-class="flex flex-col pt-4 relative sm:max-h-[min(90vh,840px)] max-w-xl max-h-full grow md:h-full overflow-auto md:overflow-hidden">
    <header v-if="title" class="ml-6 mr-12 flex flex-row items-start">
      <h2 class="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        {{ title }}
      </h2>
    </header>

    <div class="flex shrink grow basis-0 flex-col md:overflow-auto">
      <dl v-if="selectedUsageDate" class="flex w-full flex-col gap-1 p-4 dark:text-gray-300">
        <div
          v-if="selectedUsageDate.data.tickets.debt.count"
          class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.debt};`"></span>
            {{
              $t(`stats.usage.tickets.debt`, {
                count: selectedUsageDate?.data.tickets.debt.count,
              })
            }}
          </dt>
          <dd class="text-base font-medium text-gray-400">
            {{ formatAmount(selectedUsageDate.data.tickets.debt.amount) }}
          </dd>
        </div>

        <div class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.ticket};`" />
            {{
              $t(`stats.usage.tickets.label`, {
                count: selectedUsageDate.data.tickets.count,
              })
            }}
          </dt>
          <dd class="text-base font-medium text-gray-900 dark:text-gray-100">
            {{ formatAmount(selectedUsageDate.data.tickets.amount) }}
          </dd>
        </div>
        <div class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.subscription};`" />
            {{
              $t(`stats.usage.subscriptions.label`, {
                count: selectedUsageDate.data.subscriptions.count,
              })
            }}
            <template v-if="selectedUsageDate.data.subscriptions.attending.count">
              <br />
              {{
                $t(`stats.usage.subscriptions.attending`, {
                  count: selectedUsageDate.data.subscriptions.attending.count,
                })
              }}
            </template>
          </dt>
          <dd class="text-base font-medium text-gray-900 dark:text-gray-100">
            {{ formatAmount(selectedUsageDate.data.subscriptions.amount) }}
          </dd>
        </div>

        <dd class="ml-auto text-3xl font-semibold text-gray-900 dark:text-gray-100">
          {{ formatAmount(selectedUsageDate.data.amount) }}
        </dd>

        <div class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.charges}`" />
            {{ $t(`${i18nKeyPrefix}.graph.threshold`) }}
          </dt>
          <dd class="text-base font-medium text-gray-900 dark:text-gray-100">
            {{ formatAmount(-selectedUsageDate.data.charges) }}
          </dd>
        </div>

        <div
          :class="[
            '-mr-2.5 inline-flex items-baseline self-end rounded-full px-2.5 py-0.5 text-base font-medium md:mt-2 lg:mt-0',
            selectedUsageDate.data.amount > selectedUsageDate.data.charges
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800',
          ]">
          {{
            `${selectedUsageDate.data.amount > selectedUsageDate.data.charges ? '+' : ''}
          ${formatAmount(selectedUsageDate.data.amount - selectedUsageDate.data.charges)}`
          }}
        </div>
      </dl>

      <div class="flex min-h-80 shrink grow basis-0 flex-col self-stretch md:overflow-hidden">
        <LoadingSpinner v-if="isFetchingUsages" class="mx-auto my-32 size-16" />
        <ErrorState
          v-else-if="usagesErrorText"
          class="mx-auto my-32"
          :description="usagesErrorText"
          :title="$t('stats.usage.onFetch.fail')">
          <template #action>
            <AppButtonPlain
              class="mt-6 dark:focus:ring-offset-neutral-800"
              color="neutral"
              :icon="mdiRefresh"
              :loading="isFetchingUsages"
              @click="refetchUsages">
              {{ $t('action.retry') }}
            </AppButtonPlain>
          </template>
        </ErrorState>
        <ErrorState
          v-else-if="!selectedUsageDate"
          class="mx-auto my-32"
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
            tabindex="1"
            type="search">
            <template #after>
              <Menu as="div" class="relative -ml-px block">
                <MenuButton
                  class="relative -ml-px inline-flex h-full items-center rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:border-neutral-600 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700/50 dark:active:bg-zinc-700/80"
                  tabindex="1">
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
            class="mx-auto my-16 lg:my-32"
            :description="$t('stats.usage.members.empty.description')"
            loop
            :title="$t('stats.usage.members.empty.title')" />
          <ol
            v-else
            class="grow divide-y divide-gray-200 border-t border-gray-200 bg-white pb-4 text-sm ring-1 ring-black/5 md:overflow-y-scroll dark:divide-neutral-700 dark:border-neutral-700 dark:bg-neutral-800">
            <UsageMemberCard
              v-for="member in filteredList"
              :key="member._id"
              as="li"
              class="w-full"
              :member="member" />
          </ol>
        </template>
      </div>
    </div>

    <AppButtonIcon
      class="absolute right-3 top-3 dark:ring-offset-neutral-800"
      :icon="mdiClose"
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
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppButtonIcon from '@/components/form/AppButtonIcon.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppDialog from '@/components/layout/AppDialog.vue';
import { formatAmount } from '@/helpers/currency';
import { searchIn } from '@/helpers/text';
import { Frequency } from '@/services/api/stats/frequency';
import { getUsagePerFrequency, MemberListItemWithUsage } from '@/services/api/stats/usage';
import { statsQueryKeys, useAppQuery } from '@/services/query';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { mdiCheck, mdiChevronDown, mdiClose, mdiMagnify, mdiRefresh, mdiSort } from '@mdi/js';
import { computed, PropType, reactive } from 'vue';

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
    key: 'name',
    sort: (a, b) =>
      [a.firstName, a.lastName]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase()
        .localeCompare([b.firstName, b.lastName].filter(Boolean).join(' ').toLocaleLowerCase()),
  },
  {
    key: 'usage',
    sort: (a, b) => b.usage.amount - a.usage.amount,
  },
  {
    key: 'debt',
    sort: (a, b) => (b.usage.tickets.debt.count ?? 0) - (a.usage.tickets.debt.count ?? 0),
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

const statsColors = useStatsColors();
const state = reactive({
  search: null as string | null,
  sort: 'usage' as string | null,
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
  return (selectedUsageDate.value?.data.members || [])
    .filter((member) =>
      searchIn(
        state.search,
        [member.firstName, member.lastName].filter(Boolean).join(' '),
        [member.lastName, member.firstName].filter(Boolean).join(' '),
        member.email,
      ),
    )
    .sort(ALL_LIST_SORTERS.value.find((s) => s.key === state.sort)?.sort);
});

const {
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

const selectedUsageDate = computed(() => {
  if (!props.date) return null;
  return usages.value?.find((m) => m.date === props.date) || null;
});
</script>
