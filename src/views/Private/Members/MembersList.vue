<template>
  <article class="mx-auto flex w-full max-w-6xl grow flex-col pb-6 pt-12 sm:px-6 sm:pt-40 lg:px-8">
    <Head>
      <title>{{ $t('members.list.head.title') }}</title>
    </Head>
    <h1
      class="mx-3 text-2xl font-bold leading-7 text-gray-900 sm:mx-0 sm:truncate sm:text-3xl sm:tracking-tight">
      {{ $t('members.list.title') }}
    </h1>
    <div class="mt-6 flex flex-row flex-wrap-reverse place-items-start justify-between gap-3">
      <nav class="flex flex-row gap-x-3 overflow-x-auto px-3 sm:px-0">
        <router-link
          v-for="listTab in ALL_TABS"
          :key="`list-tab-${listTab.key}`"
          :aria-current="listTab.hash === tab ? 'page' : undefined"
          :class="[
            listTab.hash === tab
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            'whitespace-nowrap border-b-2 px-1 pb-4 pt-2.5 text-sm font-medium',
          ]"
          replace
          :to="{
            ...route,
            query: { ...route.query, slice: undefined },
            hash: listTab.hash ? `#${listTab.hash}` : '',
          }">
          {{
            $t(`members.list.tabs.${listTab.key}`, {
              count: listTab.count || 0,
            })
          }}
          <span
            v-if="!isNil(listTab.count)"
            :class="[
              listTab.hash === tab ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-900',
              'ml-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
            ]">
            {{ listTab.count }}
          </span>
        </router-link>
      </nav>

      <div class="mx-3 w-full max-w-lg sm:mx-0">
        <label class="sr-only" for="members-search">{{ $t('members.list.search.label') }}</label>
        <AppTextField
          id="members-search"
          v-model="state.search"
          hide-details
          name="members-search"
          :placeholder="$t('members.list.search.placeholder')"
          :prepend-icon="mdiMagnify"
          tabindex="1"
          type="search">
          <template #after>
            <Menu as="div" class="relative -ml-px block">
              <MenuButton
                class="relative -ml-px inline-flex h-full items-center rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                tabindex="1">
                <SvgIcon
                  aria-hidden="true"
                  class="size-5 shrink-0 text-gray-400"
                  :path="mdiSort"
                  type="mdi" />
                <span class="ml-2 whitespace-nowrap max-sm:hidden">
                  {{
                    $t('members.list.sort.label', {
                      ...(sort && {
                        suffix: $t(`members.list.sort.value.${sort}`).toLocaleLowerCase(),
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
                  class="absolute right-0 z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-[5%] focus:outline-none">
                  <div class="py-1">
                    <MenuItem
                      v-for="listSorter in ALL_LIST_SORTERS"
                      :key="`members-list-sort-${listSorter.key}`"
                      v-slot="{ active, close }">
                      <RouterLink
                        :class="[
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'flex w-full flex-row justify-between gap-3 px-4 py-2 sm:text-sm',
                        ]"
                        replace
                        :to="{
                          ...route,
                          query: {
                            ...route.query,
                            sort: listSorter.key !== sort ? listSorter.key : undefined,
                          },
                        }"
                        @click="close">
                        {{ $t(`members.list.sort.value.${listSorter.key}`) }}
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
    </div>

    <div class="flex flex-col-reverse items-stretch gap-3 md:flex-row">
      <div
        class="relative flex grow flex-col border-t border-gray-200 bg-white shadow sm:rounded-md">
        <div
          v-if="isFetching || isFetchingVotingMembers"
          class="sticky top-[67px] w-full sm:top-[3px]">
          <LoadingProgressBar class="absolute top-[-3px] h-[2px] w-full" />
        </div>

        <ul class="grow divide-y divide-gray-200" role="list">
          <template v-if="isPending || (tab === 'voting' && isFetchingVotingMembers)">
            <li v-for="index in 10" :key="`loading-member-card-${index}`">
              <MembersListCard loading />
            </li>
          </template>
          <EmptyState
            v-else-if="!slicedList.length"
            class="m-auto pb-24 pt-6"
            :title="$t('members.list.empty.title')" />
          <li v-else v-for="member in slicedList" :key="`member-${member._id}`">
            <RouterLink
              class="block transition-colors hover:bg-gray-50 active:bg-gray-100"
              :to="{
                name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
                params: { id: member._id },
              }">
              <MembersListCard :loading="isFetching || isFetchingVotingMembers" :member="member" />
            </RouterLink>
          </li>
        </ul>
      </div>

      <aside v-if="selectedTab?.key === 'nonCompliant'" class="flex flex-col">
        <dl class="flex flex-row flex-wrap gap-3 max-sm:px-3 md:sticky md:top-3 md:max-w-48">
          <div
            class="min-w-32 shrink grow basis-0 overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt class="truncate font-medium text-gray-500 sm:text-sm">
              {{ $t('members.list.nonCompliant.totalDebt.label') }}
            </dt>
            <i18n-t
              class="mt-1"
              keypath="members.list.nonCompliant.totalDebt.value"
              :plural="totalDebt"
              scope="global"
              tag="dd">
              <template #count>
                <AnimatedCounter
                  class="block text-3xl font-semibold tracking-tight text-gray-900"
                  :duration="1"
                  :format="
                    (count: number) =>
                      formatAmount(count, {
                        maximumFractionDigits: 1,
                        style: 'decimal',
                      })
                  "
                  :to="totalDebt" />
              </template>
            </i18n-t>
          </div>
          <div
            class="min-w-32 shrink grow basis-0 overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt class="truncate font-medium text-gray-500 sm:text-sm">
              {{
                $t('members.list.nonCompliant.missingMemberships.label', {
                  count: missingMembershipsCount,
                })
              }}
            </dt>
            <i18n-t
              class="mt-1"
              keypath="members.list.nonCompliant.missingMemberships.value"
              :plural="missingMembershipsCount"
              scope="global"
              tag="dd">
              <template #count>
                <AnimatedCounter
                  class="block text-3xl font-semibold tracking-tight text-gray-900"
                  :duration="1"
                  :format="
                    (count: number) =>
                      count
                        ? formatAmount(count, {
                            maximumFractionDigits: 0,
                            style: 'decimal',
                          })
                        : $t('members.list.nonCompliant.missingMemberships.none')
                  "
                  :to="missingMembershipsCount" />
              </template>
            </i18n-t>
          </div>
        </dl>
      </aside>
    </div>
  </article>
</template>

<script setup lang="ts">
import MembersListCard from './MembersListCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingProgressBar from '@/components/LoadingProgressBar.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import { formatAmount } from '@/helpers/currency';
import { isSilentError } from '@/helpers/errors';
import { searchIn } from '@/helpers/text';
import { ROUTE_NAMES } from '@/router/names';
import {
  MemberListItem,
  getAllMembers,
  getVotingMembers,
  isMemberBalanceInsufficient,
  isMembershipNonCompliant,
} from '@/services/api/members';
import { useNotificationsStore } from '@/store/notifications';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { mdiCheck, mdiChevronDown, mdiMagnify, mdiSort } from '@mdi/js';
import { useQuery } from '@tanstack/vue-query';
import { Head } from '@unhead/vue/components';
import { useInfiniteScroll } from '@vueuse/core';
import dayjs from 'dayjs';
import { isNil } from 'lodash';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

interface Tab {
  key: string;
  hash: string;
  filter?: (m: MemberListItem) => boolean;
  count?: number;
}

interface ListSorter {
  key: string;
  sort: (a: MemberListItem, b: MemberListItem) => number;
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
    key: 'created',
    sort: (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
  },
  {
    key: 'lastSeen',
    sort: (a, b) => (!b.lastSeen ? -1 : !a.lastSeen ? 1 : dayjs(b.lastSeen).diff(a.lastSeen)),
  },
  {
    key: 'debt',
    sort: (a, b) => a.balance - b.balance,
  },
]);

const SLICE_STEP = 16;

const props = defineProps({
  tab: {
    type: String,
    default: null,
  },
  search: {
    type: String,
    default: null,
  },
  sort: {
    type: String,
    default: 'lastSeen',
  },
  slice: {
    type: [String, Number],
    default: SLICE_STEP, // eslint-disable-line vue/valid-define-props
  },
});

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const state = reactive({
  search: null as string | null,
  slice: Number(props.slice) as number,
});

const {
  isSuccess,
  isPending,
  isFetching,
  data: members,
  error,
} = useQuery({
  queryKey: ['members'],
  queryFn: () => getAllMembers(),
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  retry: false,
});

const {
  isPending: isPendingVotingMembers,
  isFetching: isFetchingVotingMembers,
  data: votingMembers,
  error: votingMembersError,
} = useQuery({
  queryKey: ['voting-members'],
  queryFn: () => getVotingMembers(),
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  retry: false,
  enabled: computed(() => props.tab === 'voting'),
});

const filteredList = computed(() => {
  return (members.value || [])
    .filter((member) =>
      searchIn(
        state.search,
        [member.firstName, member.lastName].filter(Boolean).join(' '),
        [member.lastName, member.firstName].filter(Boolean).join(' '),
        member.email,
        member.badgeId,
        member.attending && i18n.t('members.detail.profile.attending'),
        member.location && i18n.t(`members.detail.profile.location.${member.location}`),
        dayjs().isSame(member.lastSeen, 'day')
          ? dayjs(member.lastSeen).fromNow()
          : dayjs(member.lastSeen).calendar(dayjs()),
        isMemberBalanceInsufficient(member) &&
          i18n.t('members.detail.orders.tickets.overconsumed', {
            count: Math.abs(member.balance),
          }),
        isMembershipNonCompliant(member) &&
          (member.lastMembership
            ? i18n.t('members.detail.membership.last', { year: member.lastMembership })
            : i18n.t('members.detail.membership.none')),
      ),
    )
    .sort(ALL_LIST_SORTERS.value.find((s) => s.key === props.sort)?.sort);
});

const ALL_TABS = computed<Tab[]>(() => [
  {
    key: 'all',
    hash: '',
    count: filteredList.value.length,
  },
  {
    key: 'nonCompliant',
    hash: 'non-compliant',
    filter: (member: MemberListItem) =>
      isMemberBalanceInsufficient(member) || isMembershipNonCompliant(member),
    count: filteredList.value.filter(
      (member) => isMemberBalanceInsufficient(member) || isMembershipNonCompliant(member),
    ).length,
  },
  {
    key: 'voting',
    hash: 'voting',
    filter: (member: MemberListItem) =>
      votingMembers.value?.some(({ email }) => member.email === email) || false,
    count: isPendingVotingMembers.value
      ? undefined
      : filteredList.value.filter(
          (member) => votingMembers.value?.some(({ email }) => member.email === email) || false,
        ).length,
  },
  {
    key: 'attending',
    hash: 'attending',
    filter: (member: MemberListItem) => member.attending,
    count: filteredList.value.filter((member) => member.attending).length,
  },
]);

const selectedTab = computed(() => ALL_TABS.value.find((t) => t.hash === props.tab));

const tabFilteredList = computed(() =>
  filteredList.value.filter(selectedTab.value?.filter ?? (() => true)),
);

const slicedList = computed(() => tabFilteredList.value.slice(0, state.slice));

const totalDebt = computed(() =>
  filteredList.value.reduce(
    (acc, member) => acc + (member.balance < 0 ? Math.abs(member.balance) : 0),
    0,
  ),
);

const missingMembershipsCount = computed(() =>
  filteredList.value.reduce((acc, member) => acc + Number(isMembershipNonCompliant(member)), 0),
);

const scrollElement = ref<Document>();
useInfiniteScroll(
  scrollElement,
  () => {
    // load more
    if (tabFilteredList.value.length && state.slice < tabFilteredList.value.length) {
      state.slice += SLICE_STEP;
    }
  },
  { distance: 100 },
);

onMounted(() => (scrollElement.value = document));

watch(
  () => props.search,
  (search) => {
    state.search = search;
  },
  { immediate: true },
);

watch(
  () => props.slice,
  (slice) => {
    if (!isNil(slice)) {
      state.slice = Number(slice);
    }
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
        replace: true,
      });
    }
  },
  { immediate: true },
);

watch(
  () => error.value,
  (error) => {
    if (error && !isSilentError(error)) {
      notificationsStore.addErrorNotification(error, i18n.t('members.list.onFetch.fail'));
    }
  },
);

watch(
  () => votingMembersError.value,
  (error) => {
    if (error && !isSilentError(error)) {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.list.onFetchVotingMembers.fail'),
      );
    }
  },
);

watch(
  () => state.slice,
  () => {
    router.replace({
      ...router.currentRoute.value,
      query: {
        ...router.currentRoute.value.query,
        slice: state.slice,
      },
    });
  },
);

watch(
  () => isSuccess.value,
  (success) => {
    if (success) {
      const top = (router.options.history.state.scroll as { top: number; left: number } | null)
        ?.top;
      if (top && props.slice) {
        nextTick(() => {
          scrollTo({ top, behavior: 'smooth' });
        });
      }
    }
  },
);
</script>
