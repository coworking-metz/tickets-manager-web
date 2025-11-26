<template>
  <article
    class="mx-auto flex w-full max-w-7xl grow flex-col items-stretch gap-6 lg:flex-row lg:items-start">
    <Head>
      <title>{{ $t('attendance.head.title') }}</title>
    </Head>

    <section class="flex max-w-xl shrink-0 grow flex-col pb-6 pt-12 lg:sticky lg:top-40 lg:py-0">
      <header class="flex flex-col items-start max-sm:px-3">
        <h1
          class="text-2xl font-bold leading-7 text-gray-900 sm:mx-0 sm:truncate sm:text-3xl sm:tracking-tight dark:text-gray-100">
          {{ $t('attendance.title') }}
        </h1>
        <p class="mt-1 truncate text-base text-slate-500 dark:text-slate-400">
          {{ $t('attendance.description') }}
        </p>

        <div class="my-4 flex w-full flex-row items-center justify-between">
          <div
            class="flex h-10 items-stretch overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm md:items-stretch dark:border-neutral-700 dark:bg-neutral-800">
            <RouterLink
              class="flex items-center justify-center py-2 pl-3 pr-4 text-gray-400 transition-colors hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-900"
              :to="{
                ...currentRoute,
                query: {
                  ...currentRoute.query,
                  month: dayjs(state.selectedMonth).subtract(1, 'month').format('YYYY-MM'),
                },
              }">
              <span class="sr-only">{{ $t('attendance.navigation.previousMonth') }}</span>
              <SvgIcon
                aria-hidden="true"
                class="size-6 text-gray-400"
                :path="mdiChevronLeft"
                type="mdi" />
            </RouterLink>
            <time
              v-if="state.selectedMonth"
              class="flex flex-row items-center px-3.5 text-sm font-medium text-gray-900 focus:relative dark:bg-neutral-800 dark:text-gray-100"
              :datetime="state.selectedMonth">
              {{ capitalize(dayjs(state.selectedMonth).format('MMM YYYY')) }}
            </time>
            <RouterLink
              class="flex items-center justify-center py-2 pl-4 pr-3 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-neutral-900"
              :to="{
                ...currentRoute,
                query: {
                  ...currentRoute.query,
                  month: dayjs(state.selectedMonth).add(1, 'month').format('YYYY-MM'),
                },
              }">
              <span class="sr-only">{{ $t('attendance.navigation.nextMonth') }}</span>
              <SvgIcon
                aria-hidden="true"
                class="size-6 text-gray-400"
                :path="mdiChevronRight"
                type="mdi" />
            </RouterLink>
          </div>

          <AppButtonPlain
            class="min-h-10 dark:focus:ring-offset-stone-900"
            color="neutral"
            :to="{
              params: {
                ...currentRoute.params,
                date: dayjs().format('YYYY-MM-DD'),
              },
              query: {
                ...currentRoute.query,
                month: dayjs().format('YYYY-MM'),
              },
            }">
            {{ $t('attendance.navigation.today') }}
          </AppButtonPlain>
        </div>
      </header>

      <div class="relative border border-gray-200 dark:border-stone-700">
        <LoadingProgressBar v-if="isFetching" class="absolute top-0 h-[2px] w-full" />
        <div
          v-if="calendarPeriod"
          class="grid grid-cols-7 divide-x divide-gray-300 border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none dark:divide-stone-600 dark:border-stone-600 dark:text-gray-300">
          <div
            v-for="weekIndex in 7"
            :key="`weekday-${weekIndex}`"
            class="bg-white py-2 dark:bg-neutral-800">
            {{
              dayjs(calendarPeriod.start)
                .add(weekIndex - 1, 'day')
                .format('ddd')
            }}
          </div>
        </div>

        <div class="flex text-xs leading-6 text-gray-700">
          <div class="isolate grid w-full grid-cols-7 grid-rows-5 gap-px">
            <RouterLink
              v-for="day in calendar"
              :key="day.date"
              :to="{
                params: {
                  date: `${day.date}`,
                },
                query: currentRoute.query,
              }">
              <AttendanceCalendarTile
                :attendance="day.attendance"
                :date="day.date"
                :in-current-month="
                  Boolean(
                    state.selectedMonth && dayjs(day.date).isSame(state.selectedMonth, 'month'),
                  )
                "
                :selected="day.isSelected" />
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <aside class="relative min-w-[320px] shrink grow basis-0 self-stretch">
      <AttendanceDetail
        :attendance="state.selectedAttendance"
        :date="date"
        :loading="isFetching"
        :search="search"
        :sort="sort" />
    </aside>
  </article>
