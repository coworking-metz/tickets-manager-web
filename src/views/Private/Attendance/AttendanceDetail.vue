<template>
  <section class="flex size-full flex-col">
    <EmptyState
      v-if="!date"
      :animation="SelectCalendarDate"
      class="mx-auto mb-16 lg:my-32"
      :description="$t('attendance.detail.select.description')"
      loop
      :title="$t('attendance.detail.select.title')" />
    <template v-else>
      <header class="flex flex-col items-start max-sm:px-3">
        <h1
          class="text-2xl font-bold leading-7 text-gray-900 sm:mx-0 sm:truncate sm:text-3xl sm:tracking-tight dark:text-gray-100">
          {{ capitalize(dayjs(date).format('dddd LL')) }}
        </h1>
        <p
          v-if="attendance?.date && attendance.date === date"
          class="mt-1 truncate text-base text-slate-500 dark:text-slate-400">
          {{ $t('attendance.detail.attending', { count: attendance?.data.members.length }) }}
        </p>

        <div class="my-4 max-w-lg self-stretch">
          <label class="sr-only" for="members-search">
            {{ $t('attendance.detail.search.label') }}
          </label>
          <AppTextField
            id="members-search"
            v-model="state.search"
            hide-details
            name="members-search"
            :placeholder="$t('attendance.detail.search.placeholder')"
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
                      $t('attendance.detail.sort.label', {
                        ...(sort && {
                          suffix: $t(`attendance.detail.sort.value.${sort}`).toLocaleLowerCase(),
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
                        <RouterLink
                          :class="[
                            active &&
                              'bg-gray-100 text-gray-900 dark:bg-neutral-900 dark:text-gray-100',
                            'flex w-full flex-row justify-between gap-3 px-4 py-2 sm:text-sm',
                          ]"
                          replace
                          :to="{
                            ...currentRoute,
                            query: {
                              ...currentRoute.query,
                              sort: listSorter.key !== sort ? listSorter.key : undefined,
                            },
                          }"
                          @click="close">
                          {{ $t(`attendance.detail.sort.value.${listSorter.key}`) }}
                          <SvgIcon
                            v-if="listSorter.key === sort"
                            aria-hidden="true"
                            class="-mr-1.5 ml-2.5 size-4 shrink-0"
                            :path="mdiCheck"
                            type="mdi" />
                        </RouterLink>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>
            </template>
          </AppTextField>
        </div>
      </header>

      <template v-if="attendance?.date && attendance.date === date">
        <EmptyState
          v-if="!attendance?.data.members.length"
          :animation="EmptyOffice"
          animation-class="!-my-8"
          class="mx-auto my-16 lg:my-32"
          :description="$t('attendance.detail.empty.description')"
          loop
          :title="$t('attendance.detail.empty.title')" />
        <EmptyState
          v-else-if="state.search && !filteredList.length"
          class="mx-auto my-16 lg:my-32"
          :title="$t('attendance.detail.search.empty.title')" />
        <ol
          v-else-if="filteredList.length"
          class="mb-16 divide-y divide-gray-200 bg-white text-sm ring-1 ring-black/5 dark:divide-neutral-700 dark:bg-neutral-800">
          <li v-for="member in filteredList" :key="member._id">
            <RouterLink
              class="flex w-full transition-colors hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-neutral-900/50 dark:active:bg-neutral-900"
              :to="{
                name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
                params: { memberId: member._id },
              }">
              <AttendingMemberCard class="w-full" :member="member">
                <template #append>
                  <SvgIcon
                    aria-hidden="true"
                    class="ml-auto mr-1.5 size-6 shrink-0 text-gray-400 dark:text-gray-500"
                    :path="mdiChevronRight"
                    type="mdi" />
                </template>
              </AttendingMemberCard>
            </RouterLink>
          </li>
        </ol>
      </template>
      <LoadingSpinner v-else-if="loading" class="mx-auto my-16 size-12 lg:my-64" />
    </template>
  </section>
</template>

<script setup lang="ts">
import AttendingMemberCard from './AttendingMemberCard.vue';
import EmptyOffice from '@/assets/animations/empty-office.lottie';
import SelectCalendarDate from '@/assets/animations/select-calendar-date.lottie';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import { searchIn } from '@/helpers/text';
import { ROUTE_NAMES } from '@/router/names';
import { AttendancePeriod, AttendingMember } from '@/services/api/attendance';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { mdiCheck, mdiChevronDown, mdiMagnify, mdiSort, mdiChevronRight } from '@mdi/js';
import dayjs from 'dayjs';
import { capitalize } from 'lodash';
import { PropType, computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface ListSorter {
  key: string;
  sort: (a: AttendingMember, b: AttendingMember) => number;
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
    key: 'activity',
    sort: (a, b) =>
      (b.attendance.subscriptions.count || a.attendance.tickets.count || 0) -
      (a.attendance.subscriptions.count || b.attendance.tickets.count || 0),
  },
  {
    key: 'debt',
    sort: (a, b) => (b.attendance.tickets.debt.count || 0) - (a.attendance.tickets.debt.count || 0),
  },
]);

const props = defineProps({
  attendance: {
    type: Object as PropType<AttendancePeriod<'day'> | null>,
    default: null,
  },
  date: {
    type: String,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  search: {
    type: String,
    default: null,
  },
  sort: {
    type: String,
    default: null,
  },
});

const currentRoute = useRoute();
const router = useRouter();
const state = reactive({
  search: null as string | null,
});

const filteredList = computed(() => {
  return (props.attendance?.data.members || [])
    .filter((member) =>
      searchIn(
        state.search,
        [member.firstName, member.lastName].filter(Boolean).join(' '),
        [member.lastName, member.firstName].filter(Boolean).join(' '),
        member.email,
      ),
    )
    .sort(ALL_LIST_SORTERS.value.find((s) => s.key === props.sort)?.sort);
});

watch(
  () => props.search,
  (search) => {
    state.search = search;
  },
  { immediate: true },
);

watch(
  () => state.search,
  (search) => {
    if (search !== props.search) {
      router.replace({
        ...router.currentRoute.value,
        query: {
          ...router.currentRoute.value.query,
          search: search || undefined,
        },
      });
    }
  },
);
</script>
