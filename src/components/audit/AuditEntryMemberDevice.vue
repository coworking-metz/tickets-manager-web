<template>
  <AuditEntryInline :event="event">
    <template #message>
      <i18n-t
        :keypath="
          event.author?._id === event.context.member._id
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

        <template #member>
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
      </i18n-t>
    </template>

    <template #append>
      <pre><code>{{ JSON.stringify(context, null, 2) }}</code></pre>
    </template>
  </AuditEntryInline>
</template>

<script setup lang="ts">
import AuditEntryInline from './AuditEntryInline.vue';
import { ROUTE_NAMES } from '@/router/names';
import { AuditEvent } from '@/services/api/audit';
import { PropType, computed } from 'vue';

const props = defineProps({
  event: {
    type: Object as PropType<AuditEvent>,
    default: null,
  },
});

const context = computed(() => {
  const { memberId, member, ...rest } = props.event.context;
  return rest;
});
</script>
