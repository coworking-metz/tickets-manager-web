<template>
  <div :class="['flex items-center p-4', loading && 'animate-pulse']">
    <div class="flex min-w-0 flex-1 items-start">
      <div class="relative">
        <MembersThumbnail
          class="shrink-0"
          :email="member?.email"
          :name="fullname"
          :thumbnail="member?.thumbnail" />
        <span
          v-if="member?.attending"
          class="absolute bottom-0 right-0 block size-3 rounded-full bg-emerald-500 ring-4 ring-white" />
      </div>
      <div class="flex min-w-0 flex-1 flex-row flex-wrap justify-between gap-3 pl-4">
        <div class="flex min-w-48 shrink grow basis-0 flex-col items-start">
          <template v-if="member">
            <p class="shrink-0 font-medium text-indigo-600 sm:text-sm dark:text-indigo-500">
              {{ fullname }}
            </p>

            <p class="mt-1 flex w-full items-center text-sm text-gray-500 dark:text-gray-400">
              <span class="truncate">{{ member.email }}</span>
            </p>

            <slot />
          </template>
          <template v-else-if="loading">
            <div class="h-4 w-32 rounded bg-slate-200" />
            <div class="mt-2 h-4 w-48 rounded bg-slate-200" />
          </template>
        </div>
      </div>
    </div>
    <slot name="append" />
  </div>
</template>

<script setup lang="ts">
import { MemberListItem } from '@/services/api/members';
import MembersThumbnail from '@/views/Private/Members/MembersThumbnail.vue';
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
