<template>
  <article
    class="mx-auto mb-12 flex w-full max-w-7xl flex-col max-sm:grow sm:mb-24 sm:min-h-full sm:px-6 lg:px-8">
    <LoadingSpinner v-if="isPendingMember" class="m-auto size-16" />
    <ErrorState
      v-else-if="memberErrorText"
      class="m-auto"
      :description="memberErrorText"
      :title="$t('members.detail.onFetch.fail')" />
    <template v-else-if="member">
      <!-- trick to trigger useHead.titleTemplate -->
      <Head><title></title></Head>
      <section class="mt-6 flex flex-row flex-wrap px-3 sm:mt-40 sm:px-0">
        <div class="min-w-48 shrink grow basis-0" />
        <header class="flex w-full max-w-2xl shrink-0 grow flex-col">
          <div class="flex flex-row space-x-5 sm:ml-8">
            <component
              :is="member.picture ? 'a' : 'figure'"
              class="group relative shrink-0 self-start rounded-full"
              v-bind="{
                ...(member.picture && {
                  href: member.picture,
                  target: '_blank',
                }),
              }">
              <MembersThumbnail
                class="size-16"
                :email="member.email"
                :name="fullname"
                :thumbnail="member.thumbnail" />
              <div
                v-if="member.picture"
                class="absolute inset-0 flex rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-60">
                <SvgIcon
                  aria-hidden="true"
                  class="m-auto size-8 text-white"
                  :path="mdiMagnifyPlusOutline"
                  type="mdi" />
              </div>
              <span
                v-if="member.attending"
                class="absolute bottom-0.5 right-0.5 block size-3 rounded-full bg-emerald-500 ring-4 ring-slate-50" />
            </component>
            <div class="flex flex-col gap-1">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {{ fullname || member.email }}
              </h1>
              <i18n-t
                v-if="member?.attending"
                class="text-sm font-medium text-gray-500 dark:text-gray-400"
                keypath="members.detail.profile.attending"
                scope="global"
                tag="p">
                <template v-if="!!member?.location" #location>
                  <span class="font-medium text-gray-900 dark:text-gray-100">
                    {{ $t(`members.detail.profile.location.${member.location}`) }}
                  </span>
                </template>
              </i18n-t>
              <i18n-t
                v-else-if="!!member.lastSeen"
                class="text-sm font-medium text-gray-500 dark:text-gray-400"
                keypath="members.detail.profile.lastSeen"
                scope="global"
                tag="p">
                <template #date>
                  <time
                    class="lowercase text-gray-900 dark:text-gray-100"
                    :datetime="member.lastSeen"
                    :title="dayjs(member.lastSeen).format('llll')">
                    {{
                      dayjs().diff(member.lastSeen, 'hour') < 1
                        ? dayjs(member.lastSeen).fromNow()
                        : dayjs(member.lastSeen).calendar(dayjs())
                    }}
                  </time>
                </template>
                <template v-if="!!member?.location" #location>
                  <span>
                    {{ $t(`members.detail.profile.location.${member.location}`) }}
                  </span>
                </template>
              </i18n-t>
              <div class="mt-1 flex flex-row flex-wrap items-center gap-2">
                <span
                  v-if="isMemberBalanceInsufficient(member)"
                  class="shrink basis-0 whitespace-nowrap rounded-full bg-red-500/10 px-2 py-0.5 text-center text-xs leading-6 text-red-400 ring-1 ring-inset ring-red-500/20">
                  {{
                    $t('members.detail.orders.tickets.overconsumed', {
                      count: Math.abs(member.balance),
                    })
                  }}
                </span>
                <span
                  v-if="member.membershipOk"
                  class="shrink basis-0 whitespace-nowrap rounded-full bg-indigo-500/10 px-2 py-0.5 text-center text-xs leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                  {{ $t('members.detail.membership.current', { year: member.lastMembership }) }}
                </span>
                <span
                  v-else
                  class="shrink basis-0 whitespace-nowrap rounded-full bg-neutral-500/10 px-2 py-0.5 text-center text-xs leading-6 text-neutral-500 ring-1 ring-inset ring-neutral-500/20">
                  {{
                    member.lastMembership
                      ? $t('members.detail.membership.last', { year: member.lastMembership })
                      : $t('members.detail.membership.none')
                  }}
                </span>
                <VTooltip v-if="member.trustedUser">
                  <span
                    class="flex shrink basis-0 flex-row items-center gap-1 whitespace-nowrap rounded-full bg-indigo-500/10 px-2 py-0.5 text-center text-xs leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                    {{ $t('members.detail.status.trusted.label') }}
                    <SvgIcon
                      aria-hidden="true"
                      class="size-4"
                      :path="mdiInformationOutline"
                      type="mdi" />
                  </span>
                  <template #popper>
                    <span class="overflow-hidden whitespace-pre-line text-sm">
                      {{ $t('members.detail.status.trusted.description') }}
                    </span>
                  </template>
                </VTooltip>
                <VTooltip v-if="member.activeUser">
                  <span
                    class="flex shrink basis-0 flex-row items-center gap-1 whitespace-nowrap rounded-full bg-indigo-500/10 px-2 py-0.5 text-center text-xs leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                    {{ $t('members.detail.status.voting.label') }}
                    <SvgIcon
                      aria-hidden="true"
                      class="size-4"
                      :path="mdiInformationOutline"
                      type="mdi" />
                  </span>
                  <template #popper>
                    <span class="overflow-hidden whitespace-pre-line text-sm">
                      {{ $t('members.detail.status.voting.description') }}
                    </span>
                  </template>
                </VTooltip>
              </div>
            </div>
          </div>
        </header>

        <div class="min-w-48 shrink grow basis-0" />
      </section>

      <SectionRow class="mt-6">
        <LoadingSpinner v-if="isFetchingActivity" class="mx-auto h-[172px] w-12" />
        <ActivityGraph
          v-else
          :key="`activity-graph-${state.shouldRenderAllActivity}`"
          v-bind="
            state.shouldRenderAllActivity &&
            activity?.length && {
              class: 'overflow-x-scroll',
              endDate: dayjs(Math.max(...activity.map(({ date }) => dayjs(date).valueOf()))).format(
                'YYYY-MM-DD',
              ),
              startDate: dayjs(
                Math.min(...activity.map(({ date }) => dayjs(date).valueOf())),
              ).format('YYYY-MM-DD'),
            }
          "
          :activity="activity"
          class="px-2"
          :non-compliant-activity="nonCompliantActivity" />

        <div class="mt-1 flex flex-row flex-wrap items-center justify-between gap-3 max-sm:mx-3">
          <AppSegmentedControl
            v-model="state.shouldRenderAllActivity"
            :format="
              (option: boolean) =>
                option
                  ? $t('members.detail.attendance.period.allTime')
                  : $t('members.detail.attendance.period.last6Months')
            "
            hide-details
            :options="[false, true]" />

          <AppButtonPlain
            class="self-start dark:focus:ring-offset-stone-900"
            color="neutral"
            :icon="mdiPlus"
            replace
            :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.ACTIVITY.NEW }">
            {{ $t('members.detail.attendance.add') }}
          </AppButtonPlain>
        </div>
        <AppAlert
          v-if="activityErrorText"
          class="mx-3 mt-3 self-start sm:mx-12"
          :description="activityErrorText"
          :title="$t('members.detail.attendance.onFetch.fail')"
          type="error" />

        <template #title>
          <h2
            class="mx-3 text-3xl font-bold tracking-tight text-gray-900 sm:mx-0 dark:text-gray-100">
            {{ $t('members.detail.attendance.title') }}
          </h2>
        </template>
        <template #description>
          <p class="mx-3 mt-1 whitespace-pre-line text-sm text-gray-500 sm:mx-0 dark:text-gray-400">
            {{ $t('members.detail.attendance.description') }}
          </p>
        </template>
        <template #append>
          <dl class="sticky top-3 flex flex-row flex-wrap gap-3 px-3 sm:px-0">
            <AppPanel class="flex min-w-48 shrink grow basis-0 flex-col">
              <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                {{ $t('members.detail.attendance.summary.label') }}
              </dt>
              <i18n-t
                class="mt-1 text-gray-800 dark:text-gray-200"
                :keypath="
                  state.shouldRenderAllActivity
                    ? 'members.detail.attendance.summary.allTime'
                    : 'members.detail.attendance.summary.last6Months'
                "
                scope="global"
                tag="dd">
                <template #amount>
                  <div
                    v-if="isFetchingActivity"
                    class="mb-1 h-8 w-32 animate-pulse rounded-3xl bg-slate-200" />
                  <span
                    v-else-if="!periodAttendance"
                    class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                    {{ $t('members.detail.attendance.summary.empty') }}
                  </span>
                  <i18n-t
                    v-else
                    class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
                    keypath="members.detail.attendance.summary.value"
                    :plural="periodAttendance"
                    scope="global"
                    tag="span">
                    <template #count>
                      <AnimatedCounter
                        :duration="1"
                        :format="
                          (amount: number) =>
                            formatAmount(amount, {
                              style: 'decimal',
                              maximumFractionDigits: 1,
                            })
                        "
                        :to="periodAttendance" />
                    </template>
                  </i18n-t>
                </template>
              </i18n-t>
            </AppPanel>
          </dl>
        </template>
      </SectionRow>

      <SectionRow
        class="mt-8 px-3 sm:px-0"
        :description="$t('members.detail.audit.description')"
        :title="$t('members.detail.audit.title')">
        <MemberHistoryPanel :member="member" />
      </SectionRow>

      <SectionRow
        class="mt-16 px-3 sm:px-0"
        :description="$t('members.detail.profile.description')"
        :title="$t('members.detail.profile.title')">
        <MemberProfilePanel :member="member" />
        <MemberDevicesPanel class="mt-3" :member="member" />
        <MemberCapabilitesPanel class="mt-3" :member="member" />
        <MemberWordpressPanel class="mt-3" :member="member" />
        <MemberImpersonationPanel class="mt-3" :member="member" />

        <template #append>
          <dl class="sticky top-3 flex flex-row flex-wrap gap-3">
            <AppPanel class="flex min-w-48 shrink grow basis-0 flex-col">
              <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                {{ $t('members.detail.profile.since.label') }}
              </dt>
              <dd
                class="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                {{ dayjs(member.created).format('ll') }}
              </dd>
            </AppPanel>

            <AppPanel class="flex min-w-48 shrink grow basis-0 flex-col">
              <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                {{ $t('members.detail.orders.tickets.used.label') }}
              </dt>
              <i18n-t
                class="mt-1 text-gray-800 dark:text-gray-200"
                keypath="members.detail.orders.tickets.used.text"
                :plural="totalTicketsUsed"
                scope="global"
                tag="dd">
                <template #count>
                  <i18n-t
                    class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
                    keypath="members.detail.orders.tickets.used.count"
                    :plural="totalTicketsUsed"
                    scope="global"
                    tag="strong">
                    <AnimatedCounter
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
              <i18n-t
                class="mt-1 text-gray-800 dark:text-gray-200"
                keypath="members.detail.orders.subscriptions.coverage.text"
                :plural="attendanceCoveredBySubscriptions"
                scope="global"
                tag="dd">
                <template #attendance>
                  <i18n-t
                    class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
                    keypath="members.detail.orders.subscriptions.coverage.attendance"
                    :plural="attendanceCoveredBySubscriptions"
                    scope="global"
                    tag="strong">
                    <AnimatedCounter
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

      <SectionRow class="mt-16 px-3 sm:px-0" :title="$t('members.detail.orders.title')">
        <template #description>
          <p class="mt-1 whitespace-pre-line text-sm text-gray-500 dark:text-gray-400">
            {{ $t('members.detail.orders.description') }}
          </p>

          <AppButtonText
            v-if="!isNil(member.wpUserId)"
            class="mt-5 self-start dark:focus:ring-offset-stone-900"
            color="indigo"
            :href="buildMemberWordpressOrdersUrl(member.wpUserId)"
            :icon="mdiOpenInNew"
            target="_blank">
            {{ $t('members.detail.wordpress.orders') }}
          </AppButtonText>
        </template>

        <div class="flex min-h-full flex-row flex-wrap items-stretch gap-3">
          <TicketsListPanel
            class="max-h-[32rem] min-w-64 shrink grow basis-0"
            :member-id="id"
            :remaining="member.balance" />
          <SubscriptionsListPanel
            class="max-h-[32rem] min-w-64 shrink grow basis-0"
            :member-id="id" />
          <MembershipsListPanel
            class="max-h-[32rem] min-w-64 shrink grow basis-0"
            :member-id="id" />
        </div>

        <template #append>
          <dl class="sticky top-3 flex flex-row flex-wrap gap-3">
            <AppPanel class="flex min-w-48 shrink grow basis-0 flex-col">
              <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                {{ $t('members.detail.orders.spent.monthly.label') }}
              </dt>
              <i18n-t
                class="mt-1 text-gray-800 dark:text-gray-200"
                keypath="members.detail.orders.spent.monthly.value"
                scope="global"
                tag="dd">
                <template #amount>
                  <AnimatedCounter
                    class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
                    :duration="1"
                    :format="fractionAmount"
                    :to="monthlyAmountSpent" />
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
                  <AnimatedCounter
                    class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
                    :duration="1"
                    :format="fractionAmount"
                    :to="totalAmountSpent" />
                </template>
              </i18n-t>
            </AppPanel>
          </dl>
        </template>
      </SectionRow>
    </template>

    <SideDialog
      :model-value="
        [
          ROUTE_NAMES.MEMBERS.DETAIL.TICKETS.NEW,
          ROUTE_NAMES.MEMBERS.DETAIL.TICKETS.DETAIL,
          ROUTE_NAMES.MEMBERS.DETAIL.SUBSCRIPTIONS.NEW,
          ROUTE_NAMES.MEMBERS.DETAIL.SUBSCRIPTIONS.DETAIL,
          ROUTE_NAMES.MEMBERS.DETAIL.MEMBERSHIPS.NEW,
          ROUTE_NAMES.MEMBERS.DETAIL.MEMBERSHIPS.DETAIL,
          ROUTE_NAMES.MEMBERS.DETAIL.ACTIVITY.NEW,
          ROUTE_NAMES.MEMBERS.DETAIL.ACTIVITY.DETAIL,
        ].includes(route.name as string)
      "
      @update:model-value="router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX })">
      <RouterView :member="member" :member-id="id" :non-compliant-activity="nonCompliantActivity" />
    </SideDialog>
  </article>
