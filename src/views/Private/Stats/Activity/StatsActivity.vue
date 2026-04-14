<template>
  <article class="flex max-h-[1280px] grow flex-col pb-12 xl:pt-8">
    <div class="mx-auto flex w-full max-w-5xl flex-row flex-wrap place-items-end gap-6 max-sm:px-3">
      <AppPeriodField
        id="incomes-period"
        v-model="state.period"
        class="shrink grow sm:w-auto"
        hide-details
        :label="$t('stats.activity.period.label')"
        :placeholder="$t('stats.activity.period.placeholder')"
        :shortcuts="shortcuts">
        <template #before>
          <component
            :is="previousPeriod ? 'RouterLink' : 'button'"
            :class="[
              'relative z-10 -mr-px mt-1 inline-flex items-center justify-center rounded-l-md border border-gray-300 bg-gray-50 px-3 py-1 font-medium text-gray-700 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:border-neutral-600 dark:bg-zinc-800 dark:text-gray-300 dark:active:bg-zinc-700/80',
              previousPeriod && 'hover:bg-gray-100 dark:hover:bg-zinc-700/50',
            ]"
            :disabled="!previousPeriod"
            :to="{
              ...route,
              query: { ...route.query, from: previousPeriod?.start, to: previousPeriod?.end },
            }">
            <AppIcon class="size-6 text-gray-400" :icon="mdiChevronLeft" />
          </component>
        </template>
        <template #after>
          <component
            :is="nextPeriod ? 'RouterLink' : 'button'"
            :class="[
              'relative -ml-px mt-1 inline-flex items-center justify-center rounded-r-md border border-gray-300 bg-gray-50 px-3 py-1 font-medium text-gray-700 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:border-neutral-600 dark:bg-zinc-800 dark:text-gray-300 dark:active:bg-zinc-700/80',
              nextPeriod && 'hover:bg-gray-100 dark:hover:bg-zinc-700/50',
            ]"
            :disabled="!nextPeriod"
            :to="{
              ...route,
              query: { ...route.query, from: nextPeriod?.start, to: nextPeriod?.end },
            }">
            <AppIcon class="size-6 text-gray-400" :icon="mdiChevronRight" />
          </component>
        </template>
      </AppPeriodField>

      <div class="flex w-auto flex-col gap-1 overflow-hidden">
        <p class="block font-medium text-gray-900 sm:text-sm dark:text-gray-100">
          {{ $t('stats.activity.frequency.label') }}
        </p>
        <ol
          class="flex h-10 flex-row items-center gap-x-4 overflow-x-auto overflow-y-hidden rounded-md border border-gray-300 bg-white px-6 shadow-sm dark:border-neutral-600 dark:bg-neutral-800"
          role="list"
          tabindex="-1">
          <li
            v-for="(freq, index) in ['year', 'month', 'week', 'day']"
            :key="`incomes-${freq}`"
            class="flex flex-row items-center">
            <svg
              v-if="index !== 0"
              class="mr-4 h-full w-6 shrink-0 text-gray-300 dark:text-neutral-600"
              fill="currentColor"
              preserveAspectRatio="none"
              viewBox="0 0 24 44"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
            </svg>
            <router-link
              :aria-current="frequency === freq ? 'page' : undefined"
              :class="[
                frequency === freq
                  ? 'text-indigo-500 hover:text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
                ,
                'text-sm font-medium',
              ]"
              replace
              :to="{ ...route, query: { ...route.query, frequency: freq } }">
              {{ $t(`stats.activity.frequency.value.${freq}`) }}
            </router-link>
          </li>
        </ol>
      </div>

      <fieldset class="flex flex-col">
        <legend class="font-medium text-gray-900 sm:text-sm dark:text-gray-100">
          {{ $t('stats.activity.daily.weekDays.label') }}
        </legend>
        <ul class="mt-1 flex h-10 flex-row flex-wrap items-center gap-2">
          <li
            v-for="weekDayIndex in WEEK_DAYS_INDEXES"
            :key="`day-${weekDayIndex}`"
            class="relative flex">
            <input
              :id="`day-${weekDayIndex}`"
              :checked="includes(state.selectedWeekDays, weekDayIndex)"
              class="hidden"
              :name="`day-${weekDayIndex}`"
              type="checkbox"
              :value="includes(state.selectedWeekDays, weekDayIndex)"
              @input="() => onToggleWeekDay(weekDayIndex)" />
            <label
              :class="[
                'flex size-8 cursor-pointer select-none items-center justify-center rounded-full text-sm font-medium ring-1 ring-inset transition-colors  focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
                includes(state.selectedWeekDays, weekDayIndex)
                  ? 'bg-indigo-500/10 text-indigo-700 ring-indigo-500/20 hover:bg-indigo-500/20 active:bg-indigo-500/30'
                  : 'bg-white text-gray-700 ring-gray-500/20 hover:bg-gray-200 active:bg-gray-300 dark:bg-neutral-800',
              ]"
              :for="`day-${weekDayIndex}`"
              :title="dayjs().set('day', weekDayIndex).format('dddd')">
              {{ capitalize(dayjs().set('day', weekDayIndex).format('dd')).substring(0, 1) }}
            </label>
          </li>
        </ul>
      </fieldset>
    </div>

    <StatsActivityPeriod
      :frequency="frequency"
      :from="state.period.start"
      :to="state.period.end"
      :week-days="state.selectedWeekDays" />
  </article>
