<template>
  <article class="flex max-h-[1280px] grow flex-col pb-12 xl:pt-12">
    <div
      class="mx-auto mt-6 flex w-full max-w-5xl flex-row flex-wrap place-items-end gap-y-6 sm:px-3">
      <div class="mx-3">
        <!-- @vue-ignore -->
        <vue-tailwind-datepicker
          id="incomes-period"
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
            :label="$t('stats.incomes.period.label')"
            :model-value="
              state.period.start && state.period.end
                ? $t('stats.incomes.period.value', {
                    start: dayjs(state.period.start).format('ll'),
                    end: dayjs(state.period.end).format('ll'),
                  })
                : ''
            "
            :placeholder="$t('stats.incomes.period.placeholder')"
            readonly>
            <template #before>
              <component
                :is="previousPeriod ? 'RouterLink' : 'button'"
                :class="[
                  'relative -mr-px inline-flex items-center justify-center rounded-l-md border border-gray-300 bg-gray-50 px-3 py-1 font-medium text-gray-700 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm',
                  previousPeriod && 'hover:bg-gray-100',
                ]"
                :disabled="!previousPeriod"
                :to="{
                  ...$route,
                  query: { ...$route.query, from: previousPeriod?.start, to: previousPeriod?.end },
                }">
                <SvgIcon
                  aria-hidden="true"
                  class="h-6 w-6 text-gray-400"
                  :path="mdiChevronLeft"
                  type="mdi" />
              </component>
            </template>
            <template #after>
              <component
                :is="nextPeriod ? 'RouterLink' : 'button'"
                :class="[
                  'relative -ml-px inline-flex items-center justify-center rounded-r-md border border-gray-300 bg-gray-50 px-3 py-1 font-medium text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm',
                  nextPeriod && 'hover:bg-gray-100',
                ]"
                :disabled="!nextPeriod"
                :to="{
                  ...$route,
                  query: { ...$route.query, from: nextPeriod?.start, to: nextPeriod?.end },
                }">
                <SvgIcon
                  aria-hidden="true"
                  class="h-6 w-6 text-gray-400"
                  :path="mdiChevronRight"
                  type="mdi" />
              </component>
            </template>
          </AppTextField>
        </vue-tailwind-datepicker>
      </div>

      <div class="flex flex-col gap-1">
        <p class="mx-3 block font-medium text-gray-900 sm:text-sm">
          {{ $t('stats.incomes.frequency.label') }}
        </p>
        <nav aria-label="Breadcrumb" class="flex overflow-x-auto px-3 max-sm:w-screen">
          <ol
            class="flex h-10 flex-row gap-x-4 rounded-md border border-gray-300 bg-white px-6 shadow-sm"
            role="list">
            <li
              v-for="(frequency, index) in frequencies"
              :key="`incomes-${frequency.label}`"
              class="flex">
              <div class="flex items-center">
                <svg
                  v-if="index !== 0"
                  aria-hidden="true"
                  class="mr-4 h-full w-6 shrink-0 text-gray-200"
                  fill="currentColor"
                  preserveAspectRatio="none"
                  viewBox="0 0 24 44"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
                </svg>
                <router-link
                  :aria-current="route.name === frequency.to.name ? 'page' : undefined"
                  :class="[
                    route.name === frequency.to.name
                      ? 'text-indigo-500 hover:text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700',
                    ,
                    'text-sm font-medium',
                  ]"
                  replace
                  :to="{ ...$route, ...frequency.to }">
                  {{ frequency.label }}
                </router-link>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <RouterLink
        :class="[
          'mx-3 flex h-10 items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-3 py-1 font-medium transition-colors focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
          net ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'text-gray-700 hover:bg-gray-100',
        ]"
        :to="{
          ...$route,
          query: { ...$route.query, net: `${!net}` },
        }">
        <SvgIcon
          aria-hidden="true"
          :class="['h-6 w-6', net ? 'text-current' : 'text-gray-400']"
          :path="mdiChartWaterfall"
          type="mdi" />

        <span class="ml-2 sm:text-sm">
          {{ $t('stats.incomes.mode.waterfall.label') }}
        </span>
      </RouterLink>
    </div>

    <RouterViewSlideTransition :from="state.period.start" :net="net" :to="state.period.end" />
  </article>
</template>

