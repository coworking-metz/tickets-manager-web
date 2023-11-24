<template>
  <div
    class="flex flex-col divide-y divide-gray-200 bg-white shadow sm:overflow-hidden sm:rounded-md">
    <div class="flex flex-row flex-wrap items-center justify-between gap-1 px-4 py-5 sm:p-6">
      <h4 class="text-lg font-medium">{{ $t('members.detail.orders.coupons.title') }}</h4>
      <span
        class="rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
        {{ $t('members.detail.orders.coupons.remaining', { count: remaining }) }}
      </span>
    </div>
    <ul class="max-h-[40rem] shrink grow divide-y divide-gray-200 overflow-y-auto px-6" role="list">
      <li
        v-for="coupon in coupons"
        :key="`coupon-${coupon.tickets}-${coupon.purchaseDate}`"
        class="flex flex-col gap-1 py-4">
        <div class="flex flex-row items-end gap-1">
          <i18n-t
            keypath="members.detail.orders.coupons.amount"
            :plural="coupon.tickets"
            scope="global"
            tag="span">
            <template #count>
              <strong class="text-3xl">{{ coupon.tickets }}</strong>
            </template>
          </i18n-t>
          <p class="ml-auto text-lg">
            {{ fractionAmount(coupon.tickets * COUPON_UNIT_COST_IN_EUR) }}
          </p>
        </div>

        <time class="text-sm text-gray-400" :datetime="dayjs(coupon.purchaseDate).toISOString()">
          {{
            $t('members.detail.orders.coupons.purchased', {
              date: dayjs(coupon.purchaseDate).format('LLL'),
            })
          }}
        </time>
      </li>
    </ul>
    <div class="mt-auto flex flex-row bg-gray-50 px-4 py-3 sm:px-6">
      <button
        class="flex flex-row items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        type="button"
        @click="onAddCoupons">
        <SvgIcon aria-hidden="true" class="mr-3 h-5 w-5" :path="mdiPlus" type="mdi" />
        {{ $t('members.detail.orders.coupons.add') }}
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { fractionAmount } from '@/helpers/currency';
import { COUPON_UNIT_COST_IN_EUR, Coupon } from '@/services/api/members';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiPlus } from '@mdi/js';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat.js';
import { PropType } from 'vue';
dayjs.extend(LocalizedFormat);

defineProps({
  coupons: {
    type: Array as PropType<Coupon[]>,
    default: () => [],
  },
  remaining: {
    type: Number,
    default: 0,
  },
});

const onAddCoupons = () => {
  // TODO?
};
</script>
