<template>
  <div class="relative flex w-full flex-row items-start gap-x-1 pt-2 text-left">
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

    <Disclosure
      v-else-if="event"
      as="div"
      v-slot="{ open }"
      class="flex grow flex-col gap-1 overflow-hidden pb-6 text-sm text-slate-500">
      <DisclosureButton
        class="flex flex-row justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-gray-200 active:bg-gray-300">
        <div class="flex flex-col text-start">
          <slot name="message">
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

              <template #member>
                <RouterLink
                  v-if="$route.params.id !== event.context?.member._id"
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
        </div>

        <SvgIcon
          aria-hidden="true"
          class="size-6 shrink-0 self-center"
          :path="open ? mdiChevronUp : mdiChevronDown"
          type="mdi" />
      </DisclosureButton>

      <div v-if="event.context?.comment" class="prose mt-1">
        <blockquote class="whitespace-pre-line text-sm">
          {{ event.context.comment }}
        </blockquote>
      </div>

      <slot name="append">
        <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-out"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0">
          <DisclosurePanel
            class="select-text rounded-md bg-slate-800 px-2 py-1 text-gray-200"
            tag="pre">
            <code class="whitespace-pre-wrap">{{ JSON.stringify(essentialContext, null, 2) }}</code>
          </DisclosurePanel>
        </Transition>
      </slot>
    </Disclosure>
  </div>
</template>

<script setup lang="ts">
import { ROUTE_NAMES } from '@/router/names';
import { AuditAction, AuditEvent } from '@/services/api/audit';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import {
  mdiCalendarStartOutline,
  mdiChevronDown,
  mdiChevronUp,
  mdiDevices,
  mdiHeadCogOutline,
  mdiHelp,
  mdiKeyChainVariant,
  mdiLockOpenOutline,
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

const essentialContext = computed(() => {
  const { memberId, member, ...rest } = props.event.context;
  return rest;
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
      return mdiLockOpenOutline;
    case AuditAction.MEMBER_DEVICE_UPDATE:
      return mdiDevices;
    case AuditAction.MEMBER_CAPABILITIES_UPDATE:
      return mdiHeadCogOutline;
    default:
      return mdiHelp;
  }
});
</script>
