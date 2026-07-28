<template>
  <AuditEntryInline :event="event">
    <template #message:temperature>
      <span class="font-medium text-gray-900 dark:text-gray-100">
        {{ event.context?.airConditioner?.targetTemperature }}
      </span>
    </template>
  </AuditEntryInline>
</template>

<script setup lang="ts">
import AuditEntryInline from './AuditEntryInline.vue';
import { AuditEvent } from '@/services/api/audit';
import { PropType } from 'vue';

defineProps({
  event: {
    type: Object as PropType<AuditEvent>,
    default: null,
  },
});
</script>
