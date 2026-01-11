<template>
  <div :class="['flex items-center p-4 sm:px-6', loading && 'animate-pulse']">
    <div class="flex min-w-0 flex-1 flex-row flex-wrap justify-between gap-3 pl-4">
      <div class="flex min-w-48 shrink grow basis-0 flex-col items-start">
        <template v-if="message">
          <p class="shrink-0 font-medium text-indigo-600 sm:text-sm dark:text-indigo-400">
            {{ message.title || $t('messages.card.untitled') }}
          </p>

          <p class="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {{ message.body }}
          </p>

          <div class="mt-2 flex shrink flex-row items-center gap-2">
            <span
              v-if="message.published"
              class="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400 ring-1 ring-inset ring-green-500/20">
              <AppIcon class="size-3" :icon="mdiCheckCircleOutline" />
              {{ $t('messages.card.published') }}
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400 ring-1 ring-inset ring-amber-500/20">
              <AppIcon class="size-3" :icon="mdiClockOutline" />
              {{ $t('messages.card.draft') }}
            </span>

            <span
              v-if="acknowledgedCount !== undefined"
              class="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400 ring-1 ring-inset ring-blue-500/20">
              <AppIcon class="size-3" :icon="mdiAccountMultipleOutline" />
              {{ $t('messages.card.recipients', { count: acknowledgedCount }) }}
            </span>
          </div>
        </template>
        <template v-else-if="loading">
          <LoadingSkeleton class="h-4 w-32" />
          <LoadingSkeleton class="mt-2 h-4 w-48" />
          <LoadingSkeleton class="mt-2 h-4 w-24" />
        </template>
      </div>
      <p
        v-if="message?.published"
        class="flex min-w-48 shrink flex-col text-gray-500 sm:items-end sm:text-sm dark:text-gray-400">
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ $t('messages.card.publishedOn') }}
        </span>
        <time
          class="inline-block font-medium text-gray-900 dark:text-gray-100"
          :datetime="message.published">
          {{ formatDate(message.published) }}
        </time>
      </p>
      <p
        v-else-if="message?.created"
        class="flex min-w-48 shrink flex-col text-gray-500 sm:items-end sm:text-sm dark:text-gray-400">
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ $t('messages.card.createdOn') }}
        </span>
        <time
          class="inline-block font-medium text-gray-900 dark:text-gray-100"
          :datetime="message.created">
          {{ formatDate(message.created) }}
        </time>
      </p>
      <LoadingSkeleton v-else-if="loading" class="h-4 w-24" />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';
import { ApiMessage } from '@/services/api/messages';
import {
  mdiAccountMultipleOutline,
  mdiCheckCircleOutline,
  mdiClockOutline,
  mdiEmailOutline,
} from '@mdi/js';
import dayjs from 'dayjs';
import { computed, PropType } from 'vue';

const props = defineProps({
  message: {
    type: Object as PropType<ApiMessage>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const formatDate = (date: string) => {
  return dayjs(date).format('D MMM YYYY');
};

const acknowledgedCount = computed(() => {
  return props.message?.to?.length;
});
</script>