</template>

<script setup lang="ts">
import ActivityGraph from './Detail/Activity/ActivityGraph.vue';
import MemberCapabilitesPanel from './Detail/MemberCapabilitesPanel.vue';
import MemberDevicesPanel from './Detail/MemberDevicesPanel.vue';
import MemberHistoryPanel from './Detail/MemberHistoryPanel.vue';
import MemberImpersonationPanel from './Detail/MemberImpersonationPanel.vue';
import MemberProfilePanel from './Detail/MemberProfilePanel.vue';
import MemberWordpressPanel from './Detail/MemberWordpressPanel.vue';
import MembershipsListPanel from './Detail/Memberships/MembershipsListPanel.vue';
import SectionRow from './Detail/SectionRow.vue';
import SubscriptionsListPanel from './Detail/Subscriptions/SubscriptionsListPanel.vue';
import TicketsListPanel from './Detail/Tickets/TicketsListPanel.vue';
import MembersThumbnail from './MembersThumbnail.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppAlert from '@/components/form/AppAlert.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppButtonText from '@/components/form/AppButtonText.vue';
import AppSegmentedControl from '@/components/form/AppSegmentedControl.vue';
import AppPanel from '@/components/layout/AppPanel.vue';
import SideDialog from '@/components/layout/SideDialog.vue';
import { formatAmount, fractionAmount } from '@/helpers/currency';
import { ROUTE_NAMES } from '@/router/names';
import {
  buildMemberWordpressOrdersUrl,
  getMember,
  getMemberActivity,
  isMemberBalanceInsufficient,
} from '@/services/api/members';
import { getAllMemberMemberships } from '@/services/api/memberships';
import { getAllMemberSubscriptions } from '@/services/api/subscriptions';
import { getAllMemberTickets } from '@/services/api/tickets';
import { useAppQuery } from '@/services/query';
import { mdiInformationOutline, mdiMagnifyPlusOutline, mdiOpenInNew, mdiPlus } from '@mdi/js';
import { useHead } from '@unhead/vue';
import { Head } from '@unhead/vue/components';
import dayjs from 'dayjs';
import { isNil } from 'lodash';
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const state = reactive({
  shouldRenderAllActivity: false as boolean,
});

