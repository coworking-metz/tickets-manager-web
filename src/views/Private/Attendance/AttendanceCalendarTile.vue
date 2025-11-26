<template>
  <div
    :class="[
      'group flex h-14 flex-col items-center justify-center overflow-hidden py-2 text-gray-500 transition-colors focus:z-10 lg:h-20 dark:text-gray-400',
      selected
        ? 'bg-amber-500 !text-white shadow-inner hover:bg-amber-700 active:bg-amber-800 dark:bg-amber-800 dark:hover:bg-amber-700 dark:active:bg-amber-600'
        : inCurrentMonth
          ? 'bg-white hover:bg-gray-200 active:bg-gray-300 dark:bg-neutral-800  dark:hover:bg-neutral-600 dark:active:bg-neutral-500'
          : 'bg-gray-100/80 hover:bg-gray-200 active:bg-gray-300 dark:bg-neutral-900 dark:hover:bg-neutral-600 dark:active:bg-neutral-500',
    ]">
    <CircularProgress
      class="relative flex size-10 items-center justify-center"
      :progress="(attendance?.data.members.length / MAX_ATTENDANCE) * 100"
      :style="`--mask-color: transparent; --progress-color: ${!selected ? statsColors.member : 'currentColor'};`"
      thickness="0.25rem">
      <time :class="['text-sm', selected ? 'font-bold' : 'font-medium']" :datetime="date">
        {{ dayjs(date).format('D') }}
      </time>
      <div class="absolute inset-0 flex items-center justify-center">
        <CircularProgress
          :class="['size-7']"
          :progress="(daysCount / MAX_ATTENDANCE) * 100"
          :style="`--mask-color: transparent; --progress-color: ${!selected ? statsColors.activity : 'currentColor'};;`"
          thickness="0.25rem" />
      </div>
    </CircularProgress>
  </div>
</template>

<script setup lang="ts">
import CircularProgress from '@/components/CircularProgress.vue';
import { AttendancePeriod, MAX_ATTENDANCE } from '@/services/api/attendance';
import { theme } from '@/styles/colors';
import { useStatsColors } from '@/views/Private/Stats/statsColors';
import dayjs from 'dayjs';
import { PropType, computed } from 'vue';

const props = defineProps({
  date: {
    type: String,
    default: null,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  selectedMonth: {
    type: String,
    default: null,
  },
  attendance: {
    type: Object as PropType<AttendancePeriod<'day'>>,
    default: null,
  },
  inCurrentMonth: {
    type: Boolean,
    default: false,
  },
});

const statsColors = useStatsColors();

const daysCount = computed(() => {
  return props.attendance?.data.members.reduce(
    (acc, member) => acc + member.attendance.tickets.count + member.attendance.subscriptions.count,
    0,
  );
});
</script>
