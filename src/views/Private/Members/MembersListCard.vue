<template>
  <div :class="['flex items-center p-4 sm:px-6', loading && 'animate-pulse']">
    <div class="flex min-w-0 flex-1 items-start">
      <div class="relative shrink-0">
        <template v-if="member">
          <img alt="" class="h-12 w-12 rounded-full bg-gray-200" :src="member.picture" />
          <span
            v-if="!!member.lastSeen && dayjs().isSame(member.lastSeen, 'hour')"
            class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
        </template>
        <div v-else-if="loading" class="h-12 w-12 rounded-full bg-slate-200" />
      </div>
      <div class="flex min-w-0 flex-1 flex-row gap-4 px-4">
        <div class="flex shrink grow basis-0 flex-col overflow-hidden">
          <template v-if="member">
            <p class="shrink-0 truncate font-medium text-indigo-600 sm:text-sm">
              {{ [member.firstName, member.lastName].filter(Boolean).join(' ') }}
            </p>

            <div class="flex min-h-7 flex-row gap-1">
              <p class="flex items-center text-sm text-gray-500">
                <span class="truncate">{{ member.email }}</span>
              </p>
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
                {{ $t('members.detail.membership.last', { year: member.lastMembership }) }}
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
import { MemberListItem, isMembershipNonCompliant } from '@/services/api/members';
import dayjs from 'dayjs';
import { PropType } from 'vue';

defineProps({
  member: {
    type: Object as PropType<MemberListItem>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>
