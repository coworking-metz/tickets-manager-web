<template>
  <AuditEntryInline :event="event">
    <template #message:started>
      <strong class="font-medium text-gray-900 dark:text-gray-100">
        {{ dayjs(event.context?.membershipStart).format('LL') }}
      </strong>
    </template>

    <template #message:previousStarted>
      {{ dayjs(event.context?.previousMembershipStart).format('LL') }}
    </template>
  </AuditEntryInline>
</template>

<script setup lang="ts">
import AuditEntryInline from './AuditEntryInline.vue';
import { AuditEvent } from '@/services/api/audit';
import dayjs from 'dayjs';
import { PropType } from 'vue';

defineProps({
  event: {
    type: Object as PropType<AuditEvent>,
    default: null,
  },
});
</script>
