<template>
  <div :class="['flex items-center p-4 sm:px-6', loading && 'animate-pulse']">
    <div class="flex min-w-0 flex-1 items-center">
      <div class="shrink-0">
        <div v-if="loading" class="h-12 w-12 rounded-full bg-slate-200" />
        <img v-else-if="member" alt="" class="h-12 w-12 rounded-full" :src="member.picture" />
      </div>
      <div class="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
        <div class="flex flex-col gap-2">
          <div v-if="loading" class="h-2 w-32 rounded bg-slate-200" />
          <p v-else-if="member" class="truncate text-sm font-medium text-indigo-600">
            {{ [member.firstname, member.lastname].filter(Boolean).join(' ') }}
          </p>
          <div v-if="loading" class="h-2 w-48 rounded bg-slate-200" />
          <p v-else-if="member" class="flex items-center text-sm text-gray-500">
            <span class="truncate">{{ member.email }}</span>
          </p>
        </div>
        <i18n-t
          v-if="member?.lastSeen"
          class="my-auto text-sm text-gray-700"
          keypath="members.detail.header.description"
          scope="global"
          tag="p">
          <template #date>
            <time class="font-medium lowercase text-gray-900" :datetime="member.lastSeen">
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
