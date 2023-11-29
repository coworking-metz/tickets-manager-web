<template>
  <div
    class="flex flex-col divide-y divide-gray-200 bg-white shadow sm:overflow-hidden sm:rounded-md">
    <div class="flex flex-row flex-wrap items-center justify-between gap-1 px-4 py-5 sm:p-6">
      <h4 class="text-lg font-medium">{{ $t('members.detail.orders.subscriptions.title') }}</h4>
      <span
        :class="[
          'rounded-full px-3 py-1 text-sm leading-6 ring-1 ring-inset',
          active
            ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
            : 'bg-gray-500/10 text-gray-400 ring-gray-500/20',
        ]">
        {{ $t('members.detail.orders.subscriptions.active', { count: +active }) }}
      </span>
    </div>
    <ul class="max-h-[40rem] shrink grow divide-y divide-gray-200 overflow-y-auto" role="list">
      <li
        v-for="subscription in subscriptions"
        :key="`subscription-${subscription.startDate}-${subscription.endDate}`">
        <RouterLink
          :class="{
            ['flex flex-col gap-1 px-6 py-4 hover:bg-slate-100 active:bg-slate-200']: true,
            ['bg-slate-50']:
              $route.params.subscriptionId === `${subscription.id}` &&
              $route.name === ROUTE_NAMES.MEMBERS.DETAIL.SUBSCRIPTIONS.DETAIL,
          }"
          :to="{
            name: ROUTE_NAMES.MEMBERS.DETAIL.SUBSCRIPTIONS.DETAIL,
            params: { subscriptionId: subscription.id },
          }">
          <div class="flex flex-row items-end gap-1">
            <i18n-t
              keypath="members.detail.orders.subscriptions.days"
              :plural="dayjs(subscription.endDate).diff(subscription.startDate, 'day')"
              scope="global"
              tag="span">
              <template #count>
                <strong class="text-3xl">
                  {{ dayjs(subscription.endDate).diff(subscription.startDate, 'day') }}
                </strong>
              </template>
            </i18n-t>
            <p class="ml-auto text-lg">
              {{ fractionAmount(SUBSCRIPTION_UNIT_COST_IN_EUR) }}
            </p>
          </div>
          <time
            class="text-sm"
            :datetime="`P${dayjs(subscription.endDate).diff(subscription.startDate, 'day')}D`">
            {{
              $t('members.detail.orders.subscriptions.period', {
                startDate: dayjs(subscription.startDate).format('L'),
                endDate: dayjs(subscription.endDate).format('L'),
              })
            }}
          </time>

          <time
            class="text-sm text-gray-400"
            :datetime="dayjs(subscription.purchased).toISOString()">
            {{
              $t('members.detail.orders.subscriptions.purchased', {
                date: dayjs(subscription.purchased).format('dddd LL'),
              })
            }}
          </time>
        </RouterLink>
      </li>
    </ul>
    <div class="mt-auto flex shrink-0 flex-row bg-gray-50 px-4 py-3 sm:px-6">
      <RouterLink
        class="flex flex-row items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.SUBSCRIPTIONS.NEW }">
        <SvgIcon aria-hidden="true" class="mr-2 h-5 w-5" :path="mdiPlus" type="mdi" />
        {{ $t('members.detail.orders.subscriptions.add') }}
      </RouterLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import { fractionAmount } from '@/helpers/currency';
import { ROUTE_NAMES } from '@/router/names';
import { SUBSCRIPTION_UNIT_COST_IN_EUR, Subscription } from '@/services/api/subscriptions';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiPlus } from '@mdi/js';
import dayjs from 'dayjs';
import { PropType } from 'vue';

defineProps({
  subscriptions: {
    type: Array as PropType<Subscription[]>,
    default: () => [],
  },
  active: {
    type: Boolean,
    default: false,
  },
});
</script>
