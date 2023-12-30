<template>
  <div
    class="flex flex-col divide-y divide-gray-200 bg-white shadow sm:overflow-hidden sm:rounded-md">
    <div class="flex flex-row flex-wrap items-center justify-between gap-1 px-4 py-5 sm:p-6">
      <h4 class="text-lg font-medium">{{ $t('members.detail.orders.tickets.title') }}</h4>
      <span
        :class="[
          'rounded-full px-3 py-1 leading-6 ring-1 ring-inset sm:text-sm',
          remaining >= 0
            ? 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20'
            : 'bg-red-500/10 text-red-400 ring-red-500/20',
        ]">
        {{
          remaining >= 0
            ? $t('members.detail.orders.tickets.remaining', { count: remaining })
            : $t('members.detail.orders.tickets.overconsumed', { count: Math.abs(remaining) })
        }}
      </span>
    </div>

    <ul
      :class="[
        'relative flex shrink grow flex-col',
        state.shouldScroll ? 'overflow-y-scroll' : 'overflow-y-hidden',
      ]"
      role="list">
      <LoadingSpinner v-if="loading" class="m-auto h-16 w-16" />
      <template v-else>
        <li
          v-for="ticket in tickets"
          :key="`ticket-${ticket.purchased}-${ticket.count}`"
          class="border-b-[1px] border-gray-200">
          <RouterLink
            :class="{
              ['flex flex-col gap-1 px-6 py-4 hover:bg-slate-100 active:bg-slate-200']: true,
              ['bg-slate-50']:
                $route.params.ticketId === `${ticket._id}` &&
                $route.name === ROUTE_NAMES.MEMBERS.DETAIL.TICKETS.DETAIL,
            }"
            replace
            :to="{
              name: ROUTE_NAMES.MEMBERS.DETAIL.TICKETS.DETAIL,
              params: { ticketId: ticket._id },
            }">
            <div class="flex flex-row items-end gap-1">
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
              class="text-gray-500 sm:text-sm"
              :datetime="dayjs(ticket.purchased).toISOString()">
              {{
                $t('members.detail.orders.tickets.purchased', {
                  count: ticket.count,
                  date: dayjs(ticket.purchased).format('dddd LL'),
                })
              }}
            </time>
          </RouterLink>
        </li>
        <button
          v-if="!state.shouldScroll && tickets.length > 8"
          class="absolute inset-x-0 bottom-0 flex flex-row items-center justify-center bg-gradient-to-t from-white from-0% pb-4 pt-12 text-gray-500 transition hover:text-gray-700"
          @click="state.shouldScroll = true">
          <SvgIcon
            aria-hidden="true"
            class="mr-2 h-5 w-5"
            :path="mdiChevronDoubleDown"
            type="mdi" />
          {{ $t('members.detail.orders.tickets.more') }}
        </button>
      </template>
    </ul>
    <div class="mt-auto flex flex-row bg-gray-50 px-4 py-3 sm:px-6">
      <RouterLink
        class="flex flex-row items-center rounded-md border border-gray-300 bg-white px-3 py-2 font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
        replace
        :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.TICKETS.NEW }">
        <SvgIcon aria-hidden="true" class="mr-2 h-5 w-5" :path="mdiPlus" type="mdi" />
        {{ $t('members.detail.orders.tickets.add') }}
      </RouterLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { fractionAmount } from '@/helpers/currency';
import { ROUTE_NAMES } from '@/router/names';
import { Ticket } from '@/services/api/tickets';
import { mdiChevronDoubleDown, mdiPlus } from '@mdi/js';
import dayjs from 'dayjs';
import { PropType, reactive } from 'vue';

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  tickets: {
    type: Array as PropType<Ticket[]>,
    default: () => [],
  },
  remaining: {
    type: Number,
    default: 0,
  },
});

const state = reactive({
  shouldScroll: false,
});
</script>
