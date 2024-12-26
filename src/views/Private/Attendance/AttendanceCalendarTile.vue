<template>
  <div
    :class="[
      'flex h-14 flex-col items-center overflow-hidden py-2 focus:z-10 max-lg:justify-center lg:h-20 lg:items-start',
      selected
        ? 'bg-amber-500 text-white shadow-inner hover:bg-amber-700 active:bg-amber-800'
        : isCurrentMonth
          ? 'bg-white hover:bg-gray-100'
          : 'bg-gray-50 hover:bg-gray-100',
    ]">
    <CircularProgress
      class="size-8 lg:ml-auto lg:mr-2"
      :progress="(attendance?.data.members.length / MAX_ATTENDANCE) * 100"
      :style="`--mask-color: transparent; --progress-color: ${!selected ? theme.meatBrown : 'currentColor'};`"
      thickness="0.125rem">
      <time :class="['text-sm', selected ? 'font-bold' : 'font-medium']" :datetime="date">
        {{ dayjs(date).format('D') }}
      </time>
    </CircularProgress>

    <i18n-t
      v-if="debtCount"
      class="ml-2 mt-auto inline truncate max-lg:hidden"
      keypath="attendance.calendar.tile.debt"
      :plural="debtCount"
      scope="global"
      tag="span">
      <template #count>
        <span class="inline rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600">
          {{ debtCount }}
        </span>
      </template>
    </i18n-t>
  </div>
</template>

<script setup lang="ts">
import CircularProgress from '@/components/CircularProgress.vue';
import { AttendancePeriod, MAX_ATTENDANCE } from '@/services/api/attendance';
import { theme } from '@/styles/colors';
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
});

const isCurrentMonth = computed(() => {
  return props.selectedMonth && dayjs(props.date).isSame(props.selectedMonth, 'month');
});

const debtCount = computed(() => {
  return props.attendance?.data.members.reduce(
    (acc, member) => acc + member.attendance.tickets.debt.count,
    0,
  );
});
</script>
