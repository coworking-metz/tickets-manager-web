<template>
  <div class="relative flex w-full flex-row items-start gap-x-3 pt-2 text-left">
    <div class="flex w-10 shrink-0 flex-col items-center gap-2 self-stretch">
      <slot name="icon">
        <div
          :class="[
            'z-10 flex size-8 items-center justify-center rounded-full bg-slate-200',
            loading && ' animate-pulse',
          ]">
          <SvgIcon
            v-if="!loading"
            aria-hidden="true"
            class="size-5 text-gray-500"
            :path="icon"
            type="mdi" />
        </div>
      </slot>

      <template v-if="withTimeline">
        <slot name="timeline">
          <span aria-hidden="true" class="w-0.5 shrink grow basis-0 bg-gray-200" />
        </slot>
      </template>
    </div>

    <div v-if="loading" class="flex w-full flex-col items-start pb-6">
      <div
        class="mb-1 mt-2 h-5 w-full animate-pulse rounded-3xl bg-slate-200"
        :style="{
          maxWidth: `${Math.floor(Math.random() * 256) + 128}px`,
        }" />
      <div class="mt-2 h-3 w-20 animate-pulse rounded-3xl bg-slate-200" />
    </div>

    <div
      v-else-if="event"
      class="flex grow flex-col gap-1 overflow-hidden pb-6 pt-1.5 text-sm text-slate-500">
      <slot name="message">
        <i18n-t :keypath="`audit.action.${event.action}.message`" scope="global" tag="p">
          <template #author>
            <RouterLink
              v-if="$route.params.id !== event.author._id"
              class="font-medium text-indigo-600 hover:underline"
              :to="{
                name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
                params: { id: event.author._id || event.author.wpUserId },
              }">
              {{ event.author.name }}
            </RouterLink>
            <span v-else class="font-medium text-gray-900">{{ event.author.name }}</span>
          </template>
        </i18n-t>
      </slot>
      <time
        class="whitespace-nowrap text-xs font-light lowercase text-gray-500"
        :datetime="event.occurred"
        :title="dayjs(event.occurred).format('llll')">
        {{
          dayjs().diff(event.occurred, 'hour') < 2
            ? dayjs(event.occurred).fromNow()
            : dayjs(event.occurred).calendar()
        }}
      </time>

      <div v-if="event.context?.comment" class="prose mt-1">
        <blockquote class="whitespace-pre-line text-sm">
          {{ event.context?.comment }}
        </blockquote>
      </div>

      <slot name="append" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ROUTE_NAMES } from '@/router/names';
import { AuditEvent, AuditAction } from '@/services/api/audit';
import {
  mdiCalendarStartOutline,
  mdiDevices,
  mdiHelp,
  mdiKeyChainVariant,
  mdiLockOpen,
  mdiTicket,
} from '@mdi/js';
import dayjs from 'dayjs';
import { PropType, computed } from 'vue';

const props = defineProps({
  event: {
    type: Object as PropType<AuditEvent>,
    default: null,
  },
  withTimeline: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const icon = computed(() => {
  switch (props.event?.action) {
    case AuditAction.MEMBER_SUBSCRIPTION_UPDATE:
      return mdiCalendarStartOutline;
    case AuditAction.MEMBER_TICKET_UPDATE:
      return mdiTicket;
    case AuditAction.KEYS_ACCESS:
      return mdiKeyChainVariant;
    case AuditAction.UNLOCK_DECK_DOOR:
      return mdiLockOpen;
    case AuditAction.MEMBER_DEVICE_UPDATE:
      return mdiDevices;
    default:
      return mdiHelp;
  }
});
</script>
