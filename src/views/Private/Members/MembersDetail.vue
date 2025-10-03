<template>
  <article
    class="mx-auto flex w-full max-w-7xl flex-col pb-12 max-sm:grow sm:min-h-full sm:px-6 sm:pb-24 lg:px-8">
    <section class="mt-6 flex flex-row flex-wrap px-3 sm:mt-40 sm:px-0">
      <div class="min-w-48 shrink grow basis-0" />
      <header class="flex w-full max-w-2xl shrink-0 grow flex-col">
        <div class="flex flex-row space-x-5 sm:ml-8">
          <LoadingSpinner v-if="isPendingMember" class="size-16" />
          <component
            v-else
            :is="member?.picture ? 'button' : 'figure'"
            class="group relative shrink-0 self-start rounded-full"
            :inert="!member?.picture"
            @click="() => (state.isPictureDialogVisible = true)">
            <MembersThumbnail
              class="size-16"
              :email="member?.email"
              :name="fullname"
              :thumbnail="member?.thumbnail" />
            <div
              v-if="member?.picture"
              class="absolute inset-0 flex rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-60">
              <SvgIcon
                aria-hidden="true"
                class="m-auto size-8 text-white"
                :path="mdiMagnifyPlusOutline"
                type="mdi" />
            </div>
            <span
              v-if="member?.attending"
              class="absolute bottom-0.5 right-0.5 block size-3 rounded-full bg-emerald-500 ring-4 ring-slate-50 dark:ring-stone-900" />
          </component>
          <div v-if="isPendingMember" class="flex flex-col gap-1">
            <LoadingSkeleton class="h-8 w-48 rounded-xl" />
            <LoadingSkeleton class="my-1 h-4 w-64" />
            <LoadingSkeleton class="my-0.5 h-6 w-24 rounded-full" />
          </div>
          <AppAlert
            v-else-if="memberErrorText"
            :description="memberErrorText"
            :title="$t('members.detail.onFetch.fail')"
            type="error" />
          <div v-else-if="member" class="flex flex-col gap-1">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{ fullname || member.email }}
            </h1>
            <i18n-t
              v-if="member.attending"
              class="text-sm font-medium text-gray-500 dark:text-gray-400"
              keypath="members.detail.profile.attending"
              scope="global"
              tag="p">
              <template v-if="!!member.location" #location>
                <span class="inline font-medium text-gray-900 dark:text-gray-100">
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
                  class="mr-1 inline-block lowercase text-gray-900 dark:text-gray-100"
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
                <span class="inline-block">
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
          firstActivityDate &&
          lastActivityDate && {
            class:
              firstActivityDate.isBefore(dayjs().subtract(6, 'months')) && 'overflow-x-auto pr-2',
            endDate: lastActivityDate.format('YYYY-MM-DD'),
            startDate: firstActivityDate.format('YYYY-MM-DD'),
          }
        "
        :activity="activity"
        class="pl-2 max-sm:overflow-x-auto max-sm:pr-2"
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
        class="mt-3 self-start max-sm:mx-3"
        :description="activityErrorText"
        :title="$t('members.detail.attendance.onFetch.fail')"
        type="error" />

      <template #title>
        <h2 class="mx-3 text-3xl font-bold tracking-tight text-gray-900 sm:mx-0 dark:text-gray-100">
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
                <LoadingSkeleton v-if="isPendingMember" class="mb-1 h-8 w-32 rounded-3xl" />
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
      class="mt-16 px-3 sm:px-0"
      :description="$t('members.detail.audit.description')"
      :title="$t('members.detail.audit.title')">
      <MemberHistoryPanel :member-id="memberId" />
    </SectionRow>

    <SectionRow
      class="mt-16 px-3 sm:px-0"
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
          v-if="!isNil(member?.wpUserId)"
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
          :member-id="memberId"
          :remaining="member?.balance" />
        <SubscriptionsListPanel
          class="max-h-[32rem] min-w-64 shrink grow basis-0"
          :member-id="memberId" />
        <MembershipsListPanel
          class="max-h-[32rem] min-w-64 shrink grow basis-0"
          :member-id="memberId" />
      </div>

      <template #append>
        <dl class="sticky top-3 flex flex-row flex-wrap gap-3">
          <AppPanel class="flex min-w-48 shrink grow basis-0 flex-col">
            <dt class="truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
              {{ $t('members.detail.orders.spent.daily.label') }}
            </dt>
            <i18n-t
              class="mt-1 text-gray-800 dark:text-gray-200"
              keypath="members.detail.orders.spent.daily.value"
              :plural="dailyAmountConsumed"
              scope="global"
              tag="dd">
              <template #amount>
                <AnimatedCounter
                  class="block text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
                  :duration="1"
                  :format="fractionAmount"
                  :to="dailyAmountConsumed" />
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
      <RouterView
        :member="member"
        :member-id="memberId"
        :non-compliant-activity="nonCompliantActivity" />
    </SideDialog>

    <AppDialog
      v-model="state.isPictureDialogVisible"
      dialog-class="max-w-xl relative overflow-hidden">
      <img
        v-if="member?.picture"
        class="max-h-[80vh] w-full rounded-md object-contain"
        :src="member.picture" />
      <AppButtonIcon
        class="absolute right-3 top-3 bg-black/40 !text-white hover:!bg-black/60 dark:focus:ring-offset-neutral-800"
        :icon="mdiClose"
        :title="$t('action.close')"
        @click="() => (state.isPictureDialogVisible = false)" />
    </AppDialog>
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
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppAlert from '@/components/form/AppAlert.vue';
import AppButtonIcon from '@/components/form/AppButtonIcon.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppButtonText from '@/components/form/AppButtonText.vue';
import AppSegmentedControl from '@/components/form/AppSegmentedControl.vue';
import AppDialog from '@/components/layout/AppDialog.vue';
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
import { membersQueryKeys, useAppQuery } from '@/services/query';
import {
  mdiClose,
  mdiInformationOutline,
  mdiMagnifyPlusOutline,
  mdiOpenInNew,
  mdiPlus,
} from '@mdi/js';
import { useHead } from '@unhead/vue';
import dayjs from 'dayjs';
import { compact, isNil } from 'lodash';
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const state = reactive({
  shouldRenderAllActivity: false as boolean,
  isPictureDialogVisible: false as boolean,
});

