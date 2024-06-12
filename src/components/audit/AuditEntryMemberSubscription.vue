<template>
  <AuditEntryInline :event="event">
    <template #message>
      <i18n-t
        class="text-sm"
        :keypath="`audit.action.${event.action}.message`"
        scope="global"
        tag="p">
        <template #author>
          <RouterLink
            class="font-medium text-indigo-600"
            :to="{
              name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
              params: { id: event.author._id || event.author.wpUserId },
            }">
            {{ event.author.name }}
          </RouterLink>
        </template>
        <template #member>
          <RouterLink
            class="font-medium text-indigo-600"
            :to="{
              name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
              params: { id: event.context.member._id },
            }">
            {{
              [event.context.member.firstName, event.context.member.lastName]
                .filter(Boolean)
                .join(' ')
            }}
          </RouterLink>
        </template>

        <template #started>
          <time class="font-medium text-gray-900" :datetime="event.context.startDate">
            {{ dayjs(event.context.startDate).format('ll') }}
          </time>
        </template>

        <template #previouslyStarted>
          <time :datetime="event.context.startDate">
            {{ dayjs(event.context.previousStartDate).format('ll') }}
          </time>
        </template>
      </i18n-t>
    </template>
  </AuditEntryInline>
</template>

<script setup lang="ts">
import AuditEntryInline from './AuditEntryInline.vue';
import { ROUTE_NAMES } from '@/router/names';
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
