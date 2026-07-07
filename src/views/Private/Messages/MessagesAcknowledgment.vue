<template>
  <component :is="tag" class="flex flex-row">
    <div class="flex w-10 shrink-0 flex-col items-center gap-2 self-stretch">
      <div
        :class="[
          'relative z-10 flex size-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700/50',
          loading && 'animate-pulse',
        ]">
        <MembersThumbnail
          class="size-full shrink-0"
          :email="member?.email"
          :name="fullname"
          :thumbnail="member?.thumbnail" />
      </div>

      <span
        v-if="withTimeline"
        aria-hidden="true"
        class="w-0.5 shrink grow basis-0 bg-gray-200 dark:bg-stone-700" />
    </div>

    <div v-if="loading" class="flex w-full flex-col items-start pb-6">
      <div
        class="mb-1 mt-2 h-5 w-full animate-pulse rounded-3xl bg-slate-200 dark:bg-gray-700/50"
        :style="{
          maxWidth: `${Math.floor(Math.random() * 256) + 128}px`,
        }" />
      <div class="mt-2 h-3 w-20 animate-pulse rounded-3xl bg-slate-200 dark:bg-gray-700/50" />
    </div>

    <div v-else class="flex flex-col pb-6 text-start text-sm text-slate-500 dark:text-slate-400">
      <i18n-t
        :keypath="
          !!ack.read
            ? 'messages.detail.acknowledgements.read'
            : !!ack.delivered
              ? 'messages.detail.acknowledgements.delivered'
              : 'messages.detail.acknowledgements.sent'
        "
        scope="global"
        tag="p">
        <template #author>
          <RouterLink
            v-if="$route.params.memberId !== ack.memberId"
            class="font-medium text-indigo-600 hover:underline dark:text-indigo-500"
            :to="{
              name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
              params: { memberId: ack.memberId },
            }">
            {{ fullname }}
          </RouterLink>
          <span v-else class="font-medium text-gray-900 dark:text-gray-100">
            {{ fullname }}
          </span>
        </template>
      </i18n-t>
      <time
        v-if="updated"
        class="whitespace-nowrap text-xs font-light lowercase text-gray-500 dark:text-gray-400"
        :datetime="updated"
        :title="dayjs(updated).format('llll')">
        {{
          dayjs().diff(updated, 'hour') < 1 ? dayjs(updated).fromNow() : dayjs(updated).calendar()
        }}
      </time>
    </div>
  </component>
</template>

<script setup lang="ts">
import MembersThumbnail from '../Members/MembersThumbnail.vue';
import { ROUTE_NAMES } from '@/router/names';
import { getAllMembers } from '@/services/api/members';
import { ApiMessageAcknowledgement } from '@/services/api/messages';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import dayjs from 'dayjs';
import { computed, PropType } from 'vue';

const props = defineProps({
  ack: {
    type: Object as PropType<ApiMessageAcknowledgement>,
    default: null,
  },
  withTimeline: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  tag: {
    type: String,
    default: 'div',
  },
});

const {
  isPending: isPendingMembers,
  isFetching: isFetching,
  data: members,
  errorText: membersErrorText,
} = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.all(),
    queryFn: () => getAllMembers(),
  })),
);

const member = computed(() => members.value?.find((m) => m._id === props.ack?.memberId) || null);
const fullname = computed<string>(() =>
  [member.value?.firstName, member.value?.lastName].filter(Boolean).join(' '),
);

const updated = computed(() => (props.ack?.read ?? props.ack?.delivered) || null);
</script>