const head = useHead({
  titleTemplate: (title?: string) =>
    compact([
      title,
      compact([member.value?.firstName, member.value?.lastName]).join(' '),
      i18n.t('head.title'),
    ]).join(' - '),
});

const {
  isPending: isPendingMember,
  data: member,
  errorText: memberErrorText,
} = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.byId(props.memberId),
    queryFn: () => getMember(props.memberId),
  })),
);

const {
  isFetching: isFetchingActivity,
  data: activity,
  errorText: activityErrorText,
} = useAppQuery(
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

const fullname = computed<string>(() =>
  [member.value?.firstName, member.value?.lastName].filter(Boolean).join(' '),
);

const firstActivityDate = computed(() => {
  if (activity.value?.length) {
    return dayjs(Math.min(...activity.value.map(({ date }) => dayjs(date).valueOf())));
  }
  return null;
});

const lastActivityDate = computed(() => {
  if (activity.value?.length) {
    return dayjs(Math.max(...activity.value.map(({ date }) => dayjs(date).valueOf())));
  }
  return null;
});

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

const dailyAmountConsumed = computed<number>(() => {
  return activity.value?.length ? totalAmountSpent.value / activity.value?.length : 0;
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
  () => props.memberId,
  (newMemberId, oldMemberId) => {
    // scroll to top to let the user know that member has changed
    if (newMemberId !== oldMemberId) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      head.patch({
        titleTemplate: (title?: string) =>
          compact([
            title,
            compact([member.value?.firstName, member.value?.lastName]).join(' '),
            i18n.t('head.title'),
          ]).join(' - '),
      });
    }
  },
);
</script>
