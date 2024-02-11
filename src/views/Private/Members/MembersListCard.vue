<template>
  <div :class="['flex items-center p-4 sm:px-6', loading && 'animate-pulse']">
    <div class="flex min-w-0 flex-1 items-start">
      <div :class="['relative h-12 w-12 shrink-0 rounded-full bg-slate-200']">
        <template v-if="member">
          <img
            v-if="member.wpUserId"
            :alt="`${$t('members.detail.profile.picture.label')} - ${fullname}`"
            class="h-full w-full rounded-full object-cover object-top"
            :src="buildMemberPictureUrl(member.wpUserId)" />
          <span
            v-if="!!member.lastSeen && dayjs().diff(member.lastSeen, 'hour', true) < 1"
            class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
        </template>
      </div>
      <div class="flex min-w-0 flex-1 flex-row gap-3 pl-4">
        <div class="flex shrink grow basis-0 flex-col items-start overflow-hidden">
          <template v-if="member">
            <p class="shrink-0 truncate font-medium text-indigo-600 sm:text-sm">
              {{ fullname }}
            </p>

            <div :class="['flex min-h-7 w-full flex-row gap-1', !fullname && 'flex-wrap']">
              <p
                class="flex max-w-max shrink grow basis-0 items-center overflow-hidden text-sm text-gray-500">
                <span class="truncate">{{ member.email }}</span>
              </p>
              <div
                v-if="member.balance < 0 || isMembershipNonCompliant(member)"
                class="flex shrink flex-row items-center gap-1">
                <span
                  v-if="member.balance < 0"
                  class="shrink basis-0 whitespace-nowrap rounded-full bg-red-500/10 px-2 py-0.5 text-center text-xs leading-6 text-red-400 ring-1 ring-inset ring-red-500/20">
                  {{
                    $t('members.detail.orders.tickets.overconsumed', {
                      count: Math.abs(member.balance),
                    })
                  }}
                </span>
                <span
                  v-if="isMembershipNonCompliant(member)"
                  class="shrink basis-0 whitespace-nowrap rounded-full bg-neutral-500/10 px-2 py-0.5 text-center text-xs leading-6 text-neutral-500 ring-1 ring-inset ring-neutral-500/20">
                  {{
                    member.lastMembership
                      ? $t('members.detail.membership.last', { year: member.lastMembership })
                      : $t('members.detail.membership.none')
                  }}
                </span>
              </div>
            </div>
          </template>
          <template v-else-if="loading">
            <div class="h-4 w-32 rounded bg-slate-200" />
            <div class="mt-2 h-4 w-48 rounded bg-slate-200" />
          </template>
        </div>
        <i18n-t
          v-if="member?.lastSeen"
          class="my-auto ml-auto shrink truncate text-right text-gray-500 max-sm:grow max-sm:basis-0 sm:text-sm"
          keypath="members.detail.header.description"
          scope="global"
          tag="p">
          <template #date>
            <time class="block font-medium lowercase text-gray-900" :datetime="member.lastSeen">
              {{
                dayjs().isSame(member.lastSeen, 'day')
                  ? dayjs(member.lastSeen).fromNow()
                  : dayjs(member.lastSeen).calendar(dayjs())
              }}
            </time>
          </template>
        </i18n-t>
      </div>
    </div>
    <slot name="append" />
  </div>
</template>

<script setup lang="ts">
import {
  MemberListItem,
  buildMemberPictureUrl,
  isMembershipNonCompliant,
} from '@/services/api/members';
import dayjs from 'dayjs';
import { PropType, computed } from 'vue';

const props = defineProps({
  member: {
    type: Object as PropType<MemberListItem>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const fullname = computed<string>(() =>
  [props.member?.firstName, props.member?.lastName].filter(Boolean).join(' '),
);
</script>
