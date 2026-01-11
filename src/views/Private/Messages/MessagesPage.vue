<template>
  <RouterViewSlideTransition v-if="width <= 1024" />
  <div v-else class="flex flex-row items-stretch">
    <div class="flex h-screen max-h-[1440px] w-80 shrink-0 flex-col pr-6">
      <aside aria-label="Sections" class="my-auto flex h-full max-h-[840px] flex-col">
        <MessagesList />
      </aside>
    </div>

    <MessagesDetail v-if="messageId" class="shrink grow basis-0" :message-id="messageId" />
  </div>
</template>

<script setup lang="ts">
import MessagesDetail from './MessagesDetail.vue';
import MessagesList from './MessagesList.vue';
import MessagesNew from './MessagesNew.vue';
import MessagesNewDialog from './MessagesNewDialog.vue';
import RouterViewSlideTransition from '@/components/layout/RouterViewSlideTransition.vue';
import { ROUTE_NAMES } from '@/router/names';
import { useWindowSize } from '@vueuse/core';

const props = defineProps({
  messageId: {
    type: String,
    default: null,
  },
});

const { width } = useWindowSize();
</script>
