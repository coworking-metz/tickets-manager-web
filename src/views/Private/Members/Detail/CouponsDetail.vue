<template>
  <div class="flex h-full flex-col bg-white shadow-xl">
    <div class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex items-center justify-between">
        <DialogTitle :class="['text-lg font-medium text-white', loading && 'animate-pulse']">
          <div v-if="loading" class="h-4 w-48 rounded-full bg-slate-300" />
          <span v-else-if="selectedCoupon">
            {{ $t('coupons.detail.title', { count: selectedCoupon.tickets }) }}
          </span>
        </DialogTitle>
        <div class="ml-3 flex h-7 items-center">
          <RouterLink
            class="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX }">
            <span class="sr-only">{{ $t('action.close') }}</span>
            <SvgIcon aria-hidden="true" class="h-6 w-6" :path="mdiClose" type="mdi" />
          </RouterLink>
        </div>
      </div>
      <div v-if="loading" class="h-3 w-64 rounded-full bg-slate-400" />
      <p v-else-if="selectedCoupon" class="text-sm text-indigo-300">
        {{
          $t('coupons.detail.description', {
            purchasedDate: dayjs(selectedCoupon.purchaseDate).format('LL'),
            purchasedTime: dayjs(selectedCoupon.purchaseDate).format('LT'),
          })
        }}
      </p>
    </div>
    <LoadingSpinner v-if="loading" class="m-auto h-16 w-16" />
    <form
      v-else-if="selectedCoupon"
      class="flex h-full flex-col px-4 py-6 sm:px-6"
      @submit.prevent="onSubmit">
      <Head>
        <title>{{ $t('coupons.detail.head.title', { count: selectedCoupon.tickets }) }}</title>
      </Head>
      <AppTextField
        id="coupon-count"
        v-model.number="state.count"
        :label="$t('coupons.detail.count.label')"
        :prepend-icon="mdiTicket"
        required
        type="number">
        <template #append>
          <span
            class="pointer-events-none absolute inset-y-0 right-0 z-20 mr-3 flex items-center text-sm text-gray-400">
            {{ $t('coupons.detail.count.unit', { count: state.count }) }}
          </span>
        </template>
      </AppTextField>

      <AppTextField
        id="coupon-purchased"
        v-model.number="state.purchased"
        :label="$t('coupons.detail.purchased.label', { count: state.count })"
        :prepend-icon="mdiCalendarBlankOutline"
        required
        type="datetime-local" />

      <AppButton class="mt-1 self-start" :icon="mdiCheck" type="submit">
        {{ $t('action.apply') }}
      </AppButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppButton from '@/components/form/AppButton.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import { scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import { Coupon, Member } from '@/services/api/members';
import { DialogTitle } from '@headlessui/vue';
import { mdiCalendarBlankOutline, mdiCheck, mdiClose, mdiTicket } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import useVuelidate from '@vuelidate/core';
import { numeric, required } from '@vuelidate/validators';
import dayjs from 'dayjs';
import { nextTick, reactive } from 'vue';
import { PropType, computed, watch } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  member: {
    type: Object as PropType<Member>,
    default: null,
  },
  id: {
    type: String,
    required: true,
  },
});

const state = reactive({
  count: null as null | number,
  purchased: null as string | null,
});

const selectedCoupon = computed<Coupon | null>(() => {
  return props.member?.tickets.find((coupon) => `${coupon.id}` === `${props.id}`) ?? null;
});

const rules = computed(() => ({
  count: { required: withAppI18nMessage(required), decimal: withAppI18nMessage(numeric) },
  purchased: { required: withAppI18nMessage(required) },
}));

const vuelidate = useVuelidate(rules, state);

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }
  // TODO
};

watch(
  () => selectedCoupon.value,
  (coupon) => {
    if (coupon) {
      state.count = coupon.tickets;
      state.purchased = dayjs(coupon.purchaseDate).format('YYYY-MM-DDTHH:mm');
    }
  },
  { immediate: true },
);
</script>
