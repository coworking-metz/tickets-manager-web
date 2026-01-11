<template>
  <AppPanel
    body-class="!p-0 flex flex-col overflow-hidden"
    class="flex flex-col"
    :title="$t('members.detail.orders.subscriptions.title')">
    <template #title:append>
      <span
        :class="[
          'shrink-0 rounded-full px-3 py-1 leading-6 ring-1 ring-inset sm:text-sm',
          hasActiveSubscription
            ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
            : 'bg-gray-500/10 text-gray-400 ring-gray-500/20',
        ]">
        {{ $t('members.detail.orders.subscriptions.active', { count: +hasActiveSubscription }) }}
      </span>
    </template>

    <div class="relative flex shrink grow flex-col overflow-hidden">
      <LoadingSpinner v-if="isFetchingSubscriptions" class="mx-auto my-16 size-16" />
      <AppAlert
        v-else-if="subscriptionsErrorText"
        class="m-4"
        :description="subscriptionsErrorText"
        :title="$t('members.detail.orders.subscriptions.onFetch.fail')"
        type="error" />
      <ul
        v-else-if="subscriptions"
        :class="[
          'flex shrink grow flex-col divide-y divide-gray-200 dark:divide-neutral-700',
          state.shouldScroll ? 'overflow-y-scroll' : 'overflow-y-hidden',
        ]"
        role="list">
        <li
          v-for="subscription in subscriptions"
          :key="`subscription-${subscription.started}-${subscription.ended}`">
          <RouterLink
            :class="[
              'flex flex-col gap-1 p-4 hover:bg-slate-100 active:bg-slate-200 sm:px-6 dark:hover:bg-zinc-800 dark:active:bg-zinc-900',
              route.params.subscriptionId === `${subscription._id}` &&
                route.name === ROUTE_NAMES.MEMBERS.DETAIL.SUBSCRIPTIONS.DETAIL &&
                'bg-slate-50 dark:bg-zinc-900/80',
            ]"
            replace
            :to="{
              name: ROUTE_NAMES.MEMBERS.DETAIL.SUBSCRIPTIONS.DETAIL,
              params: { subscriptionId: subscription._id },
            }">
            <div class="flex min-h-9 flex-row items-end gap-1 text-gray-900 dark:text-gray-100">
              <span class="text-xl font-semibold">
                {{ getSubscriptionTitle(subscription) }}
              </span>
              <p class="ml-auto text-lg">
                {{ fractionAmount(subscription.amount) }}
              </p>
            </div>
            <time
              class="text-gray-900 sm:text-sm dark:text-gray-100"
              :datetime="`P${dayjs(subscription.ended).diff(subscription.started, 'day')}D`">
              {{
                $t('members.detail.orders.subscriptions.period', {
                  startDate: dayjs(subscription.started).format('L'),
                  endDate: dayjs(subscription.ended).format('L'),
                })
              }}
            </time>

            <time
              class="text-gray-500 sm:text-sm dark:text-gray-400"
              :datetime="dayjs(subscription.purchased).toISOString()">
              {{
                $t('members.detail.orders.subscriptions.purchased', {
                  date: dayjs(subscription.purchased).format('dddd ll'),
                })
              }}
            </time>
          </RouterLink>
        </li>
      </ul>

      <button
        v-if="
          !state.shouldScroll && subscriptions && subscriptions.length >= SHOULD_SCROLL_ABOVE_COUNT
        "
        class="absolute inset-x-0 bottom-0 flex flex-row items-center justify-center bg-gradient-to-t from-white from-0% pb-4 pt-12 text-gray-500 transition hover:text-gray-700 dark:from-neutral-800 dark:text-gray-400 dark:hover:text-gray-200"
        @click="state.shouldScroll = true">
        <SvgIcon aria-hidden="true" class="mr-2 size-5" :path="mdiChevronDoubleDown" type="mdi" />
        {{ $t('members.detail.orders.subscriptions.more') }}
      </button>
    </div>

    <template #footer>
      <AppButtonPlain
        class="dark:focus:ring-offset-stone-950"
        color="neutral"
        :icon="mdiPlus"
        replace
        :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.SUBSCRIPTIONS.NEW }">
        {{ $t('members.detail.orders.subscriptions.add') }}
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
import { getAllMemberSubscriptions, Subscription } from '@/services/api/subscriptions';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiChevronDoubleDown, mdiPlus } from '@mdi/js';
import dayjs from 'dayjs';
import { capitalize } from 'lodash';
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router';

const SHOULD_SCROLL_ABOVE_COUNT = 4;

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
} = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.subscriptionsById(props.memberId),
    queryFn: () => getAllMemberSubscriptions(props.memberId),
  })),
);

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

const getSubscriptionTitle = (subscription: Subscription) => {
  const now = dayjs();
  const start = dayjs(subscription.started);
  const end = dayjs(subscription.ended);
  const startMonthDaysCount = start.endOf('month').diff(start, 'day');
  const endMonthDaysCount = end.diff(end.startOf('month'), 'day');
  if (startMonthDaysCount >= 20) {
    return capitalize(now.isSame(start, 'year') ? start.format('MMMM') : start.format('MMMM YYYY'));
  } else if (endMonthDaysCount >= 20) {
    return capitalize(now.isSame(end, 'year') ? end.format('MMMM') : end.format('MMMM YYYY'));
  } else {
    return [
      `${capitalize(start.format('MMMM'))} - ${capitalize(end.format('MMMM'))}`,
      !now.isSame(end, 'year') && end.format('YYYY'),
    ]
      .filter(Boolean)
      .join(' ');
  }
};
</script>
