<template>
  <AuditEntryInline :event="event">
    <template #message:date>
      <time
        v-if="activityDate"
        class="font-medium text-gray-900 dark:text-gray-100"
        :datetime="activityDate">
        {{ dayjs(activityDate).format('ll') }}
      </time>
    </template>

    <template #message:duration>
      <strong class="font-medium text-gray-900 dark:text-gray-100">
        {{
          $t(
            `audit.action.${event.action}.duration.${ActivityDuration[getActivityDuration(event.context.activity?.overrideValue ?? event.context.activity?.value)]}`,
          )
        }}
      </strong>
    </template>

    <template v-if="event.context.previousActivity" #message:previousDuration>
      {{
        $t(
          `audit.action.${event.action}.duration.${ActivityDuration[getActivityDuration(event.context.previousActivity.overrideValue ?? event.context.previousActivity.value)]}`,
        )
      }}
    </template>
  </AuditEntryInline>
</template>

<script setup lang="ts">
import AuditEntryInline from './AuditEntryInline.vue';
import { ActivityDuration, getActivityDuration } from '@/helpers/activity';
import { AuditEvent } from '@/services/api/audit';
import dayjs from 'dayjs';
import { computed, PropType } from 'vue';

const props = defineProps({
  event: {
    type: Object as PropType<AuditEvent>,
    default: null,
  },
});

const activityDate = computed(
  () => props.event.context.previousActivity?.date ?? props.event.context.activity?.date,
);
</script>
