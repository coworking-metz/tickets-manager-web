<template>
  <article
    class="mx-auto mb-12 flex w-full max-w-7xl flex-col max-sm:grow sm:mb-24 sm:min-h-full sm:px-6 lg:px-8">
    <LoadingSpinner v-if="isPendingMember" class="m-auto size-16" />
    <ErrorState
      v-else-if="memberError"
      class="m-auto"
      :description="memberError"
      :title="$t('members.detail.onFetch.fail')" />
    <template v-else-if="member">
      <!-- trick to trigger useHead.titleTemplate -->
      <Head><title></title></Head>
      <section class="mt-6 flex flex-row flex-wrap px-3 sm:mt-40 sm:px-0">
        <div class="min-w-48 shrink grow basis-0" />
        <header class="flex w-full max-w-2xl shrink-0 grow flex-col">
          <div class="flex flex-row space-x-5 sm:ml-8">
            <MembersThumbnail
              class="size-16 shrink-0"
              :email="member.email"
              :name="fullname"
              :thumbnail="member.thumbnail">
              <span
                v-if="member.attending"
                class="absolute bottom-0.5 right-0.5 block size-3 rounded-full bg-emerald-500 ring-4 ring-slate-50" />
            </MembersThumbnail>
            <div class="flex flex-col gap-1">
              <h1 class="text-2xl font-bold text-gray-900">
                {{ fullname || member.email }}
              </h1>
              <i18n-t
                v-if="member?.attending"
                class="text-sm font-medium text-gray-500"
                keypath="members.detail.profile.attending"
                scope="global"
                tag="p">
                <template v-if="!!member?.location" #location>
                  <span class="font-medium text-gray-900">
                    {{ $t(`members.detail.profile.location.${member.location}`) }}
                  </span>
                </template>
              </i18n-t>
              <i18n-t
                v-else-if="!!member.lastSeen"
                class="text-sm font-medium text-gray-500"
                keypath="members.detail.profile.lastSeen"
                scope="global"
                tag="p">
                <template #date>
                  <time
                    class="lowercase text-gray-900"
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
                  v-if="member.balance < 0"
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
        <LoadingSpinner v-if="isFetchingActivity" class="m-auto size-12" />
        <ActivityGraph
          v-else-if="activity"
          :key="`activity-graph-${state.shouldRenderAllActivity}`"
          v-bind="
            state.shouldRenderAllActivity &&
            activity.length && {
              class: 'overflow-x-auto',
              endDate: dayjs(Math.max(...activity.map(({ date }) => dayjs(date).valueOf()))).format(
                'YYYY-MM-DD',
              ),
              startDate: dayjs(
                Math.min(...activity.map(({ date }) => dayjs(date).valueOf())),
              ).format('YYYY-MM-DD'),
            }
          "
          :activity="activity"
          class="max-sm:overflow-x-auto"
          :non-compliant-activity="nonCompliantActivity" />
        <template #title>
          <h2 class="mx-3 text-3xl font-bold tracking-tight text-gray-900 sm:mx-0">
            {{ $t('members.detail.attendance.title') }}
          </h2>
        </template>
        <template #description>
          <p class="mx-3 mt-1 whitespace-pre-line text-sm text-gray-500 sm:mx-0">
            {{ $t('members.detail.attendance.description') }}
          </p>
        </template>
        <template #append>
          <dl class="sticky top-3 flex flex-row flex-wrap gap-3 px-3 sm:px-0">
            <div
              class="flex min-w-48 shrink grow basis-0 flex-col overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt class="truncate font-medium text-gray-500 sm:text-sm">
                {{ $t('members.detail.attendance.summary.label') }}
              </dt>
              <i18n-t
                class="mt-1"
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
                    class="block text-3xl font-semibold tracking-tight text-gray-900">
                    {{ $t('members.detail.attendance.summary.empty') }}
                  </span>
                  <i18n-t
                    v-else
                    class="block text-3xl font-semibold tracking-tight text-gray-900"
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

              <RadioGroup
                v-model="state.shouldRenderAllActivity"
                class="mt-3 flex gap-1 self-start rounded-lg bg-slate-100 p-0.5 transition-colors sm:mx-0">
                <RadioGroupOption
                  v-for="option in [false, true]"
                  :key="`activity-option-${option}`"
                  as="template"
                  :value="option"
                  v-slot="{ checked }">
                  <button
                    :class="[
                      'flex items-center rounded-md p-1.5 pl-2.5 pr-3.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100',
                      checked
                        ? 'bg-white shadow-sm ring-1 ring-black ring-opacity-[5%]'
                        : 'hover:bg-white/80',
                    ]">
                    <RadioGroupLabel
                      as="span"
                      :class="[
                        'text-gray-600 group-hover:text-gray-900',
                        checked && 'text-gray-900',
                      ]">
                      {{
                        option
                          ? $t('members.detail.attendance.period.allTime')
                          : $t('members.detail.attendance.period.last6Months')
                      }}
                    </RadioGroupLabel>
                  </button>
                </RadioGroupOption>
              </RadioGroup>
            </div>
          </dl>
        </template>
      </SectionRow>

      <SectionRow
        class="mt-16 px-3 sm:px-0"
        :description="$t('members.detail.audit.description')"
        :title="$t('members.detail.audit.title')">
        <MemberHistoryPanel :member="member" />
      </SectionRow>

      <SectionRow
        class="mt-16 px-3 sm:px-0"
        :description="$t('members.detail.profile.description')"
        :title="$t('members.detail.profile.title')">
        <ProfilePanel :member="member" @update:member="refetchMember" />
        <WordpressPanel class="mt-3" :member="member" @update:member="refetchMember" />

        <template #append>
          <dl class="sticky top-3 flex flex-row flex-wrap gap-3">
            <div
              class="min-w-48 shrink grow basis-0 overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt class="truncate font-medium text-gray-500 sm:text-sm">
                {{ $t('members.detail.profile.since.label') }}
              </dt>
              <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {{ dayjs(member.created).format('YYYY') }}
              </dd>
            </div>

            <div
              class="min-w-48 shrink grow basis-0 overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt class="truncate font-medium text-gray-500 sm:text-sm">
                {{ $t('members.detail.orders.tickets.used.label') }}
              </dt>
              <i18n-t
                class="mt-1"
                keypath="members.detail.orders.tickets.used.value"
                :plural="totalTicketsUsed"
                scope="global"
                tag="dd">
                <template #count>
                  <AnimatedCounter
                    class="block text-3xl font-semibold tracking-tight text-gray-900"
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
                </template>
                <template #orders>
                  <i18n-t
                    keypath="members.detail.orders.tickets.used.orders"
                    :plural="totalTicketsCount"
                    scope="global"
                    tag="span">
                    <template #count>
                      <AnimatedCounter
                        class="inline-block font-bold tracking-tight text-gray-900"
                        :duration="1"
                        :format="
                          (count: number) =>
                            formatAmount(count, {
                              style: 'decimal',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 1,
                            })
                        "
                        :to="totalTicketsCount" />
                    </template>
                  </i18n-t>
                </template>
              </i18n-t>
            </div>
          </dl>
        </template>
      </SectionRow>

      <SectionRow class="mt-16 px-3 sm:px-0" :title="$t('members.detail.orders.title')">
        <template #description>
          <p class="mt-1 whitespace-pre-line text-sm text-gray-500">
            {{ $t('members.detail.orders.description') }}
          </p>

          <a
            v-if="!isNil(member.wpUserId)"
            class="group mt-5 flex flex-row items-center gap-x-3 self-start rounded-md border border-transparent px-4 py-2 font-medium text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
            :href="buildMemberWordpressOrdersUrl(member.wpUserId)"
            target="_blank">
            <SvgIcon
              aria-hidden="true"
              class="size-5 text-indigo-500 group-hover:text-indigo-700"
              :path="mdiOpenInNew"
              type="mdi" />
            <span>{{ $t('members.detail.wordpress.orders') }}</span>
          </a>
        </template>

        <div class="flex min-h-full flex-row flex-wrap items-stretch gap-3">
          <TicketsListPanel
            class="max-h-[40rem] min-w-64 shrink grow basis-0"
            :loading="isFetchingTickets"
            :remaining="member.balance"
            :tickets="tickets" />
          <SubscriptionsListPanel
            :active="
              subscriptions?.some(({ started, ended }) =>
                dayjs().isBetween(started, ended, 'day', '[]'),
              )
            "
            class="max-h-[40rem] min-w-64 shrink grow basis-0"
            :loading="isFetchingSubscriptions"
            :subscriptions="subscriptions" />
        </div>

        <template #append>
          <dl class="sticky top-3 flex flex-row flex-wrap gap-3">
            <div
              class="min-w-48 shrink grow basis-0 overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt class="truncate font-medium text-gray-500 sm:text-sm">
                {{ $t('members.detail.orders.spent.monthly.label') }}
              </dt>
              <i18n-t
                class="mt-1"
                keypath="members.detail.orders.spent.monthly.value"
                scope="global"
                tag="dd">
                <template #amount>
                  <AnimatedCounter
                    class="block text-3xl font-semibold tracking-tight text-gray-900"
                    :duration="1"
                    :format="fractionAmount"
                    :to="monthlyAmountSpent" />
                </template>
              </i18n-t>
            </div>
            <div
              class="min-w-48 shrink grow basis-0 overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt class="truncate font-medium text-gray-500 sm:text-sm">
                {{ $t('members.detail.orders.spent.total.label') }}
              </dt>
              <i18n-t
                class="mt-1"
                keypath="members.detail.orders.spent.total.value"
                :plural="totalAmountSpent"
                scope="global"
                tag="dd">
                <template #count>
                  <AnimatedCounter
                    class="block text-3xl font-semibold tracking-tight text-gray-900"
                    :duration="1"
                    :format="fractionAmount"
                    :to="totalAmountSpent" />
                </template>
              </i18n-t>
            </div>
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
          ROUTE_NAMES.MEMBERS.DETAIL.ACTIVITY.DETAIL,
        ].includes($route.name as string)
      "
      @close="$router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX })">
      <RouterView
        :activity="activity"
        :loading="
          isFetchingMember || isFetchingActivity || isFetchingSubscriptions || isFetchingTickets
        "
        :member="member"
        :member-id="id"
        :non-compliant-activity="nonCompliantActivity"
        :subscriptions="subscriptions"
        :tickets="tickets" />
    </SideDialog>
  </article>
