<template>
  <AuditEntryInline :event="event">
    <template #message:started>
      <time
        class="font-medium text-gray-900 dark:text-gray-100"
        :datetime="event.context?.startDate">
        {{ dayjs(event.context?.startDate).format('ll') }}
      </time>
    </template>

    <template #message:previouslyStarted>
      <time :datetime="event.context?.previousStartDate">
        {{ dayjs(event.context?.previousStartDate).format('ll') }}
      </time>
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
