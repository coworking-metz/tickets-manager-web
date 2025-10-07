<template>
  <MemberCard :loading="loading" :member="member">
    <div class="mt-3 flex shrink flex-row flex-wrap items-center gap-1">
      <span
        class="shrink basis-0 whitespace-nowrap rounded-full bg-neutral-500/10 px-2 py-0.5 text-center text-xs leading-6 text-neutral-500 ring-1 ring-inset ring-neutral-500/20">
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
import MemberCard from '@/components/MemberCard.vue';
import { AttendingMember } from '@/services/api/attendance';
import { PropType, computed } from 'vue';

enum ActivityDuration {
  'NONE' = 0,
  'HALF' = 0.5,
  'FULL' = 1,
}

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
  return (
    props.member.attendance.subscriptions.count ||
    props.member.attendance.tickets.count ||
    props.member.attendance.tickets.debt.count
  );
});
</script>
