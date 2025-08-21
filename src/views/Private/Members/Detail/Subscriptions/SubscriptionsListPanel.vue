<template>
  <div
    class="flex flex-col divide-y divide-gray-200 bg-white shadow sm:overflow-hidden sm:rounded-md">
    <div class="flex flex-row flex-wrap items-center justify-between gap-1 px-4 py-5 sm:p-6">
      <h4 class="text-lg font-medium">{{ $t('members.detail.orders.subscriptions.title') }}</h4>
      <span
        :class="[
          'rounded-full px-3 py-1 leading-6 ring-1 ring-inset sm:text-sm',
          hasActiveSubscription
            ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
            : 'bg-gray-500/10 text-gray-400 ring-gray-500/20',
        ]">
        {{ $t('members.detail.orders.subscriptions.active', { count: +hasActiveSubscription }) }}
      </span>
    </div>
    <ul
      :class="[
        'relative flex shrink grow flex-col',
        state.shouldScroll ? 'overflow-y-scroll' : 'overflow-y-hidden',
      ]"
      role="list">
      <LoadingSpinner v-if="isFetchingSubscriptions" class="m-auto size-16" />
      <template v-else>
        <li
          v-for="subscription in subscriptions"
          :key="`subscription-${subscription.started}-${subscription.ended}`"
          class="border-b border-gray-200">
          <RouterLink
            :class="{
              ['flex flex-col gap-1 px-6 py-4 hover:bg-slate-100 active:bg-slate-200']: true,
              ['bg-slate-50']:
                route.params.subscriptionId === `${subscription._id}` &&
                route.name === ROUTE_NAMES.MEMBERS.DETAIL.SUBSCRIPTIONS.DETAIL,
            }"
            replace
            :to="{
              name: ROUTE_NAMES.MEMBERS.DETAIL.SUBSCRIPTIONS.DETAIL,
              params: { subscriptionId: subscription._id },
            }">
            <div class="flex flex-row items-end gap-1">
              <i18n-t
                keypath="members.detail.orders.subscriptions.days"
                :plural="dayjs(subscription.ended).diff(subscription.started, 'day')"
                scope="global"
                tag="span">
                <template #count>
                  <strong class="text-3xl">
                    {{ dayjs(subscription.ended).diff(subscription.started, 'day') }}
                  </strong>
                </template>
              </i18n-t>
              <p class="ml-auto text-lg">
                {{ fractionAmount(subscription.amount) }}
              </p>
            </div>
            <time
              class="sm:text-sm"
              :datetime="`P${dayjs(subscription.ended).diff(subscription.started, 'day')}D`">
              {{
                $t('members.detail.orders.subscriptions.period', {
                  startDate: dayjs(subscription.started).format('L'),
                  endDate: dayjs(subscription.ended).format('L'),
                })
              }}
            </time>

            <time
              class="text-gray-500 sm:text-sm"
              :datetime="dayjs(subscription.purchased).toISOString()">
              {{
                $t('members.detail.orders.subscriptions.purchased', {
                  date: dayjs(subscription.purchased).format('dddd LL'),
                })
              }}
            </time>
          </RouterLink>
        </li>
        <button
          v-if="!state.shouldScroll && subscriptions && subscriptions.length >= 4"
          class="absolute inset-x-0 bottom-0 flex flex-row items-center justify-center bg-gradient-to-t from-white from-0% pb-4 pt-12 text-gray-500 transition hover:text-gray-700"
          @click="state.shouldScroll = true">
          <SvgIcon aria-hidden="true" class="mr-2 size-5" :path="mdiChevronDoubleDown" type="mdi" />
          {{ $t('members.detail.orders.subscriptions.more') }}
        </button>
      </template>
    </ul>
    <div class="mt-auto flex shrink-0 flex-row bg-gray-50 px-4 py-3 sm:px-6">
      <RouterLink
        class="flex flex-row items-center rounded-md border border-gray-300 bg-white px-3 py-2 font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
        replace
        :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.SUBSCRIPTIONS.NEW }">
        <SvgIcon aria-hidden="true" class="mr-2 size-5" :path="mdiPlus" type="mdi" />
        {{ $t('members.detail.orders.subscriptions.add') }}
      </RouterLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { fractionAmount } from '@/helpers/currency';
import { ROUTE_NAMES } from '@/router/names';
import { getAllMemberSubscriptions, Subscription } from '@/services/api/subscriptions';
import { useAppQuery } from '@/services/query';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronDoubleDown, mdiPlus } from '@mdi/js';
import dayjs from 'dayjs';
import { computed, PropType, reactive } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
});

const {
  isFetching: isFetchingSubscriptions,
  data: subscriptions,
  errorText: subscriptionsErrorText,
} = useAppQuery({
  queryKey: ['members', computed(() => props.memberId), 'subscriptions'],
  queryFn: () => getAllMemberSubscriptions(props.memberId),
  retry: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

const hasActiveSubscription = computed(
  () =>
    subscriptions.value?.some(({ started, ended }) =>
      dayjs().isBetween(started, ended, 'day', '[]'),
    ) ?? false,
);

const route = useRoute();
const state = reactive({
  shouldScroll: false,
});
</script>