</template>

<script lang="ts" setup>
import StatsActivityPeriod from './StatsActivityPeriod.vue';
import AppIcon from '@/components/AppIcon.vue';
import AppPeriodField from '@/components/form/AppPeriodField.vue';
import { DATE_FORMAT, WEEK_DAYS_INDEXES } from '@/helpers/dates';
import { ROUTE_QUERY_ARRAY_SEPARATOR } from '@/router/names';
import { Frequency } from '@/services/api/stats/frequency';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import dayjs from 'dayjs';
import { capitalize, includes } from 'lodash';
import { computed, PropType, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

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
  frequency: {
    type: String as PropType<Frequency>,
    default: 'day',
  },
  date: {
    type: String,
    default: null,
  },
  weekDays: {
    type: Array as PropType<string[]>,
    default: () => WEEK_DAYS_INDEXES,
  },
});

const i18n = useI18n();
const router = useRouter();
const route = useRoute();
const state = reactive({
  period: {
    start: dayjs().subtract(30, 'day').format(DATE_FORMAT) as string,
    end: dayjs().format(DATE_FORMAT) as string,
  },
  selectedWeekDays: WEEK_DAYS_INDEXES as number[],
});

const shortcuts = computed(() => () => [
  {
    label: i18n.t('stats.activity.period.shortcuts.currentWeek'),
    atClick: () => {
      const now = dayjs();
      return [now.startOf('week').format(DATE_FORMAT), now.endOf('week').format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('stats.activity.period.shortcuts.currentMonth'),
    atClick: () => {
      const now = dayjs();
      return [now.startOf('month').format(DATE_FORMAT), now.endOf('month').format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('stats.activity.period.shortcuts.currentYear'),
    atClick: () => {
      const now = dayjs();
      return [now.startOf('year').format(DATE_FORMAT), now.endOf('year').format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('stats.activity.period.shortcuts.last30days'),
    atClick: () => {
      const now = dayjs();
      return [now.subtract(30, 'day').format(DATE_FORMAT), now.format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('stats.activity.period.shortcuts.last6Months'),
    atClick: () => {
      const now = dayjs();
      return [now.subtract(6, 'month').format(DATE_FORMAT), now.format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('stats.activity.period.shortcuts.lastYear'),
    atClick: () => {
      const lastYear = dayjs().subtract(1, 'year');
      return [
        lastYear.startOf('year').format(DATE_FORMAT),
        lastYear.endOf('year').format(DATE_FORMAT),
      ];
    },
  },
  {
    label: i18n.t('stats.activity.period.shortcuts.sinceYearStart'),
    atClick: () => {
      const now = dayjs();
      return [now.startOf('year').format(DATE_FORMAT), now.format(DATE_FORMAT)];
    },
  },
  {
    label: i18n.t('stats.activity.period.shortcuts.sinceFirstDay'),
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
    const nextStart = from.subtract(1, 'day');
    return {
      start: nextStart.subtract(to.diff(from, 'day') || 1, 'day').format(DATE_FORMAT),
      end: nextStart.format(DATE_FORMAT),
    };
  }
  return null;
});

const nextPeriod = computed(() => {
  if (state.period.start && state.period.end) {
    const from = dayjs(state.period.start);
    const to = dayjs(state.period.end);
    const nextStart = to.add(1, 'day');
    return {
      start: nextStart.format(DATE_FORMAT),
      end: nextStart.add(to.diff(from, 'day') || 1, 'day').format(DATE_FORMAT),
    };
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

const onToggleWeekDay = (weekDayIndex: number) => {
  if (state.selectedWeekDays.includes(weekDayIndex)) {
    state.selectedWeekDays = state.selectedWeekDays.filter((day) => day !== weekDayIndex);
  } else {
    state.selectedWeekDays = [...state.selectedWeekDays, weekDayIndex].sort();
  }
};

watch(
  () => props.weekDays,
  (weekdays) => {
    if (weekdays?.length) {
      state.selectedWeekDays = weekdays.map((i) => Number(i));
    }
  },
  { immediate: true },
);

watch(
  () => state.selectedWeekDays,
  (selectedWeekDays) => {
    router.replace({
      query: {
        ...router.currentRoute.value.query,
        weekDays: selectedWeekDays.join(ROUTE_QUERY_ARRAY_SEPARATOR),
      },
    });
  },
);
</script>
