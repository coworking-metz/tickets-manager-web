<template>
  <article class="flex flex-col [@media_((min-height:840px)_and_(min-width:1024px))]:pt-40">
    <Head>
      <title>{{ $t('messages.list.head.title') }}</title>
    </Head>
    <h1
      class="mx-3 text-2xl font-bold leading-7 text-gray-900 sm:mx-0 sm:truncate sm:text-3xl sm:tracking-tight dark:text-gray-100">
      {{ $t('messages.list.title') }}
    </h1>

    <div class="mt-6 flex flex-row flex-wrap-reverse place-items-start justify-between gap-3">
      <div class="mx-3 w-full shrink grow basis-0 sm:mx-0">
        <label class="sr-only" for="messages-search">{{ $t('messages.list.search.label') }}</label>
        <AppSearchField
          id="messages-search"
          v-model="state.search"
          clearable
          hide-details
          input-class="pr-0"
          name="messages-search"
          :placeholder="$t('messages.list.search.placeholder')"
          tabindex="1" />
      </div>
      <AppButtonPlain
        class="mx-3 w-full whitespace-nowrap sm:mx-0 sm:w-auto"
        @click="messagesStore.openNewMessageDialog">
        <template #prepend>
          <AppIcon :icon="mdiPlus" />
        </template>
        {{ $t('messages.list.new') }}
      </AppButtonPlain>
    </div>

    <div class="flex flex-col-reverse items-stretch gap-3 md:flex-row">
      <div
        class="relative flex grow flex-col border-t border-gray-200 bg-white sm:rounded-md dark:border-stone-700 dark:bg-neutral-800">
        <div v-if="isFetching" class="sticky top-[67px] w-full sm:top-[3px]">
          <LoadingProgressBar class="absolute top-[-3px] h-[2px] w-full" />
        </div>

        <ul class="grow divide-y divide-gray-200 dark:divide-stone-700" role="list">
          <template v-if="isPending">
            <li v-for="index in 10" :key="`loading-message-card-${index}`">
              <MessagesListCard loading />
            </li>
          </template>
          <EmptyState
            v-else-if="!slicedList.length"
            class="m-auto pb-24 pt-6"
            :title="$t('messages.list.empty.title')" />
          <li v-else v-for="message in slicedList" :key="`message-${message._id}`">
            <RouterLink
              class="block transition-colors hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-neutral-900/50 dark:active:bg-neutral-900"
              :to="{
                name: ROUTE_NAMES.MESSAGES.DETAIL,
                params: { messageId: message._id },
              }">
              <MessagesListCard :message="message" />
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import MessagesListCard from './MessagesListCard.vue';
import AppIcon from '@/components/AppIcon.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingProgressBar from '@/components/LoadingProgressBar.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppSearchField from '@/components/form/AppSearchField.vue';
import { isSilentError } from '@/helpers/errors';
import { searchIn } from '@/helpers/text';
import { ROUTE_NAMES } from '@/router/names';
import { getAllMessages } from '@/services/api/messages';
import { messagesQueryKeys, useAppQuery } from '@/services/query';
import { useMessagesStore } from '@/store/messages';
import { useNotificationsStore } from '@/store/notifications';
import { mdiPlus } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import { useInfiniteScroll } from '@vueuse/core';
import { isNil } from 'lodash';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const SLICE_STEP = 16;

const props = defineProps({
  search: {
    type: String,
    default: null,
  },
  slice: {
    type: [String, Number],
    default: SLICE_STEP, // eslint-disable-line vue/valid-define-props
  },
});

const router = useRouter();
const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const messagesStore = useMessagesStore();
const state = reactive({
  search: null as string | null,
  slice: Number(props.slice) as number,
});

const {
  isSuccess,
  isPending,
  isFetching,
  data: messages,
  error,
} = useAppQuery(
  computed(() => ({
    queryKey: messagesQueryKeys.all(),
    queryFn: () => getAllMessages(),
  })),
);

const filteredList = computed(() => {
  return (messages.value || []).filter((message) =>
    searchIn(state.search, message.title, message.body),
  );
});

const slicedList = computed(() => filteredList.value.slice(0, state.slice));

const scrollElement = ref<Document>();
useInfiniteScroll(
  scrollElement,
  () => {
    // load more
    if (slicedList.value.length && state.slice < slicedList.value.length) {
      state.slice += SLICE_STEP;
    }
  },
  { distance: 100 },
);

onMounted(() => (scrollElement.value = document));

watch(
  () => props.search,
  (search) => {
    state.search = search;
  },
  { immediate: true },
);

watch(
  () => props.slice,
  (slice) => {
    if (!isNil(slice)) {
      state.slice = Number(slice);
    }
  },
  { immediate: true },
);

watch(
  () => state.search,
  (search) => {
    if (search !== props.search) {
      router.replace({
        ...router.currentRoute.value,
        query: {
          ...router.currentRoute.value.query,
          search: search || undefined,
        },
        replace: true,
      });
    }
  },
  { immediate: true },
);

watch(
  () => error.value,
  (error) => {
    if (error && !isSilentError(error)) {
      notificationsStore.addErrorNotification(error, i18n.t('messages.list.onFetch.fail'));
    }
  },
);

watch(
  () => state.slice,
  () => {
    router.replace({
      ...router.currentRoute.value,
      query: {
        ...router.currentRoute.value.query,
        slice: state.slice,
      },
    });
  },
);

watch(
  () => isSuccess.value,
  (success) => {
    if (success) {
      const top = (router.options.history.state.scroll as { top: number; left: number } | null)
        ?.top;
      if (top && props.slice) {
        nextTick(() => {
          scrollTo({ top, behavior: 'smooth' });
        });
      }
    }
  },
);
</script>