<script lang="ts" setup>
import AppTextField from '@/components/form/AppTextField.vue';
import RouterViewSlideTransition from '@/components/layout/RouterViewSlideTransition.vue';
import { DATE_FORMAT } from '@/helpers/dates';
import { ROUTE_NAMES } from '@/router/names';
import { mdiChartWaterfall, mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { useWindowSize } from '@vueuse/core';
import dayjs from 'dayjs';
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import VueTailwindDatepicker from 'vue-tailwind-datepicker';

const props = defineProps({
  from: {
    type: String,
    default: null,
  },
  to: {
    type: String,
    default: null,
  },
  net: {
    type: Boolean,
    default: false,
  },
});

const { width } = useWindowSize();
const i18n = useI18n();
const router = useRouter();
const route = useRoute();
const state = reactive({
  period: { start: '' as string, end: '' as string },
});

const frequencies = computed(() => [
  {
    label: i18n.t('stats.incomes.frequency.value.yearly'),
    to: { name: ROUTE_NAMES.STATS.INCOMES.YEARLY },
  },
  {
    label: i18n.t('stats.incomes.frequency.value.monthly'),
    to: { name: ROUTE_NAMES.STATS.INCOMES.MONTHLY },
  },
  {
    label: i18n.t('stats.incomes.frequency.value.weekly'),
    to: { name: ROUTE_NAMES.STATS.INCOMES.WEEKLY },
  },
  {
    label: i18n.t('stats.incomes.frequency.value.daily'),
    to: { name: ROUTE_NAMES.STATS.INCOMES.DAILY },
  },
]);

const shortcuts = computed(() => () => [
  {
    label: i18n.t('stats.incomes.period.shortcuts.currentWeek'),
    atClick: () => {
      const now = dayjs();
      return [now.startOf('week').format(DATE_FORMAT), now.endOf('week').format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('stats.incomes.period.shortcuts.currentMonth'),
    atClick: () => {
      const now = dayjs();
      return [now.startOf('month').format(DATE_FORMAT), now.endOf('month').format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('stats.incomes.period.shortcuts.currentYear'),
    atClick: () => {
      const now = dayjs();
      return [now.startOf('year').format(DATE_FORMAT), now.endOf('year').format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('stats.incomes.period.shortcuts.last30days'),
    atClick: () => {
      const now = dayjs();
      return [now.subtract(30, 'day').format(DATE_FORMAT), now.format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('stats.incomes.period.shortcuts.last6Months'),
    atClick: () => {
      const now = dayjs();
      return [now.subtract(6, 'month').format(DATE_FORMAT), now.format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('stats.incomes.period.shortcuts.lastYear'),
    atClick: () => {
      const lastYear = dayjs().subtract(1, 'year');
      return [
        lastYear.startOf('year').format(DATE_FORMAT),
        lastYear.endOf('year').format(DATE_FORMAT),
      ];
    },
  },
  {
    label: i18n.t('stats.incomes.period.shortcuts.sinceYearStart'),
    atClick: () => {
      const now = dayjs();
      return [now.startOf('year').format(DATE_FORMAT), now.format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('stats.incomes.period.shortcuts.sinceFirstDay'),
    atClick: () => {
      const now = dayjs();
      return [now.year(2014).startOf('year').format(DATE_FORMAT), now.format(DATE_FORMAT)];
    },
  },
]);

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

const previousPeriod = computed(() => {
  if (state.period.start && state.period.end) {
    const from = dayjs(state.period.start);
    const to = dayjs(state.period.end);
    switch (route.name) {
      case ROUTE_NAMES.STATS.INCOMES.YEARLY:
        return {
          start: from.subtract(to.diff(from, 'year') || 1, 'year').format(DATE_FORMAT),
          end: from.format(DATE_FORMAT),
        };
      case ROUTE_NAMES.STATS.INCOMES.MONTHLY:
        return {
          start: from.subtract(to.diff(from, 'month') || 1, 'month').format(DATE_FORMAT),
          end: from.format(DATE_FORMAT),
        };
      case ROUTE_NAMES.STATS.INCOMES.WEEKLY:
        return {
          start: from.subtract(to.diff(from, 'week') || 1, 'week').format(DATE_FORMAT),
          end: from.format(DATE_FORMAT),
        };
      default:
        return {
          start: from.subtract(to.diff(from, 'day') || 1, 'day').format(DATE_FORMAT),
          end: from.format(DATE_FORMAT),
        };
    }
  }
  return null;
});

const nextPeriod = computed(() => {
  if (state.period.start && state.period.end) {
    const from = dayjs(state.period.start);
    const to = dayjs(state.period.end);
    switch (route.name) {
      case ROUTE_NAMES.STATS.INCOMES.YEARLY:
        return {
          start: to.format(DATE_FORMAT),
          end: to.add(to.diff(from, 'year') || 1, 'year').format(DATE_FORMAT),
        };
      case ROUTE_NAMES.STATS.INCOMES.MONTHLY:
        return {
          start: to.format(DATE_FORMAT),
          end: to.add(to.diff(from, 'month') || 1, 'month').format(DATE_FORMAT),
        };
      case ROUTE_NAMES.STATS.INCOMES.WEEKLY:
        return {
          start: to.format(DATE_FORMAT),
          end: to.add(to.diff(from, 'week') || 1, 'week').format(DATE_FORMAT),
        };
      default:
        return {
          start: to.format(DATE_FORMAT),
          end: to.add(to.diff(from, 'day') || 1, 'day').format(DATE_FORMAT),
        };
    }
  }
  return null;
});

watch(
  () => state.period,
  (period) => {
    const from = dayjs(period.start);
    const to = dayjs(period.end);
    router.replace({
      query: {
        ...router.currentRoute.value.query,
        ...(from.isValid() ? { from: from.format(DATE_FORMAT) } : null),
        ...(to.isValid() ? { to: to.format(DATE_FORMAT) } : null),
      },
    });
  },
  { immediate: true },
);
</script>
