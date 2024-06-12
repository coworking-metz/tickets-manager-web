<template>
  <div class="relative flex w-full flex-row items-start gap-x-3 pt-2 text-left">
    <div class="flex w-10 shrink-0 flex-col items-center gap-2 self-stretch">
      <slot name="icon">
        <div
          class="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-900">
          <SvgIcon aria-hidden="true" class="size-5 text-gray-500" :path="icon" type="mdi" />
        </div>
      </slot>

      <template v-if="withTimeline">
        <slot name="timeline">
          <span aria-hidden="true" class="h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
        </slot>
      </template>
    </div>

    <div v-if="event" class="flex grow flex-col overflow-hidden pb-6">
      <div class="flex flex-row flex-wrap items-start gap-1">
        <div class="min-w-56 flex-1 pb-0 pt-1.5 text-slate-500 dark:text-slate-400">
          <slot name="message">
            <i18n-t
              class="text-sm"
              :keypath="`audit.action.${event.action}.message`"
              scope="global"
              tag="p">
              <template #author>
                <span class="font-medium text-gray-900 dark:text-gray-100">
                  {{ event.author.name }}
                </span>
              </template>
            </i18n-t>
          </slot>
          <time
            class="whitespace-nowrap text-xs font-light lowercase text-gray-500 dark:text-gray-400"
            :datetime="event.occurred"
            :title="dayjs(event.occurred).format('llll')">
            {{
              dayjs().diff(event.occurred, 'hour') < 2
                ? dayjs(event.occurred).fromNow()
                : dayjs(event.occurred).calendar()
            }}
          </time>
        </div>
      </div>

      <div v-if="event.context.comment" class="prose mt-2 dark:prose-invert">
        <blockquote class="whitespace-pre-line text-sm">
          {{ event.context.comment }}
        </blockquote>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AuditEvent, AuditAction } from '@/services/api/audit';
import { mdiCalendarStartOutline, mdiHelp } from '@mdi/js';
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
    default:
      return mdiHelp;
  }
});
</script>
