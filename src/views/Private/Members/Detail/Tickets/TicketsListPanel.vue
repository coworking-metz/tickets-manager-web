<template>
  <AppPanel
    body-class="!p-0 flex flex-col overflow-hidden"
    class="flex flex-col"
    :title="$t('members.detail.orders.tickets.title')">
    <template #title:append>
      <span
        :class="[
          'shrink-0 rounded-full px-3 py-1 leading-6 ring-1 ring-inset sm:text-sm',
          remaining > 0
            ? 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20'
            : remaining < 0
              ? 'bg-red-500/10 text-red-400 ring-red-500/20'
              : 'bg-gray-500/10 text-gray-400 ring-gray-500/20',
        ]">
        {{
          remaining >= 0
            ? $t('members.detail.orders.tickets.remaining', { count: remaining })
            : $t('members.detail.orders.tickets.overconsumed', { count: Math.abs(remaining) })
        }}
      </span>
    </template>

    <div class="relative flex shrink grow flex-col overflow-hidden">
      <LoadingSpinner v-if="isFetchingTickets" class="mx-auto my-16 size-16" />
      <AppAlert
        v-else-if="ticketsErrorText"
        class="m-4"
        :description="ticketsErrorText"
        :title="$t('members.detail.orders.tickets.onFetch.fail')"
        type="error" />
      <ul
        v-else-if="tickets"
        :class="[
          'flex shrink grow flex-col divide-y divide-gray-200 dark:divide-neutral-700',
          state.shouldScroll ? 'overflow-y-scroll' : 'overflow-y-hidden',
        ]"
        role="list">
        <li v-for="ticket in tickets" :key="`ticket-${ticket._id}`">
          <RouterLink
            :class="[
              'flex flex-col gap-1 p-4 hover:bg-slate-100 active:bg-slate-200 sm:px-6 dark:hover:bg-zinc-800 dark:active:bg-zinc-900',
              route.params.ticketId === `${ticket._id}` &&
                route.name === ROUTE_NAMES.MEMBERS.DETAIL.TICKETS.DETAIL &&
                'bg-slate-50 dark:bg-zinc-900/80',
            ]"
            replace
            :to="{
              name: ROUTE_NAMES.MEMBERS.DETAIL.TICKETS.DETAIL,
              params: { ticketId: ticket._id },
            }">
            <div class="flex flex-row items-end gap-1 text-gray-900 dark:text-gray-100">
              <i18n-t
                keypath="members.detail.orders.tickets.amount"
                :plural="ticket.count"
                scope="global"
                tag="span">
                <template #count>
                  <strong class="text-3xl">{{ ticket.count }}</strong>
                </template>
              </i18n-t>
              <p class="ml-auto text-lg">
                {{ fractionAmount(ticket.amount) }}
              </p>
            </div>

            <time
              class="text-gray-500 sm:text-sm dark:text-gray-400"
              :datetime="dayjs(ticket.purchased).toISOString()">
              {{
                $t('members.detail.orders.tickets.purchased', {
                  count: ticket.count,
                  date: dayjs(ticket.purchased).format('dddd ll'),
                })
              }}
            </time>
          </RouterLink>
        </li>
      </ul>

      <button
        v-if="!state.shouldScroll && tickets && tickets.length >= SHOULD_SCROLL_ABOVE_COUNT"
        class="absolute inset-x-0 bottom-0 flex flex-row items-center justify-center bg-gradient-to-t from-white from-0% pb-4 pt-12 text-gray-500 transition hover:text-gray-700 dark:from-neutral-800 dark:text-gray-400 dark:hover:text-gray-200"
        @click="state.shouldScroll = true">
        <SvgIcon aria-hidden="true" class="mr-2 size-5" :path="mdiChevronDoubleDown" type="mdi" />
        {{ $t('members.detail.orders.tickets.more') }}
      </button>
    </div>

    <template #footer>
      <AppButtonPlain
        class="dark:focus:ring-offset-stone-950"
        color="neutral"
        :icon="mdiPlus"
        replace
        :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.TICKETS.NEW }">
        {{ $t('members.detail.orders.tickets.add') }}
      </AppButtonPlain>
    </template>
  </AppPanel>
</template>
<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppAlert from '@/components/form/AppAlert.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppPanel from '@/components/layout/AppPanel.vue';
import { fractionAmount } from '@/helpers/currency';
import { ROUTE_NAMES } from '@/router/names';
import { getAllMemberTickets } from '@/services/api/tickets';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import { mdiChevronDoubleDown, mdiPlus } from '@mdi/js';
import dayjs from 'dayjs';
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router';

const SHOULD_SCROLL_ABOVE_COUNT = 4;

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
  remaining: {
    type: Number,
    default: 0,
  },
});

const {
  isFetching: isFetchingTickets,
  data: tickets,
  errorText: ticketsErrorText,
} = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.ticketsById(props.memberId),
    queryFn: () => getAllMemberTickets(props.memberId),
  })),
);

const route = useRoute();
const state = reactive({
  shouldScroll: false,
});
</script>