</template>

<script lang="ts" setup>
import AttendanceCalendarTile from './AttendanceCalendarTile.vue';
import AttendanceDetail from './AttendanceDetail.vue';
import LoadingProgressBar from '@/components/LoadingProgressBar.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import { isSilentError } from '@/helpers/errors';
import { AttendancePeriod, getAttendancePerPeriod } from '@/services/api/attendance';
import { statsQueryKeys, useAppQuery } from '@/services/query';
import { useNotificationsStore } from '@/store/notifications';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import dayjs from 'dayjs';
import { capitalize } from 'lodash';
import { computed, onMounted, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const props = defineProps({
  month: {
    type: String,
    default: null,
  },
  date: {
    type: String,
    default: null,
  },
  search: {
    type: String,
    default: null,
  },
  sort: {
    type: String,
    default: 'activity',
  },
});

const currentRoute = useRoute();
const notificationsStore = useNotificationsStore();
const i18n = useI18n();
const state = reactive({
  selectedMonth: null as string | null,
  selectedAttendance: null as AttendancePeriod<'day'> | null,
});

const calendarPeriod = computed(() => {
  if (!state.selectedMonth) {
    return null;
  }
  const startOfMonth = dayjs(state.selectedMonth).startOf('month');
  const start = startOfMonth.day() === 0 ? startOfMonth.day(-6) : startOfMonth.day(1);
  const end = start.add(5, 'weeks').day(7);

  return {
    start: start.format().substring(0, 10),
    end: end.format().substring(0, 10),
  };
});

const {
  isFetching,
  data: attendance,
  error: attendanceError,
} = useAppQuery(
  computed(() => ({
    queryKey: statsQueryKeys.attendanceInPeriod(
      'day',
      calendarPeriod.value?.start as string,
      calendarPeriod.value?.end as string,
    ),
    queryFn: () =>
      getAttendancePerPeriod(
        'day',
        calendarPeriod.value?.start,
        calendarPeriod.value?.end,
      ) as unknown as AttendancePeriod<'day'>[],
    staleTime: 300_000,
    enabled: !!calendarPeriod.value?.start && !!calendarPeriod.value?.end,
  })),
);

const calendar = computed(() => {
  return Array.from({
    length: dayjs(calendarPeriod.value?.end).diff(calendarPeriod.value?.start, 'days') + 1,
  }).map((_, index) => {
    const date = dayjs(calendarPeriod.value?.start).add(index, 'day').format().substring(0, 10);
    const attendanceForThisDate = attendance.value?.find((day) => day.date === date);

    return {
      date,
      isSelected: date === props.date,
      attendance: attendanceForThisDate,
    };
  });
});

watch(
  [() => props.date, () => attendance.value],
  ([selectedDate, attendancePeriod]) => {
    if (selectedDate && dayjs(selectedDate, 'YYYY-MM-DD', true).isValid()) {
      const attendanceFound = attendancePeriod?.find(
        (day) => day.date === dayjs(selectedDate).format().substring(0, 10),
      );
      if (attendanceFound) {
        state.selectedAttendance = attendanceFound;
      }
    } else {
      state.selectedAttendance = null;
    }
  },
  { immediate: true },
);

watch(
  () => attendanceError.value,
  (error) => {
    if (error && !isSilentError(error)) {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('attendance.onFetch.fail', {
          start: dayjs(calendarPeriod.value?.start).format('L'),
          end: dayjs(calendarPeriod.value?.end).format('L'),
        }),
      );
    }
  },
);

onMounted(() => {
  if (props.month && dayjs(props.month, 'YYYY-MM', true).isValid()) {
    state.selectedMonth = props.month;
  } else if (props.date) {
    state.selectedMonth = dayjs(props.date).format('YYYY-MM');
  } else {
    state.selectedMonth = dayjs().format('YYYY-MM');
  }
});

watch(
  () => props.month,
  (month) => {
    if (month && dayjs(month, 'YYYY-MM', true).isValid()) {
      state.selectedMonth = month;
    }
  },
);
</script>
