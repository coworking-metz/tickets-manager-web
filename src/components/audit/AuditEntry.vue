<template>
  <component :is="auditComponent" :event="event" />
</template>

<script setup lang="ts">
import AuditEntryAirConditioner from './AuditEntryAirConditioner.vue';
import AuditEntryInline from './AuditEntryInline.vue';
import AuditEntryMemberActivity from './AuditEntryMemberActivity.vue';
import AuditEntryMemberMembership from './AuditEntryMemberMembership.vue';
import AuditEntryMemberSubscription from './AuditEntryMemberSubscription.vue';
import AuditEntryMemberTicket from './AuditEntryMemberTicket.vue';
import { AuditAction, AuditEvent } from '@/services/api/audit';
import { PropType, computed } from 'vue';

const props = defineProps({
  event: {
    type: Object as PropType<AuditEvent>,
    default: null,
  },
});

const auditComponent = computed(() => {
  switch (props.event?.action) {
    case AuditAction.MEMBER_ACTIVITY_ADD:
    case AuditAction.MEMBER_ACTIVITY_UPDATE:
      return AuditEntryMemberActivity;
    case AuditAction.MEMBER_SUBSCRIPTION_ADD:
    case AuditAction.MEMBER_SUBSCRIPTION_UPDATE:
    case AuditAction.MEMBER_SUBSCRIPTION_REMOVE:
      return AuditEntryMemberSubscription;
    case AuditAction.MEMBER_TICKET_ADD:
    case AuditAction.MEMBER_TICKET_UPDATE:
    case AuditAction.MEMBER_TICKET_REMOVE:
      return AuditEntryMemberTicket;
    case AuditAction.MEMBER_MEMBERSHIP_ADD:
    case AuditAction.MEMBER_MEMBERSHIP_UPDATE:
    case AuditAction.MEMBER_MEMBERSHIP_REMOVE:
      return AuditEntryMemberMembership;
    case AuditAction.AIR_CONDITIONER_TURN_ON:
    case AuditAction.AIR_CONDITIONER_TURN_OFF:
    case AuditAction.AIR_CONDITIONER_SET_TARGET_TEMPERATURE:
      return AuditEntryAirConditioner;
    default:
      return AuditEntryInline;
  }
});
</script>