</template>

<script setup lang="ts">
import ActivityGraph from './Detail/Activity/ActivityGraph.vue';
import MemberHistoryPanel from './Detail/MemberHistoryPanel.vue';
import ProfilePanel from './Detail/ProfilePanel.vue';
import SectionRow from './Detail/SectionRow.vue';
import SubscriptionsListPanel from './Detail/Subscriptions/SubscriptionsListPanel.vue';
import TicketsListPanel from './Detail/Tickets/TicketsListPanel.vue';
import WordpressPanel from './Detail/WordpressPanel.vue';
import MembersThumbnail from './MembersThumbnail.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import SideDialog from '@/components/layout/SideDialog.vue';
import { formatAmount, fractionAmount } from '@/helpers/currency';
import { isSilentError } from '@/helpers/errors';
import { ROUTE_NAMES } from '@/router/names';
import {
  buildMemberWordpressOrdersUrl,
  getMember,
  getMemberActivity,
} from '@/services/api/members';
import { getAllMemberSubscriptions } from '@/services/api/subscriptions';
import { getAllMemberTickets } from '@/services/api/tickets';
import { useNotificationsStore } from '@/store/notifications';
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue';
import { mdiInformationOutline, mdiOpenInNew } from '@mdi/js';
import { useQuery } from '@tanstack/vue-query';
import { useHead } from '@unhead/vue';
import { Head } from '@unhead/vue/components';
import dayjs from 'dayjs';
import { isNil } from 'lodash';
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  ticketId: {
    type: String,
    default: null,
  },
  subscriptionId: {
    type: String,
    default: null,
  },
});

