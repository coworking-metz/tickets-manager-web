<template>
  <AuditEntryInline :event="event">
    <template #message>
      <i18n-t
        :keypath="
          event.author?._id && event.author._id === event.context?.member._id
            ? `audit.action.${event.action}.self`
            : `audit.action.${event.action}.message`
        "
        :plural="event.context?.count ?? event.context?.ticketsOrder?.count"
        scope="global"
        tag="p">
        <template #author>
          <RouterLink
            v-if="event.author?._id && route.params.id !== event.author._id"
            class="font-medium text-indigo-600 hover:underline dark:text-indigo-500"
            :to="{
              name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
              params: { id: event.author._id },
            }">
            {{ authorName }}
          </RouterLink>
          <span
            v-else
            class="font-medium text-gray-900 dark:text-gray-100"
            :title="event.author?.email">
            {{ authorName || $t('audit.author.unknown') }}
          </span>
        </template>

        <template #member v-if="event.context?.member">
          <RouterLink
            v-if="route.params.id !== event.context.member._id"
            class="font-medium text-indigo-600 hover:underline dark:text-indigo-500"
            :to="{
              name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
              params: { id: event.context.member._id },
            }">
            {{ memberName || $t('audit.author.unknown') }}
          </RouterLink>
          <span v-else class="font-medium text-gray-900 dark:text-gray-100">
            {{ memberName || $t('audit.author.unknown') }}
          </span>
        </template>

        <template #count>
          <strong class="font-bold text-gray-900 dark:text-gray-100">
            {{ event.context?.count ?? event.context?.ticketsOrder?.count }}
          </strong>
        </template>

        <template #previousCount>
          {{ event.context?.previousCount }}
        </template>
      </i18n-t>
    </template>
  </AuditEntryInline>
</template>

<script setup lang="ts">
import AuditEntryInline from './AuditEntryInline.vue';
import { ROUTE_NAMES } from '@/router/names';
import { AuditEvent } from '@/services/api/audit';
import { computed, PropType } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const props = defineProps({
  event: {
    type: Object as PropType<AuditEvent>,
    default: null,
  },
});

const authorName = computed(() => props.event.author?.name || props.event.author?.email);
const memberName = computed(
  () =>
    [props.event.context?.member.firstName, props.event.context?.member.lastName]
      .filter(Boolean)
      .join(' ') || props.event.context?.member.email,
);
</script>
