<template>
  <div :class="['flex items-center p-4 sm:px-6', loading && 'animate-pulse']">
    <div class="flex min-w-0 flex-1 items-start">
      <div class="relative shrink-0">
        <template v-if="member">
          <img alt="" class="h-12 w-12 rounded-full" :src="member.picture" />
          <span
            v-if="!!member.lastSeen && dayjs().isSame(member.lastSeen, 'day')"
            class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
        </template>
        <div v-else-if="loading" class="h-12 w-12 rounded-full bg-slate-200" />
      </div>
      <div class="flex min-w-0 flex-1 flex-row gap-4 px-4">
        <div class="flex shrink grow basis-0 flex-col gap-2 overflow-hidden">
          <template v-if="member">
            <p class="truncate font-medium text-indigo-600 sm:text-sm">
              {{ [member.firstname, member.lastname].filter(Boolean).join(' ') }}
            </p>
            <p class="flex items-center text-sm text-gray-500">
              <span class="truncate">{{ member.email }}</span>
            </p>
          </template>
          <template v-else-if="loading">
            <div class="h-4 w-32 rounded bg-slate-200" />
            <div class="h-4 w-48 rounded bg-slate-200" />
          </template>
        </div>
        <i18n-t
          v-if="member?.lastSeen"
          class="my-auto ml-auto shrink grow basis-0 truncate text-right text-gray-500 sm:text-sm"
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
import { MemberListItem } from '@/services/api/members';
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
