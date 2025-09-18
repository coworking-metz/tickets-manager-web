<template>
  <div
    :class="[
      'flex flex-col divide-y divide-gray-200 bg-white shadow sm:overflow-hidden sm:rounded-md',
      (history?.length || 0) > MIN_HISTORY_EVENTS && 'max-h-[32rem]',
    ]">
    <ul
      :class="[
        'relative flex shrink grow flex-col px-4 py-5 sm:p-6',
        state.shouldScroll ? 'overflow-y-scroll' : 'overflow-y-hidden',
      ]"
      role="list">
      <LoadingSpinner v-if="isPendingHistory" class="m-auto size-16" />
      <ErrorState
        v-else-if="historyErrorText"
        class="m-auto"
        :description="historyErrorText"
        :title="$t('members.detail.audit.onFetch.fail')" />
      <EmptyState
        v-else-if="!history?.length"
        :animation="PastHistory"
        animation-class="!-my-12"
        class="m-auto py-6"
        :title="$t('members.detail.audit.empty.title')" />
      <template v-else-if="history">
        <li
          v-for="(event, eventIndex) in state.shouldScroll
            ? history
            : history.slice(0, MIN_HISTORY_EVENTS)"
          :key="`event-${event._id}`">
          <AuditEntry
            :event="event"
            :loading="isFetchingHistory"
            :with-timeline="eventIndex !== history.length - 1" />
        </li>
        <button
          v-if="!state.shouldScroll && history.length > MIN_HISTORY_EVENTS"
          class="absolute inset-x-0 bottom-0 flex flex-row items-center justify-center bg-gradient-to-t from-white from-0% pb-4 pt-20 text-gray-500 transition hover:text-gray-700"
          @click="state.shouldScroll = true">
          <SvgIcon aria-hidden="true" class="mr-2 size-5" :path="mdiChevronDoubleDown" type="mdi" />
          {{ $t('members.detail.audit.more') }}
        </button>
      </template>
    </ul>
  </div>
</template>
<script setup lang="ts">
import PastHistory from '@/assets/animations/past-history.lottie';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AuditEntry from '@/components/audit/AuditEntry.vue';
import { Member, getMemberAuditEvents } from '@/services/api/members';
import { useAppQuery } from '@/services/query';
import { mdiChevronDoubleDown } from '@mdi/js';
import { PropType, computed, reactive } from 'vue';

const MIN_HISTORY_EVENTS = 3;

const props = defineProps({
  member: {
    type: Object as PropType<Member>,
    required: true,
  },
});

const state = reactive({
  shouldScroll: false,
});

const {
  isPending: isPendingHistory,
  isFetching: isFetchingHistory,
  data: history,
  errorText: historyErrorText,
} = useAppQuery({
  queryKey: ['members', computed(() => props.member._id), 'history'],
  queryFn: () => getMemberAuditEvents(props.member._id),
  retry: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});
</script>
