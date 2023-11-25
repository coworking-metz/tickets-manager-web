<template>
  <article class="mx-auto flex w-full max-w-6xl grow flex-col pb-6 pt-12 sm:px-6 sm:pt-40 lg:px-8">
    <Head>
      <title>{{ $t('members.list.head.title') }}</title>
    </Head>
    <h1
      class="mx-3 text-2xl font-bold leading-7 text-gray-900 sm:mx-0 sm:truncate sm:text-3xl sm:tracking-tight">
      {{ $t('members.list.title') }}
    </h1>
    <div
      class="mt-6 flex flex-row flex-wrap-reverse place-items-start justify-between gap-3 border-b border-gray-200">
      <nav class="flex flex-row gap-x-8 overflow-x-auto px-3 sm:px-0">
        <router-link
          v-for="listTab in listTabs"
          :key="`list-tab-${listTab.label}`"
          :aria-current="listTab.active ? 'page' : undefined"
          :class="[
            listTab.active
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            'whitespace-nowrap border-b-2 px-1 pb-4 pt-2.5 text-sm font-medium',
          ]"
          replace
          :to="listTab.to">
          {{ listTab.label }}
          <span
            :class="[
              listTab.active ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-900',
              'ml-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
            ]">
            {{ listTab.count }}
          </span>
        </router-link>
      </nav>

      <div class="mx-3 w-full max-w-sm sm:mx-0">
        <label class="sr-only" for="search-member">{{ $t('members.list.search.label') }}</label>
        <div class="flex rounded-md shadow-sm">
          <div class="relative grow focus-within:z-10">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SvgIcon
                aria-hidden="true"
                class="h-5 w-5 text-gray-400"
                :path="mdiMagnify"
                type="mdi" />
            </div>
            <input
              v-model="state.search"
              class="block w-full rounded-none rounded-l-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500"
              name="search-member"
              :placeholder="$t('members.list.search.placeholder')"
              tabindex="1"
              type="text" />
          </div>
          <button
            class="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            tabindex="1"
            type="button">
            <SvgIcon aria-hidden="true" class="h-5 w-5 text-gray-400" :path="mdiSort" type="mdi" />
            <span class="ml-2">{{ $t('action.sort') }}</span>
            <SvgIcon
              aria-hidden="true"
              class="-mr-1.5 ml-2.5 h-5 w-5 text-gray-400"
              :path="mdiChevronDown"
              type="mdi" />
          </button>
        </div>
      </div>
    </div>

    <div
      v-bind="containerProps"
      class="min-h-[320px] grow basis-0 overflow-hidden bg-white shadow sm:rounded-md">
      <ul v-bind="wrapperProps" class="divide-y divide-gray-200" role="list">
        <ul
          v-if="state.isFetching"
          v-bind="wrapperProps"
          class="divide-y divide-gray-200"
          role="list">
          <li v-for="index in 10" :key="`loading-member-card-${index}`">
            <MembersListCard loading />
          </li>
        </ul>
        <li v-else v-for="{ data: member } in list" :key="`member-${member.id}`">
          <RouterLink
            class="block hover:bg-gray-50"
            :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL, params: { id: member.id } }">
            <MembersListCard :member="member" />
          </RouterLink>
        </li>
      </ul>
    </div>
  </article>
</template>

<script setup lang="ts">
import MembersListCard from './MembersListCard.vue';
import { handleSilentError, parseErrorText } from '@/helpers/errors';
import { searchIn } from '@/helpers/text';
import { ROUTE_NAMES } from '@/router/names';
import { MemberListItem, getAllMembers } from '@/services/api/members';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronDown, mdiMagnify, mdiSort } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import { useVirtualList } from '@vueuse/core';
import { computed, onMounted } from 'vue';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouteLocationRaw } from 'vue-router';

interface Tab {
  label: string;
  to: RouteLocationRaw;
  active: boolean;
  filter?: (m: MemberListItem) => boolean;
  count?: number;
}

const props = defineProps({
  tab: {
    type: String,
    required: true,
  },
});

const i18n = useI18n();
const state = reactive({
  isFetching: false,
  members: [] as MemberListItem[],
  search: null as string | null,
  errorMessage: null as string | null,
});

const filteredList = computed(() =>
  state.members.filter((member) =>
    searchIn(state.search, member.firstname, member.lastname, member.email),
  ),
);

const listTabs = computed<Tab[]>(() =>
  [
    {
      labelKey: 'members.list.tabs.all',
      to: { hash: '' },
      active: !props.tab || props.tab === 'all',
    },
    {
      labelKey: 'members.list.tabs.active',
      to: { hash: '#active' },
      active: props.tab === 'active',
      filter: (member: MemberListItem) => member.id > 100000,
    },
    {
      labelKey: 'members.list.tabs.present',
      to: { hash: '#present' },
      active: props.tab === 'present',
      filter: (member: MemberListItem) => member.id < 100000,
    },
  ].map((t) => {
    const count = t.filter ? filteredList.value.filter(t.filter).length : filteredList.value.length;
    return {
      ...t,
      count,
      label: i18n.t(t.labelKey, { count }),
    };
  }),
);

const tabbedFilteredList = computed(() => {
  const selectedTab = listTabs.value.find((t) => t.active);
  if (selectedTab) {
    return filteredList.value.filter(selectedTab.filter || (() => true));
  }
  return filteredList.value;
});

const { list, containerProps, wrapperProps } = useVirtualList(tabbedFilteredList, {
  // Keep `itemHeight` in sync with the item's row.
  itemHeight: 80,
});

const fetchMembers = () => {
  state.isFetching = true;
  getAllMembers()
    .then((members) => {
      state.members = members;
    })
    .catch(handleSilentError)
    .catch(async (error) => {
      state.errorMessage = await parseErrorText(error);
      return Promise.reject(error);
    })
    .finally(() => {
      state.isFetching = false;
    });
};

onMounted(fetchMembers);
</script>
