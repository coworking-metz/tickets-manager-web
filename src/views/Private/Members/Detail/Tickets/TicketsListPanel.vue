<template>
  <div
    class="flex flex-col divide-y divide-gray-200 bg-white shadow sm:overflow-hidden sm:rounded-md">
    <div class="flex flex-row flex-wrap items-center justify-between gap-1 px-4 py-5 sm:p-6">
      <h4 class="text-lg font-medium">{{ $t('members.detail.orders.tickets.title') }}</h4>
      <span
        :class="[
          'rounded-full px-3 py-1 text-sm leading-6 ring-1 ring-inset',
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
        'relative max-h-[40rem] shrink grow',
        state.shouldScroll ? 'overflow-y-scroll' : 'overflow-y-hidden',
      ]"
      role="list">
      <li
        v-for="ticket in tickets"
        :key="`ticket-${ticket.tickets}-${ticket.purchaseDate}`"
        class="border-b-[1px] border-gray-200">
        <RouterLink
          :class="{
            ['flex flex-col gap-1 px-6 py-4 hover:bg-slate-100 active:bg-slate-200']: true,
            ['bg-slate-50']:
              $route.params.ticketId === `${ticket.id}` &&
              $route.name === ROUTE_NAMES.MEMBERS.DETAIL.TICKETS.DETAIL,
          }"
          :to="{
            name: ROUTE_NAMES.MEMBERS.DETAIL.TICKETS.DETAIL,
            params: { ticketId: ticket.id },
          }">
          <div class="flex flex-row items-end gap-1">
            <i18n-t
              keypath="members.detail.orders.tickets.amount"
              :plural="ticket.tickets"
              scope="global"
              tag="span">
              <template #count>
                <strong class="text-3xl">{{ ticket.tickets }}</strong>
              </template>
            </i18n-t>
            <p class="ml-auto text-lg">
              {{ fractionAmount(ticket.tickets * TICKET_UNIT_COST_IN_EUR) }}
            </p>
          </div>

          <time class="text-sm text-gray-400" :datetime="dayjs(ticket.purchaseDate).toISOString()">
            {{
              $t('members.detail.orders.tickets.purchased', {
                count: ticket.tickets,
                date: dayjs(ticket.purchaseDate).format('dddd LL'),
              })
            }}
          </time>
        </RouterLink>
      </li>
      <button
        v-if="!state.shouldScroll && tickets.length > 8"
        class="absolute inset-x-0 bottom-0 flex flex-row items-center justify-center bg-gradient-to-t from-white from-30% pb-4 pt-8 text-gray-500 transition hover:text-gray-700"
        @click="state.shouldScroll = true">
        <SvgIcon aria-hidden="true" class="mr-2 h-5 w-5" :path="mdiChevronDoubleDown" type="mdi" />
        {{ $t('members.detail.orders.tickets.more') }}
      </button>
    </ul>
    <div class="mt-auto flex flex-row bg-gray-50 px-4 py-3 sm:px-6">
      <RouterLink
        class="flex flex-row items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.TICKETS.NEW }">
        <SvgIcon aria-hidden="true" class="mr-2 h-5 w-5" :path="mdiPlus" type="mdi" />
        {{ $t('members.detail.orders.tickets.add') }}
      </RouterLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import { fractionAmount } from '@/helpers/currency';
import { ROUTE_NAMES } from '@/router/names';
import { TICKET_UNIT_COST_IN_EUR, Ticket } from '@/services/api/members';
import { mdiChevronDoubleDown, mdiPlus } from '@mdi/js';
import dayjs from 'dayjs';
import { PropType, reactive } from 'vue';

defineProps({
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
