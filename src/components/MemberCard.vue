<template>
  <div :class="['flex flex-row items-center gap-1 p-4', loading && 'animate-pulse']">
    <div class="flex min-w-0 shrink grow basis-0 flex-row items-start overflow-hidden">
      <div class="relative">
        <MembersThumbnail
          class="shrink-0"
          :email="member?.email"
          :name="fullname"
          :thumbnail="member?.thumbnail" />
        <span
          v-if="member?.attending"
          class="absolute bottom-0 right-0 block size-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-neutral-800" />
      </div>
      <div class="flex shrink grow basis-0 flex-col items-start overflow-hidden pl-4">
        <template v-if="member">
          <p
            class="w-full truncate text-left font-medium text-gray-900 sm:text-sm dark:text-gray-200">
            {{ fullname }}
          </p>

          <p
            class="mt-1 w-full overflow-hidden truncate text-left text-sm text-gray-500 dark:text-gray-400">
            {{ member.email }}
          </p>

          <slot />
        </template>
        <template v-else-if="loading">
          <div class="h-4 w-32 rounded bg-slate-200" />
          <div class="mt-2 h-4 w-48 rounded bg-slate-200" />
        </template>
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
