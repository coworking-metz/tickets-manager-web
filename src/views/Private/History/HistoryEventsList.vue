<template>
  <article
    class="mx-auto flex w-full max-w-6xl grow flex-col px-3 pb-6 pt-12 sm:px-6 sm:pt-40 lg:px-8">
    <Head>
      <title>{{ $t('audit.list.head.title') }}</title>
    </Head>
    <h1
      class="text-2xl font-bold leading-7 text-gray-900 sm:mx-0 sm:truncate sm:text-3xl sm:tracking-tight">
      {{ $t('audit.list.title') }}
    </h1>
    <p class="mt-1 truncate text-base text-slate-500">{{ $t('audit.list.description') }}</p>
    <div class="mt-6 flex flex-row flex-wrap-reverse place-items-start justify-between gap-3">
      <div class="grow sm:max-w-64">
        <!-- @vue-ignore -->
        <vue-tailwind-datepicker
          id="activity-period"
          v-model="state.period"
          :as-single="width < 640"
          :formatter="{
            date: DATE_FORMAT,
            month: 'MMM',
          }"
          :i18n="i18n.locale.value.substring(0, 2)"
          :options="{
            footer: {
              apply: $t('action.apply'),
              cancel: $t('action.cancel'),
            },
          }"
          :shortcuts="shortcuts"
          v-slot="{}"
          use-range>
          <AppTextField
            class="w-full"
            hide-details
            :model-value="
              state.period.start && state.period.end
                ? $t('audit.list.period.value', {
                    start: dayjs(state.period.start).format('ll'),
                    end: dayjs(state.period.end).format('ll'),
                  })
                : ''
            "
            :placeholder="$t('audit.list.period.placeholder')"
            readonly />
        </vue-tailwind-datepicker>
      </div>

      <div class="w-full sm:mx-0 sm:max-w-lg">
        <label class="sr-only" for="history-search">{{ $t('audit.list.search.label') }}</label>
        <AppTextField
          id="history-search"
          v-model="state.search"
          hide-details
          name="history-search"
          :placeholder="$t('audit.list.search.placeholder')"
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
                  class="absolute right-0 z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-[5%] focus:outline-none">
                  <div class="py-1">
                    <MenuItem
                      v-for="listSorter in ALL_LIST_SORTERS"
                      :key="`history-list-sort-${listSorter.key}`"
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
    </div>

    <div class="flex flex-col-reverse items-stretch gap-3 pt-6 md:flex-row">
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
    </div>
  </article>
</template>

<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import AuditEntry from '@/components/audit/AuditEntry.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import { DATE_FORMAT } from '@/helpers/dates';
import { searchIn } from '@/helpers/text';
import { ROUTE_NAMES } from '@/router/names';
import { AuditEvent, getAllAuditEvents } from '@/services/api/audit';
import { useAppQuery } from '@/services/query';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { mdiCheck, mdiChevronDown, mdiMagnify, mdiSort } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import { useDebounceFn, useInfiniteScroll, useWindowSize } from '@vueuse/core';
import dayjs from 'dayjs';
import { isNil } from 'lodash';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import VueTailwindDatepicker from 'vue-tailwind-datepicker';

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

const { width } = useWindowSize();
const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const now = dayjs();
const state = reactive({
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
    queryKey: ['history', state.period.start, state.period.end],
    queryFn: () => getAllAuditEvents(state.period.start, state.period.end),
    retry: false,
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
        JSON.stringify(event),
      ),
    )
    .sort(ALL_LIST_SORTERS.value.find((s) => s.key === props.sort)?.sort);
});

const slicedList = computed(() => filteredList.value.slice(0, state.slice));

const documentElement = ref<Document>();
useInfiniteScroll(
  documentElement,
  () => {
    // load more
    if (filteredList.value.length && state.slice < filteredList.value.length) {
      state.slice += SLICE_STEP;
    }
  },
  { distance: 100 },
);

onMounted(() => (documentElement.value = document));

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
    }
  },
  300,
);

watch(
  [() => state.search, () => state.slice, () => state.period],
  ([search, slice, period], [_previousSearch, previousSlice]) => {
    if (Number(slice) >= Number(previousSlice)) {
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

const shortcuts = computed(() => () => [
  {
    label: i18n.t('audit.list.period.shortcuts.today'),
    atClick: () => {
      const now = dayjs();
      return [now.startOf('day').format(DATE_FORMAT), now.add(1, 'day').format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('audit.list.period.shortcuts.currentWeek'),
    atClick: () => {
      const now = dayjs();
      return [now.startOf('week').format(DATE_FORMAT), now.endOf('week').format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('audit.list.period.shortcuts.last7days'),
    atClick: () => {
      const now = dayjs();
      return [now.subtract(7, 'day').format(DATE_FORMAT), now.format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('audit.list.period.shortcuts.last30days'),
    atClick: () => {
      const now = dayjs();
      return [now.subtract(30, 'day').format(DATE_FORMAT), now.format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('audit.list.period.shortcuts.sinceFirstDay'),
    atClick: () => [dayjs('01-01-2014').format(DATE_FORMAT)],
  },
]);
</script>
