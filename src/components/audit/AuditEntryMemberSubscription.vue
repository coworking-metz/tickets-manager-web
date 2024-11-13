<template>
  <AuditEntryInline :event="event">
    <template #message>
      <i18n-t
        :keypath="
          event.author?._id === event.context?.member._id
            ? `audit.action.${event.action}.self`
            : `audit.action.${event.action}.message`
        "
        scope="global"
        tag="p">
        <template #author>
          <RouterLink
            v-if="event.author && $route.params.id !== event.author._id"
            class="font-medium text-indigo-600 hover:underline"
            :to="{
              name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
              params: { id: event.author._id || event.author.wpUserId },
            }">
            {{ event.author.name }}
          </RouterLink>
          <span v-else class="font-medium text-gray-900">
            {{ event.author?.name || $t('audit.author.unknown') }}
          </span>
        </template>

        <template #member v-if="event.context?.member">
          <RouterLink
            v-if="$route.params.id !== event.context.member._id"
            class="font-medium text-indigo-600 hover:underline"
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
          <span v-else class="font-medium text-gray-900">
            {{
              [event.context.member.firstName, event.context.member.lastName]
                .filter(Boolean)
                .join(' ')
            }}
          </span>
        </template>

        <template #started>
          <time class="font-medium text-gray-900" :datetime="event.context?.startDate">
            {{ dayjs(event.context?.startDate).format('ll') }}
          </time>
        </template>

        <template #previouslyStarted>
          <time :datetime="event.context?.previousStartDate">
            {{ dayjs(event.context?.previousStartDate).format('ll') }}
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
