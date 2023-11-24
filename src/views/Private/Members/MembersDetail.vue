<template>
  <article class="mx-auto flex min-h-screen w-full max-w-7xl flex-col sm:px-6 lg:px-8">
    <LoadingSpinner v-if="state.isFetchingMember" class="m-auto h-16 w-16" />
    <template v-else-if="state.member">
      <SectionRow class="mt-12 sm:mt-40">
        <header class="flex shrink-0 flex-col">
          <div class="flex flex-row items-center space-x-5">
            <div class="shrink-0">
              <div class="relative">
                <img alt="" class="h-16 w-16 rounded-full" :src="state.member.picture" />
                <span aria-hidden="true" class="absolute inset-0 rounded-full shadow-inner" />
              </div>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ [state.member.firstname, state.member.lastname].filter(Boolean).join(' ') }}
              </h1>
              <i18n-t
                class="text-sm font-medium text-gray-500"
                keypath="members.detail.header.description"
                scope="global"
                tag="p">
                <template #date>
                  <time class="text-gray-900" :datetime="state.member.lastSeen">
                    <!-- {{ $d(new Date(state.member.lastSeen), 'long') }} -->
                    {{ dayjs().calendar(dayjs(state.member.lastSeen)) }}
                  </time>
                </template>
              </i18n-t>
            </div>
          </div>
        </header>
      </SectionRow>

      <SectionRow
        class="mt-6"
        :description="$t('members.detail.attendance.description')"
        :title="$t('members.detail.attendance.title')">
        <PresenceGraph :member="state.member" />
        <template #append>
          <dl class="sticky top-3 flex flex-col gap-3">
            <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt class="truncate text-sm font-medium text-gray-500">
                {{ $t('members.detail.attendance.last30days.label') }}
              </dt>
              <i18n-t
                class="mt-1"
                keypath="members.detail.attendance.last30days.value"
                scope="global"
                tag="dd">
                <template #amount>
                  <animated-counter
                    class="block text-3xl font-semibold tracking-tight text-gray-900"
                    :decimals="Number(!Number.isInteger(attendanceLast30Days))"
                    :duration="1"
                    :end-amount="attendanceLast30Days"
                    separator=" "
                    :suffix="`
                      ${$t('members.detail.attendance.last30days.suffix', {
                        count: Math.round(attendanceLast30Days),
                      })}`" />
                </template>
              </i18n-t>
            </div>
          </dl>
        </template>
      </SectionRow>

      <hr class="mt-6 border-t border-gray-200" />

      <SectionRow
        class="mt-6"
        :description="$t('members.detail.profile.description')"
        :title="$t('members.detail.profile.title')">
        <ProfilePanel :member="state.member" />
        <template #append>
          <dl class="sticky top-3 flex flex-col gap-3">
            <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt class="truncate text-sm font-medium text-gray-500">
                {{ $t('members.detail.profile.since.label') }}
              </dt>
              <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {{ dayjs(state.member.created).format('YYYY') }}
              </dd>
            </div>
          </dl>
        </template>
      </SectionRow>

      <hr class="my-6 border-t border-gray-200" />

      <SectionRow
        ref="ordersRowElement"
        class="mb-12 sm:mb-24"
        :description="$t('members.detail.orders.description')"
        :title="$t('members.detail.orders.title')">
        <div class="flex flex-row flex-wrap items-stretch gap-3">
          <CouponsPanel
            class="min-w-[16rem] shrink grow basis-0"
            :coupons="state.member.tickets"
            :remaining="state.member.balance" />
          <SubscriptionsPanel
            class="min-w-[16rem] shrink grow basis-0"
            :subscriptions="state.member.subscriptions" />
        </div>

        <template #append>
          <dl class="sticky top-3 flex flex-col gap-3">
            <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt class="truncate text-sm font-medium text-gray-500">
                {{ $t('members.detail.orders.spent.monthly.label') }}
              </dt>
              <i18n-t
                class="mt-1"
                keypath="members.detail.orders.spent.monthly.value"
                scope="global"
                tag="dd">
                <template #amount>
                  <animated-counter
                    class="block text-3xl font-semibold tracking-tight text-gray-900"
                    :decimals="Number.isInteger(monthlyAmountSpent) ? 0 : 2"
                    :duration="1"
                    :end-amount="monthlyAmountSpent"
                    separator=" "
                    suffix=" €" />
                </template>
              </i18n-t>
            </div>
            <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt class="truncate text-sm font-medium text-gray-500">
                {{ $t('members.detail.orders.spent.total.label') }}
              </dt>
              <i18n-t
                class="mt-1"
                keypath="members.detail.orders.spent.total.value"
                :plural="totalAmountSpent"
                scope="global"
                tag="dd">
                <template #count>
                  <animated-counter
                    ref="totalCounter"
                    :autoinit="false"
                    class="block text-3xl font-semibold tracking-tight text-gray-900"
                    :decimals="Number.isInteger(totalAmountSpent) ? 0 : 2"
                    :duration="1"
                    :end-amount="totalAmountSpent"
                    separator=" "
                    suffix=" €" />
                </template>
              </i18n-t>
            </div>
            <!-- <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt class="truncate text-sm font-medium text-gray-500">
                {{ $t('members.detail.orders.spent.total.label') }}
              </dt>
              <i18n-t class="mt-1 text-3xl font-semibold tracking-tight text-gray-900" tag="dd">
                2021
              </i18n-t>
            </div> -->
          </dl>
        </template>
      </SectionRow>
    </template>
  </article>
</template>

<script setup lang="ts">
import CouponsPanel from './Detail/CouponsPanel.vue';
import PresenceGraph from './Detail/PresenceGraph.vue';
import ProfilePanel from './Detail/ProfilePanel.vue';
import SectionRow from './Detail/SectionRow.vue';
import SubscriptionsPanel from './Detail/SubscriptionsPanel.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { handleSilentError, parseErrorText } from '@/helpers/errors';
import {
  COUPON_UNIT_COST_IN_EUR,
  Member,
  SUBSCRIPTION_UNIT_COST_IN_EUR,
  getMember,
} from '@/services/api/members';
import { useIntersectionObserver } from '@vueuse/core';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar.js';
import { computed, reactive, ref, watch } from 'vue';
dayjs.extend(calendar);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const state = reactive({
  isFetchingMember: false,
  member: null as Member | null,
  fetchMemberErrorMessage: null as string | null,
});
const ordersRowElement = ref(null);
const totalCounter = ref(null);

useIntersectionObserver(ordersRowElement, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    (totalCounter.value as any).start();
  }
});

const totalAmountSpent = computed<number>(() => {
  const totalCoupons =
    state.member?.tickets.reduce((total, coupon) => {
      return total + coupon.tickets;
    }, 0) ?? 0;
  const totalCouponsAmount = totalCoupons * COUPON_UNIT_COST_IN_EUR;
  const totalSubscriptionsAmount =
    (state.member?.subscriptions.length ?? 0) * SUBSCRIPTION_UNIT_COST_IN_EUR;

  return totalCouponsAmount + totalSubscriptionsAmount;
});

const monthlyAmountSpent = computed<number>(() => {
  const totalMonths = dayjs().diff(dayjs(state.member?.created), 'month');
  return totalAmountSpent.value / totalMonths;
});

const attendanceLast30Days = computed<number>(() => {
  return (
    state.member?.presences
      .filter(({ date }) => dayjs().diff(dayjs(date), 'day') <= 30)
      .reduce((acc, { amount }) => acc + amount, 0) ?? 0
  );
});

const fetchMember = (memberId: string) => {
  state.isFetchingMember = true;
  getMember(memberId)
    .then((member) => {
      state.member = member;
    })
    .catch(handleSilentError)
    .catch(async (error) => {
      state.fetchMemberErrorMessage = await parseErrorText(error);
      return Promise.reject(error);
    })
    .finally(() => {
      state.isFetchingMember = false;
    });
};

watch(
  () => props.id,
  (memberId) => {
    if (memberId) {
      fetchMember(memberId);
    }
  },
  { immediate: true },
);
</script>
