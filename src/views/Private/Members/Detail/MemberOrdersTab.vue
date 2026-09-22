<template>
  <SectionRow class="max-sm:px-3" :title="$t('members.detail.orders.title')">
    <template #description>
      <p class="mt-1 whitespace-pre-line text-sm text-gray-500 dark:text-gray-400">
        {{ $t('members.detail.orders.description') }}
      </p>

      <AppButtonText
        v-if="!isNil(member?.wpUserId)"
        class="mt-5 self-start dark:focus:ring-offset-stone-900"
        color="indigo"
        :href="buildMemberWordpressOrdersUrl(member.wpUserId)"
        :icon="mdiOpenInNew"
        target="_blank">
        {{ $t('members.detail.wordpress.orders') }}
      </AppButtonText>
    </template>

    <TicketsListPanel class="max-h-[32rem] w-full" :member-id="memberId" />
    <SubscriptionsListPanel class="mt-8 max-h-[32rem] w-full" :member-id="memberId" />
    <MembershipsListPanel class="mt-8 max-h-[32rem] w-full" :member-id="memberId" />

    <template #append>
      <dl class="sticky top-3 flex flex-row flex-wrap gap-3">
        <AppPanel class="flex min-w-48 shrink grow basis-0 flex-col">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t('members.detail.orders.spent.daily.label') }}
          </dt>
          <i18n-t
            class="mt-1 text-gray-800 dark:text-gray-200"
            keypath="members.detail.orders.spent.daily.value"
            :plural="averageDailyAmountConsumed"
            scope="global"
            tag="dd">
            <template #amount>
              <AnimatedNumber
                class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
                :duration="1"
                :format="fractionAmount"
                :to="averageDailyAmountConsumed" />
            </template>
          </i18n-t>
        </AppPanel>
        <AppPanel class="flex min-w-48 shrink grow basis-0 flex-col">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t('members.detail.orders.spent.total.label') }}
          </dt>
          <i18n-t
            class="mt-1 text-gray-800 dark:text-gray-200"
            keypath="members.detail.orders.spent.total.value"
            :plural="totalAmountSpent"
            scope="global"
            tag="dd">
            <template #count>
              <AnimatedNumber
                class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
                :duration="1"
                :format="fractionAmount"
                :to="totalAmountSpent" />
            </template>
          </i18n-t>
        </AppPanel>
      </dl>
    </template>

    <SideDialog
      :model-value="
        [
          ROUTE_NAMES.MEMBERS.DETAIL.ORDERS.TICKETS,
          ROUTE_NAMES.MEMBERS.DETAIL.ORDERS.SUBSCRIPTIONS,
          ROUTE_NAMES.MEMBERS.DETAIL.ORDERS.MEMBERSHIPS,
        ].some((name) => doesRouteBelongsTo(route, name))
      "
      @update:model-value="router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.ORDERS.INDEX })">
      <RouterView :member="member" :member-id="memberId" />
    </SideDialog>
  </SectionRow>
</template>

<script setup lang="ts">
import MembershipsListPanel from './Memberships/MembershipsListPanel.vue';
import SectionRow from './SectionRow.vue';
import SubscriptionsListPanel from './Subscriptions/SubscriptionsListPanel.vue';
import TicketsListPanel from './Tickets/TicketsListPanel.vue';
import AnimatedNumber from '@/components/AnimatedNumber.vue';
import AppButtonText from '@/components/form/AppButtonText.vue';
import AppPanel from '@/components/layout/AppPanel.vue';
import SideDialog from '@/components/layout/SideDialog.vue';
import { fractionAmount } from '@/helpers/currency';
import { doesRouteBelongsTo } from '@/router/helpers';
import { ROUTE_NAMES } from '@/router/names';
import {
  buildMemberWordpressOrdersUrl,
  getMember,
  getMemberActivity,
} from '@/services/api/members';
import { getAllMemberMemberships } from '@/services/api/memberships';
import { getAllMemberSubscriptions } from '@/services/api/subscriptions';
import { getAllMemberTickets } from '@/services/api/tickets';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import { mdiOpenInNew } from '@mdi/js';
import { isNil } from 'lodash';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();

const { data: member } = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.profileById(props.memberId),
    queryFn: () => getMember(props.memberId),
  })),
);

const { data: activity } = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.activityById(props.memberId),
    queryFn: () => getMemberActivity(props.memberId),
  })),
);

const { data: tickets } = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.ticketsById(props.memberId),
    queryFn: () => getAllMemberTickets(props.memberId),
  })),
);

const { data: subscriptions } = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.subscriptionsById(props.memberId),
    queryFn: () => getAllMemberSubscriptions(props.memberId),
  })),
);

const { data: memberships } = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.membershipsById(props.memberId),
    queryFn: () => getAllMemberMemberships(props.memberId),
  })),
);

const totalAmountSpent = computed<number>(() => {
  const totalTicketsAmount = (tickets.value || []).reduce((total, ticket) => {
    return total + ticket.amount;
  }, 0);
  const totalSubscriptionsAmount = (subscriptions.value || []).reduce((total, subscription) => {
    return total + subscription.amount;
  }, 0);
  const totalMembershipsAmount = (memberships.value || []).reduce((total, membership) => {
    return total + membership.amount;
  }, 0);

  return totalTicketsAmount + totalSubscriptionsAmount + totalMembershipsAmount;
});

const averageDailyAmountConsumed = computed<number>(() => {
  if (!activity.value) return 0;

  let amount = 0;
  let durationInDays = 0;

  for (const dayActivity of activity.value) {
    durationInDays += dayActivity.value;
    const [firstCoverSubscription] = dayActivity.coverage.subscriptions ?? [];
    if (firstCoverSubscription?.dailyAmount) {
      amount += firstCoverSubscription.dailyAmount * dayActivity.value;
      continue;
    }

    amount +=
      (dayActivity.coverage.tickets?.amount ?? 0) + (dayActivity.coverage.debt?.amount ?? 0);
  }

  return durationInDays ? amount / durationInDays : 0;
});
</script>