const notificationsStore = useNotificationsStore();
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
  isFetching: isFetchingMember,
  data: member,
  error: memberError,
  refetch: refetchMember,
} = useQuery({
  queryKey: ['members', computed(() => props.id)],
  queryFn: ({ queryKey: [_, memberId] }) => getMember(memberId),
  retry: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

const {
  isFetching: isFetchingActivity,
  data: activity,
  error: activityError,
} = useQuery({
  queryKey: ['members', computed(() => props.id), 'activity'],
  queryFn: ({ queryKey: [_, memberId] }) => getMemberActivity(memberId),
  retry: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

watch(
  () => activityError.value,
  (error) => {
    if (error && !isSilentError(error)) {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.detail.attendance.onFetch.fail'),
      );
      // TODO: should report to Sentry
    }
  },
);

const {
  isFetching: isFetchingTickets,
  data: tickets,
  error: ticketsError,
} = useQuery({
  queryKey: ['members', computed(() => props.id), 'tickets'],
  queryFn: ({ queryKey: [_, memberId] }) => getAllMemberTickets(memberId),
  retry: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

watch(
  () => ticketsError.value,
  (error) => {
    if (error && !isSilentError(error)) {
      notificationsStore.addErrorNotification(error, i18n.t('members.detail.tickets.onFetch.fail'));
      // TODO: should report to Sentry
    }
  },
);

const {
  isFetching: isFetchingSubscriptions,
  data: subscriptions,
  error: subscriptionsError,
} = useQuery({
  queryKey: ['members', computed(() => props.id), 'subscriptions'],
  queryFn: ({ queryKey: [_, memberId] }) => getAllMemberSubscriptions(memberId),
  retry: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

watch(
  () => subscriptionsError.value,
  (error) => {
    if (error && !isSilentError(error)) {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.detail.subscriptions.onFetch.fail'),
      );
      // TODO: should report to Sentry
    }
  },
);

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

const totalAmountSpent = computed<number>(() => {
  const totalTicketsAmount = (tickets.value || []).reduce((total, ticket) => {
    return total + ticket.amount;
  }, 0);
  const totalSubscriptionsAmount = (subscriptions.value || []).reduce((total, subscription) => {
    return total + subscription.amount;
  }, 0);

  return totalTicketsAmount + totalSubscriptionsAmount;
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
      .filter(({ type }) => type === 'ticket')
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
</script>
