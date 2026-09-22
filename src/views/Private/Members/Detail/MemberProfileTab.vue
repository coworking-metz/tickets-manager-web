<template>
  <SectionRow
    class="max-sm:px-3"
    :description="$t('members.detail.profile.description')"
    :title="$t('members.detail.profile.title')">
    <MemberProfilePanel :member-id="memberId" />
    <MemberDevicesPanel class="mt-3" :member-id="memberId" />
    <MemberCapabilitesPanel class="mt-3" :member-id="memberId" />
    <MemberWordpressPanel class="mt-3" :member-id="memberId" />
    <MemberImpersonationPanel class="mt-3" :member-id="memberId" />

    <template #append>
      <dl class="sticky top-3 flex flex-row flex-wrap gap-3">
        <AppPanel class="flex min-w-48 shrink grow basis-0 flex-col">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t('members.detail.profile.since.label') }}
          </dt>
          <LoadingSkeleton v-if="isPendingMember" class="mt-2 h-8 w-32 rounded-3xl" />
          <dd
            v-else
            class="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {{ dayjs(member?.created).format('ll') }}
          </dd>
        </AppPanel>

        <AppPanel class="flex min-w-48 shrink grow basis-0 flex-col">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t('members.detail.orders.tickets.used.label') }}
          </dt>
          <LoadingSkeleton v-if="isFetchingActivity" class="mt-2 h-8 w-32 rounded-3xl" />
          <i18n-t
            v-else
            class="mt-1 text-gray-800 dark:text-gray-200"
            keypath="members.detail.orders.tickets.used.text"
            :plural="totalTicketsUsed"
            scope="global"
            tag="dd">
            <template #count>
              <i18n-t
                class="block whitespace-nowrap text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
                keypath="members.detail.orders.tickets.used.count"
                :plural="totalTicketsUsed"
                scope="global"
                tag="strong">
                <AnimatedNumber
                  :duration="1"
                  :format="
                    (count: number) =>
                      formatAmount(count, {
                        style: 'decimal',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 1,
                      })
                  "
                  :to="totalTicketsUsed" />
              </i18n-t>
            </template>
            <template #orders>
              <i18n-t
                keypath="members.detail.orders.tickets.used.orders"
                :plural="totalTicketsCount"
                scope="global"
                tag="span">
                <template #count>
                  <span
                    class="inline-block font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {{
                      formatAmount(totalTicketsCount, {
                        style: 'decimal',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 1,
                      })
                    }}
                  </span>
                </template>
              </i18n-t>
            </template>
          </i18n-t>
        </AppPanel>

        <AppPanel class="flex min-w-48 shrink grow basis-0 flex-col">
          <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
            {{ $t('members.detail.orders.subscriptions.coverage.label') }}
          </dt>
          <LoadingSkeleton v-if="isFetchingActivity" class="mt-2 h-8 w-32 rounded-3xl" />
          <i18n-t
            v-else
            class="mt-1 text-gray-800 dark:text-gray-200"
            keypath="members.detail.orders.subscriptions.coverage.text"
            :plural="attendanceCoveredBySubscriptions"
            scope="global"
            tag="dd">
            <template #attendance>
              <i18n-t
                class="block whitespace-nowrap text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
                keypath="members.detail.orders.subscriptions.coverage.attendance"
                :plural="attendanceCoveredBySubscriptions"
                scope="global"
                tag="strong">
                <AnimatedNumber
                  :duration="1"
                  :format="
                    (count: number) =>
                      formatAmount(count, {
                        style: 'decimal',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 1,
                      })
                  "
                  :to="attendanceCoveredBySubscriptions" />
              </i18n-t>
            </template>
            <template #orders>
              <i18n-t
                keypath="members.detail.orders.subscriptions.coverage.orders"
                :plural="totalSubscriptionsCount"
                scope="global"
                tag="span">
                <template #count>
                  <span
                    class="inline-block font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {{
                      formatAmount(totalSubscriptionsCount, {
                        style: 'decimal',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 1,
                      })
                    }}
                  </span>
                </template>
              </i18n-t>
            </template>
          </i18n-t>
        </AppPanel>
      </dl>
    </template>
  </SectionRow>
</template>

<script setup lang="ts">
import MemberCapabilitesPanel from './MemberCapabilitesPanel.vue';
import MemberDevicesPanel from './MemberDevicesPanel.vue';
import MemberImpersonationPanel from './MemberImpersonationPanel.vue';
import MemberProfilePanel from './MemberProfilePanel.vue';
import MemberWordpressPanel from './MemberWordpressPanel.vue';
import SectionRow from './SectionRow.vue';
import AnimatedNumber from '@/components/AnimatedNumber.vue';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';
import AppPanel from '@/components/layout/AppPanel.vue';
import { formatAmount } from '@/helpers/currency';
import { getMember, getMemberActivity } from '@/services/api/members';
import { getAllMemberSubscriptions } from '@/services/api/subscriptions';
import { getAllMemberTickets } from '@/services/api/tickets';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import dayjs from 'dayjs';
import { computed } from 'vue';

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
});

const { isPending: isPendingMember, data: member } = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.profileById(props.memberId),
    queryFn: () => getMember(props.memberId),
  })),
);

const { isFetching: isFetchingActivity, data: activity } = useAppQuery(
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

const totalTicketsCount = computed<number>(() => {
  return tickets.value?.reduce((total, ticketsOrder) => total + ticketsOrder.count, 0) || 0;
});

const totalTicketsUsed = computed<number>(() => {
  return (
    activity.value
      ?.filter(({ type }) => type === 'ticket')
      .reduce((total, { value }) => total + value, 0) || 0
  );
});

const attendanceCoveredBySubscriptions = computed<number>(() => {
  return (
    activity.value
      ?.filter(({ type }) => type === 'subscription')
      .reduce((total, { value }) => total + value, 0) || 0
  );
});

const totalSubscriptionsCount = computed<number>(() => {
  return subscriptions.value?.length || 0;
});
</script>
