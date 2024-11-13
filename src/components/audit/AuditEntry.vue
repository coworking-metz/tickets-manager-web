<template>
  <component :is="auditComponent" :event="event" />
</template>

<script setup lang="ts">
import AuditEntryInline from './AuditEntryInline.vue';
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
    case AuditAction.MEMBER_SUBSCRIPTION_UPDATE:
      return AuditEntryMemberSubscription;
    case AuditAction.MEMBER_TICKET_UPDATE:
      return AuditEntryMemberTicket;
    default:
      return AuditEntryInline;
  }
});
</script>
