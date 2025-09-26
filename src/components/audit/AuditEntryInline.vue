<template>
  <div class="relative flex w-full flex-row items-start gap-x-1 pt-2 text-left">
    <div class="flex w-10 shrink-0 flex-col items-center gap-2 self-stretch">
      <slot name="icon">
        <div
          :class="[
            'z-10 flex size-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700/50',
            loading && 'animate-pulse',
          ]">
          <SvgIcon
            v-if="!loading"
            aria-hidden="true"
            class="size-5 text-gray-500 dark:text-gray-400"
            :path="icon"
            type="mdi" />
        </div>
      </slot>

      <template v-if="withTimeline">
        <slot name="timeline">
          <span
            aria-hidden="true"
            class="w-0.5 shrink grow basis-0 bg-gray-200 dark:bg-stone-700" />
        </slot>
      </template>
    </div>

    <div v-if="loading" class="flex w-full flex-col items-start pb-6">
      <div
        class="mb-1 mt-2 h-5 w-full animate-pulse rounded-3xl bg-slate-200 dark:bg-gray-700/50"
        :style="{
          maxWidth: `${Math.floor(Math.random() * 256) + 128}px`,
        }" />
      <div class="mt-2 h-3 w-20 animate-pulse rounded-3xl bg-slate-200 dark:bg-gray-700/50" />
    </div>

    <Disclosure
      v-else-if="event"
      as="div"
      v-slot="{ open }"
      class="flex grow flex-col gap-1 overflow-hidden pb-6 text-sm text-slate-500 dark:text-slate-400">
      <DisclosureButton
        :class="[
          'flex flex-row justify-between rounded-md px-2 py-1.5',
          !!essentialContext &&
            'transition-colors hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-stone-700/40 dark:active:bg-stone-600/50',
        ]"
        :disabled="!essentialContext">
        <div class="flex flex-col text-start">
          <slot name="message">
            <i18n-t
              :keypath="
                event.author?._id && event.author._id === event.context?.member?._id
                  ? `audit.action.${event.action}.self`
                  : `audit.action.${event.action}.message`
              "
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
                  {{ event.author.name }}
                </RouterLink>
                <span
                  v-else
                  class="font-medium text-gray-900 dark:text-gray-100"
                  :title="event.author?.email">
                  {{ event.author?.name || $t('audit.author.unknown') }}
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
                  {{
                    [event.context.member.firstName, event.context.member.lastName]
                      .filter(Boolean)
                      .join(' ')
                  }}
                </RouterLink>
                <span v-else class="font-medium text-gray-900 dark:text-gray-100">
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
            class="whitespace-nowrap text-xs font-light lowercase text-gray-500 dark:text-gray-400"
            :datetime="event.occurred"
            :title="dayjs(event.occurred).format('llll')">
            {{
              dayjs().diff(event.occurred, 'hour') < 1
                ? dayjs(event.occurred).fromNow()
                : dayjs(event.occurred).calendar()
            }}
          </time>
        </div>

        <SvgIcon
          v-if="!!essentialContext"
          aria-hidden="true"
          class="size-6 shrink-0 self-center"
          :path="open ? mdiChevronUp : mdiChevronDown"
          type="mdi" />
      </DisclosureButton>

      <div v-if="event.context?.comment" class="prose mt-1">
        <blockquote class="whitespace-pre-line text-sm text-gray-900 dark:text-gray-100">
          {{ event.context.comment }}
        </blockquote>
      </div>

      <slot name="append">
        <Transition
          v-if="!!essentialContext"
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-out"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0">
          <DisclosurePanel
            class="mt-1 select-text rounded-md bg-slate-800 px-2 py-1 text-gray-200 dark:bg-stone-950"
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
  mdiCalendarEditOutline,
  mdiCalendarPlusOutline,
  mdiCalendarRangeOutline,
  mdiCardAccountDetailsOutline,
  mdiChevronDown,
  mdiChevronUp,
  mdiCreditCardOutline,
  mdiDevices,
  mdiDoorbell,
  mdiGateOpen,
  mdiHeadCogOutline,
  mdiHelp,
  mdiKeyChainVariant,
  mdiLockOpenOutline,
  mdiTicket,
} from '@mdi/js';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import { PropType, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
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
  if (!Object.keys(AuditAction).includes(props.event?.action)) {
    return props.event;
  }
  const { memberId, member, ...rest } = props.event.context || {};
  return !isEmpty(rest) ? rest : null;
});

const icon = computed(() => {
  switch (props.event?.action) {
    case AuditAction.MEMBER_ACTIVITY_ADD:
      return mdiCalendarPlusOutline;
    case AuditAction.MEMBER_ACTIVITY_UPDATE:
      return mdiCalendarEditOutline;
    case AuditAction.MEMBER_BADGE_ID_UPDATE:
      return mdiCreditCardOutline;
    case AuditAction.MEMBER_SUBSCRIPTION_ADD:
    case AuditAction.MEMBER_SUBSCRIPTION_UPDATE:
    case AuditAction.MEMBER_SUBSCRIPTION_REMOVE:
      return mdiCalendarRangeOutline;
    case AuditAction.MEMBER_TICKET_ADD:
    case AuditAction.MEMBER_TICKET_UPDATE:
    case AuditAction.MEMBER_TICKET_REMOVE:
      return mdiTicket;
    case AuditAction.MEMBER_MEMBERSHIP_ADD:
    case AuditAction.MEMBER_MEMBERSHIP_UPDATE:
    case AuditAction.MEMBER_MEMBERSHIP_REMOVE:
      return mdiCardAccountDetailsOutline;
    case AuditAction.KEYS_ACCESS:
    case AuditAction.KEYS_ACCESS_DECK:
    case AuditAction.KEYS_ACCESS_POULAILLER:
    case AuditAction.KEYS_ACCESS_PTI_POULAILLER:
      return mdiKeyChainVariant;
    case AuditAction.UNLOCK_DECK_DOOR:
      return mdiLockOpenOutline;
    case AuditAction.UNLOCK_GATE:
      return mdiDoorbell;
    case AuditAction.PARKING_ACCESS:
      return mdiGateOpen;
    case AuditAction.MEMBER_DEVICE_ADD:
    case AuditAction.MEMBER_DEVICE_UPDATE:
    case AuditAction.MEMBER_DEVICE_REMOVE:
    case AuditAction.MEMBER_MAC_ADDRESSES_UPDATE:
      return mdiDevices;
    case AuditAction.MEMBER_CAPABILITIES_UPDATE:
      return mdiHeadCogOutline;
    default:
      return mdiHelp;
  }
});
</script>
