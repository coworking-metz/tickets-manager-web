<template>
  <MemberCard :loading="loading" :member="member">
    <div class="mt-3 flex shrink flex-row flex-wrap items-center gap-1">
      <span
        class="shrink truncate whitespace-nowrap rounded-full px-2 py-0.5 text-center text-xs leading-6 ring-1 ring-inset dark:text-gray-100"
        :style="`color:${statsColors.activity}; background-color: ${statsColors.activity}44; --tw-ring-color: ${statsColors.activity}88;`">
        {{ $t(`attendance.detail.activity.value.${ActivityDuration[activityDuration]}`) }}
      </span>
      <span
        v-if="member.attendance.tickets.debt.count"
        class="shrink basis-0 whitespace-nowrap rounded-full bg-red-500/10 px-2 py-0.5 text-center text-xs leading-6 text-red-400 ring-1 ring-inset ring-red-500/20">
        {{
          $t('members.detail.orders.tickets.overconsumed', {
            count: member.attendance.tickets.debt.count,
          })
        }}
      </span>
    </div>
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </MemberCard>
</template>

<script setup lang="ts">
import { useStatsColors } from '../Stats/statsColors';
import MemberCard from '@/components/MemberCard.vue';
import { AttendingMember, computeActivityFromAttendance } from '@/services/api/attendance';
import { PropType, computed } from 'vue';

enum ActivityDuration {
  'NONE' = 0,
  'HALF' = 0.5,
  'FULL' = 1,
}

const statsColors = useStatsColors();
const props = defineProps({
  member: {
    type: Object as PropType<AttendingMember>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const activityDuration = computed<number>(() => {
  return computeActivityFromAttendance(props.member.attendance);
});
</script>
