<template>
  <AuditEntryInline :event="event">
    <template #message="{ authorName, memberName }">
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
          <AppLink
            v-if="event.author?._id && route.params.memberId !== event.author._id"
            class="font-medium"
            :to="{
              name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
              params: { memberId: event.author._id },
            }">
            {{ authorName }}
          </AppLink>
          <span
            v-else-if="event.author"
            class="font-medium text-gray-900 dark:text-gray-100"
            :title="event.author.email">
            {{ authorName }}
          </span>
          <VTooltip v-else class="inline">
            <span
              class="inline-flex flex-row items-center gap-1 font-medium text-gray-900 dark:text-gray-100">
              {{ $t('audit.author.unknown.label') }}
              <SvgIcon aria-hidden="true" class="size-4" :path="mdiInformationOutline" type="mdi" />
            </span>
            <template #popper>
              <span class="overflow-hidden whitespace-pre-line text-sm">
                {{ $t('audit.author.unknown.hint') }}
              </span>
            </template>
          </VTooltip>
        </template>

        <template #member v-if="event.context?.member">
          <AppLink
            v-if="route.params.memberId !== event.context.member._id"
            class="font-medium"
            :to="{
              name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
              params: { memberId: event.context.member._id },
            }">
            {{ memberName || $t('audit.author.unknown') }}
          </AppLink>
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
import AppLink from '@/components/AppLink.vue';
import { ROUTE_NAMES } from '@/router/names';
import { AuditEvent } from '@/services/api/audit';
import { mdiInformationOutline } from '@mdi/js';
import { PropType } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
defineProps({
  event: {
    type: Object as PropType<AuditEvent>,
    default: null,
  },
});
</script>
