<template>
  <div
    :class="[
      'flex flex-col overflow-hidden rounded-lg bg-white shadow  dark:bg-neutral-800',
      (history?.length || 0) > MIN_HISTORY_EVENTS && 'max-h-128',
    ]">
    <!-- eslint-disable-next-line vuejs-accessibility/no-redundant-roles -- Safari/VoiceOver drops the list semantics of unstyled lists (list-style: none) -->
    <ul
      ref="eventsList"
      :class="[
        'relative flex shrink grow flex-col px-4 py-5 sm:p-6',
        state.shouldScroll ? 'overflow-y-scroll' : 'overflow-y-hidden',
      ]"
      role="list">
      <LoadingSpinner v-if="isPendingHistory" class="mx-auto my-16 size-16" />
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
      <EmptyState
        v-else-if="!filteredList.length"
        class="m-auto py-6"
        :title="$t('members.detail.audit.search.empty.title')" />
      <template v-else>
        <li v-for="(event, eventIndex) in displayedList" :key="`event-${event._id}`">
          <AuditEntry
            :event="event"
            :loading="isFetchingHistory"
            :with-timeline="eventIndex !== displayedList.length - 1" />
        </li>
        <!-- Next events are rendered when reaching the end of the list -->
        <li v-if="state.shouldScroll && hasMore" ref="endOfList" class="flex justify-center py-4">
          <LoadingSpinner class="size-6" />
        </li>
        <button
          v-if="!state.shouldScroll && filteredList.length > MIN_HISTORY_EVENTS"
          class="absolute inset-x-0 bottom-0 flex flex-row items-center justify-center bg-linear-to-t from-white from-0% pt-12 pb-4 text-gray-500 transition hover:text-gray-700 dark:from-neutral-800 dark:text-gray-400 dark:hover:text-gray-200"
          @click="state.shouldScroll = true">
          <AppIcon class="mr-2 size-5" :icon="mdiChevronDoubleDown" />
          {{ $t('members.detail.audit.more') }}
        </button>
      </template>
    </ul>
  </div>
</template>
<script setup lang="ts">
import PastHistory from '@/assets/animations/past-history.lottie';
import AppIcon from '@/components/AppIcon.vue';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AuditEntry from '@/components/audit/AuditEntry.vue';
import { useIncrementalList } from '@/helpers/list';
import { searchIn } from '@/helpers/text';
import { getMemberAuditEvents } from '@/services/api/members';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import { mdiChevronDoubleDown } from '@mdi/js';
import { refDebounced } from '@vueuse/core';
import { computed, PropType, reactive, toRef, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const MIN_HISTORY_EVENTS = 3;

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
  search: {
    type: String as PropType<string | null>,
    default: null,
  },
});

const i18n = useI18n();

const state = reactive({
  shouldScroll: false,
});

const {
  isPending: isPendingHistory,
  isFetching: isFetchingHistory,
  data: history,
  errorText: historyErrorText,
} = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.historyById(props.memberId),
    queryFn: () => getMemberAuditEvents(props.memberId),
  })),
);

// Filtering serializes every event: wait for the user to stop typing
const debouncedSearch = refDebounced(toRef(props, 'search'), 200);

const filteredList = computed(() =>
  (history.value || []).filter((event) =>
    searchIn(
      debouncedSearch.value,
      event.author && event.author._id === event.context?.member?._id
        ? i18n.t(`audit.action.${event.action}.self`)
        : i18n.t(`audit.action.${event.action}.message`),
      event.author?.name,
      JSON.stringify(event),
    ),
  ),
);

// Rendering every event at once is slow for long histories: render them progressively while scrolling
const eventsList = useTemplateRef<HTMLElement>('eventsList');
const endOfList = useTemplateRef<HTMLElement>('endOfList');
const { slicedList, hasMore } = useIncrementalList(filteredList, endOfList, {
  step: 16,
  resetOn: [debouncedSearch, () => props.memberId],
  onReset: () => eventsList.value?.scrollTo({ top: 0 }),
});

const displayedList = computed(() =>
  state.shouldScroll ? slicedList.value : filteredList.value.slice(0, MIN_HISTORY_EVENTS),
);

// Searching shows every matching event, not only the first ones
watch(debouncedSearch, (search) => {
  if (search) {
    state.shouldScroll = true;
  }
});

watch(
  () => props.memberId,
  (newMemberId, oldMemberId) => {
    // scroll to top to let the user know that member has changed
    if (newMemberId !== oldMemberId) {
      state.shouldScroll = false;
    }
  },
);
</script>
