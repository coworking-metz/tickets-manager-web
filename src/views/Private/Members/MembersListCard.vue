<template>
  <div :class="['flex items-center p-4 sm:px-6', loading && 'animate-pulse']">
    <div class="flex min-w-0 flex-1 items-center">
      <div class="shrink-0">
        <div v-if="loading" class="h-12 w-12 rounded-full bg-slate-200" />
        <img v-else alt="" class="h-12 w-12 rounded-full" :src="member.picture" />
      </div>
      <div class="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
        <div class="flex flex-col gap-2">
          <div v-if="loading" class="h-2 w-32 rounded bg-slate-200" />
          <p v-else class="truncate text-sm font-medium text-indigo-600">
            {{ [member.firstname, member.lastname].join(' ') }}
          </p>
          <div v-if="loading" class="h-2 w-48 rounded bg-slate-200" />
          <p v-else class="flex items-center text-sm text-gray-500">
            <span class="truncate">{{ member.email }}</span>
          </p>
        </div>
        <div class="hidden md:block">
          <div>
            <p class="text-sm text-gray-900">
              Last seen
              {{ ' ' }}
              <time :datetime="member.lastSeen">{{ member.lastSeen }}</time>
            </p>
            <!-- <p class="mt-2 flex items-center text-sm text-gray-500">
                      {{ application.stage }}
                    </p> -->
          </div>
        </div>
      </div>
    </div>
    <slot name="append" />
  </div>
</template>

<script setup lang="ts">
import { MemberListItem } from '@/services/api/members';
import { PropType } from 'vue';

const props = defineProps({
  member: {
    type: Object as PropType<MemberListItem>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>
