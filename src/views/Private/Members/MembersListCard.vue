<template>
  <div :class="['flex items-center p-4 sm:px-6', loading && 'animate-pulse']">
    <div class="flex min-w-0 flex-1 items-start">
      <div :class="['relative size-12 shrink-0 rounded-full bg-slate-200']">
        <template v-if="member">
          <img
            v-if="member.thumbnail"
            :alt="`${$t('members.detail.profile.picture.label')} - ${fullname}`"
            class="size-full rounded-full object-cover object-top"
            loading="lazy"
            :src="member.thumbnail" />
          <span
            v-if="member.attending"
            class="absolute bottom-0 right-0 block size-3 rounded-full bg-green-400 ring-4 ring-white" />
        </template>
      </div>
      <div class="flex min-w-0 flex-1 flex-row flex-wrap justify-between gap-3 pl-4">
        <div class="flex min-w-48 shrink grow basis-0 flex-col items-start">
          <template v-if="member">
            <p class="shrink-0 font-medium text-indigo-600 sm:text-sm">
              {{ fullname }}
            </p>

            <p class="mt-1 flex w-full items-center text-sm text-gray-500">
              <span class="truncate">{{ member.email }}</span>
            </p>

            <div
              v-if="member.balance < 0 || isMembershipNonCompliant(member)"
              class="mt-3 flex shrink flex-row items-center gap-1">
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
          </template>
          <template v-else-if="loading">
            <div class="h-4 w-32 rounded bg-slate-200" />
            <div class="mt-2 h-4 w-48 rounded bg-slate-200" />
          </template>
        </div>
        <i18n-t
          v-if="member?.lastSeen"
          class="flex min-w-48 shrink flex-col text-gray-500 sm:items-end sm:text-sm"
          keypath="members.detail.header.description"
          scope="global"
          tag="p">
          <template #date>
            <time class="block font-medium lowercase text-gray-900" :datetime="member.lastSeen">
              {{
                dayjs().diff(member.lastSeen, 'hour') < 1
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
import { MemberListItem, isMembershipNonCompliant } from '@/services/api/members';
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