useHead({
  titleTemplate: (title?: string) =>
    [
      title,
      [member.value?.firstName, member.value?.lastName].filter(Boolean).join(' '),
      i18n.t('head.title'),
    ]
      .filter(Boolean)
      .join(' - '),
});

const {
  isPending: isPendingMember,
  data: member,
  errorText: memberErrorText,
} = useAppQuery({
  queryKey: ['members', computed(() => props.id)],
  queryFn: () => getMember(props.id),
  retry: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

const {
  isFetching: isFetchingActivity,
  data: activity,
  errorText: activityErrorText,
} = useAppQuery({
  queryKey: ['members', computed(() => props.id), 'activity'],
  queryFn: () => getMemberActivity(props.id),
  retry: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

const { data: tickets } = useAppQuery({
  queryKey: ['members', computed(() => props.id), 'tickets'],
  queryFn: () => getAllMemberTickets(props.id),
  retry: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

const { data: subscriptions } = useAppQuery({
  queryKey: ['members', computed(() => props.id), 'subscriptions'],
  queryFn: () => getAllMemberSubscriptions(props.id),
  retry: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

const { data: memberships } = useAppQuery({
  queryKey: ['members', computed(() => props.id), 'memberships'],
  queryFn: () => getAllMemberMemberships(props.id),
  retry: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

const fullname = computed<string>(() =>
  [member.value?.firstName, member.value?.lastName].filter(Boolean).join(' '),
);

const periodAttendance = computed<number>(() => {
  return (
    (state.shouldRenderAllActivity ? member.value?.totalActivity : member.value?.activity) || 0
  );
});

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

const monthlyAmountSpent = computed<number>(() => {
  if (member.value) {
    const [lastActivity] = (activity.value || [])
      .filter(({ value }) => value > 0)
      .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));

    const totalMonths =
      Math.ceil(
        Math.abs(
          dayjs(lastActivity?.date || member.value.lastSeen).diff(
            member.value.created,
            'month',
            true,
          ),
        ),
      ) || 1;

    return totalAmountSpent.value / totalMonths;
  }
  return 0;
});

const nonCompliantActivity = computed(() => {
  const balance = member.value?.balance || 0;
  if (balance < 0 && activity.value?.length) {
    const ticketActivities = activity.value
      .filter(({ type, value }) => type === 'ticket' && value > 0)
      .sort((a, b) => dayjs(b.date).diff(a.date));

    let remainingDebt = Math.abs(balance);
    const nonCompliantAttendance = [];
    for (const { date, value, type } of ticketActivities) {
      if (remainingDebt <= 0) {
        break;
      }

      const debt = value > remainingDebt ? remainingDebt : value;
      nonCompliantAttendance.push({
        date,
        value: debt,
        type,
      });
      remainingDebt -= debt;
    }
    return nonCompliantAttendance;
  }

  return [];
});

watch(
  () => props.id,
  (newId, oldId) => {
    // scroll to top to let the user know that member has changed
    if (newId !== oldId) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  },
);
</script>
