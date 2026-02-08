<template>
  <article class="mx-auto flex w-full max-w-7xl grow flex-col px-3 pb-6 pt-12 sm:pt-40">
    <Head>
      <title>{{ $t('audit.list.head.title') }}</title>
    </Head>
    <h1
      class="text-2xl font-bold leading-7 text-gray-900 sm:mx-0 sm:truncate sm:text-3xl sm:tracking-tight dark:text-gray-100">
      {{ $t('audit.list.title') }}
    </h1>
    <p class="mt-1 truncate text-base text-slate-500 dark:text-slate-400">
      {{ $t('audit.list.description') }}
    </p>

    <section class="mt-6 flex flex-row flex-wrap-reverse place-items-start justify-between gap-3">
      <div class="grow sm:max-w-64">
        <AppPeriodField
          v-model="state.period"
          class="min-w-52 shrink grow basis-0"
          hide-details
          :placeholder="$t('audit.list.period.placeholder')" />
      </div>

      <div class="w-full sm:mx-0 sm:max-w-lg">
        <label class="sr-only" for="history-search">{{ $t('audit.list.search.label') }}</label>
        <AppTextField
          id="history-search"
          v-model="state.search"
          clearable
          hide-details
          input-class="pr-0"
          :loading="state.isSearching"
          name="history-search"
          :placeholder="$t('audit.list.search.placeholder')"
          tabindex="1"
          type="search">
          <template #prepend="{ isInvalid }">
            <LoadingSpinner
              v-if="state.isSearching"
              class="pointer-events-none absolute inset-y-0 left-3 z-[11] my-auto size-5 text-gray-400" />
            <SvgIcon
              v-else
              aria-hidden="true"
              :class="[
                'pointer-events-none absolute inset-y-0 left-0 z-[11] ml-3 min-h-10 w-5 text-gray-400',
                isInvalid && 'text-red-500',
              ]"
              :path="mdiMagnify"
              type="mdi" />
          </template>

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
                    $t('audit.list.sort.label', {
                      ...(sort && {
                        suffix: $t(`audit.list.sort.value.${sort}`).toLocaleLowerCase(),
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
                      :key="`history-list-sort-${listSorter.key}`"
                      v-slot="{ active, close }">
                      <RouterLink
                        :class="[
                          active &&
                            'bg-gray-100 text-gray-900 dark:bg-neutral-900 dark:text-gray-100',
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
                        {{ $t(`audit.list.sort.value.${listSorter.key}`) }}
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
    </section>

    <section class="mt-6 flex flex-col items-stretch">
      <ul class="grow overflow-hidden" role="list">
        <template v-if="isPendingHistory">
          <li v-for="index in 10" :key="`loading-event-${index}`">
            <AuditEntry loading />
          </li>
        </template>
        <ErrorState
          v-else-if="historyErrorText"
          class="m-auto"
          :description="historyErrorText"
          :title="$t('audit.list.onFetch.fail')" />
        <EmptyState
          v-else-if="!slicedList.length"
          class="m-auto py-6"
          :description="
            state.search ? $t('audit.list.empty.description', { search: state.search }) : ''
          "
          :title="$t('audit.list.empty.title')" />
        <li v-else v-for="(event, eventIndex) in slicedList" :key="`event-${event._id}`">
          <AuditEntry
            :event="event"
            :loading="isFetchingHistory"
            :with-timeline="eventIndex !== slicedList.length - 1" />
        </li>
      </ul>

      <div
        v-if="slicedList.length"
        ref="endOfList"
        class="p-6 text-center text-gray-500 dark:text-gray-400">
        {{
          state.slice < filteredList.length
            ? $t('audit.list.onEndScrollReached.loading')
            : $t('audit.list.onEndScrollReached.full')
        }}
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AuditEntry from '@/components/audit/AuditEntry.vue';
import AppPeriodField from '@/components/form/AppPeriodField.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import { DATE_FORMAT } from '@/helpers/dates';
import { searchIn } from '@/helpers/text';
import { ROUTE_NAMES } from '@/router/names';
import { AuditEvent, getAllAuditEvents } from '@/services/api/audit';
import { auditEventsQueryKeys, useAppQuery } from '@/services/query';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { mdiCheck, mdiChevronDown, mdiMagnify, mdiSort } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import { useDebounceFn, useElementVisibility } from '@vueuse/core';
import dayjs from 'dayjs';
import { compact, isNil } from 'lodash';
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

interface ListSorter {
  key: string;
  sort: (a: AuditEvent, b: AuditEvent) => number;
}

const ALL_LIST_SORTERS = computed<ListSorter[]>(() => [
  {
    key: 'occurred',
    sort: (a: AuditEvent, b: AuditEvent) =>
      new Date(b.occurred).getTime() - new Date(a.occurred).getTime(),
  },
  {
    key: 'action',
    sort: (a, b) => a.action.toLocaleLowerCase().localeCompare(b.action.toLocaleLowerCase()),
  },
  {
    key: 'author',
    sort: (a, b) =>
      (a.author?.name.toLocaleLowerCase() || '').localeCompare(
        b.author?.name.toLocaleLowerCase() || '',
      ),
  },
]);

const SLICE_STEP = 16;

const props = defineProps({
  search: {
    type: String,
    default: null,
  },
  sort: {
    type: String,
    default: 'occurred',
  },
  slice: {
    type: [String, Number],
    default: SLICE_STEP, // eslint-disable-line vue/valid-define-props
  },
  from: {
    type: String,
    default: null,
  },
  to: {
    type: String,
    default: null,
  },
});

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const now = dayjs();
const state = reactive({
  isSearching: false as boolean,
  search: null as string | null,
  slice: Number(props.slice) as number,
  period: {
    start: now.subtract(7, 'days').format(DATE_FORMAT) as string,
    end: now.format(DATE_FORMAT) as string,
  },
});

const {
  isSuccess: isSuccessHistory,
  isPending: isPendingHistory,
  isFetching: isFetchingHistory,
  data: history,
  errorText: historyErrorText,
} = useAppQuery(
  computed(() => ({
    queryKey: auditEventsQueryKeys.allInPeriod(state.period.start, state.period.end),
    queryFn: () => getAllAuditEvents(state.period.start, state.period.end),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })),
);

const filteredList = computed(() => {
  return (history.value || [])
    .filter((event) =>
      dayjs(event.occurred).isBetween(state.period.start, state.period.end, 'day', '[]'),
    )
    .filter((event) =>
      searchIn(
        props.search,
        event.author && event.author._id === event.context?.member?._id
          ? i18n.t(`audit.action.${event.action}.self`)
          : i18n.t(`audit.action.${event.action}.message`),
        compact([event.context?.member?.firstName, event.context?.member?.lastName]).join(' '),
        JSON.stringify(event),
      ),
    )
    .sort(ALL_LIST_SORTERS.value.find((s) => s.key === props.sort)?.sort);
});

const slicedList = computed(() => filteredList.value.slice(0, state.slice));

const endOfList = ref<HTMLLIElement>();
const endOfListVisible = useElementVisibility(endOfList);

watch(endOfListVisible, (isVisible) => {
  if (isVisible) {
    if (filteredList.value.length && state.slice < filteredList.value.length) {
      state.slice += SLICE_STEP;
    }
  }
});

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
  [() => props.from, () => props.to],
  ([from, to]) => {
    const parsedFrom = dayjs(from);
    if (parsedFrom.isValid()) {
      state.period.start = parsedFrom.format(DATE_FORMAT);
    }

    const parsedTo = dayjs(to);
    if (parsedTo.isValid()) {
      state.period.end = parsedTo.format(DATE_FORMAT);
    }
  },
  { immediate: true },
);

const debounceQueryParams = useDebounceFn(
  (search: string | null, slice: number, period: { start: string; end: string }) => {
    if (router.currentRoute.value?.name === ROUTE_NAMES.HISTORY) {
      router.replace({
        ...router.currentRoute.value,
        query: {
          ...router.currentRoute.value.query,
          search: search || undefined,
          slice: slice || undefined,
          from: period.start || undefined,
          to: period.end || undefined,
        },
      });
      state.isSearching = false;
    }
  },
  300,
);

watch(
  [() => state.search, () => state.slice, () => state.period],
  ([search, slice, period], [_previousSearch, previousSlice]) => {
    if (Number(slice) >= Number(previousSlice)) {
      state.isSearching = true;
      debounceQueryParams(search, slice, period);
    }
  },
);

watch(
  () => isSuccessHistory.value,
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
