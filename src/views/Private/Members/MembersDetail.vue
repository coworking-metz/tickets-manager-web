<template>
  <article
    class="mx-auto mb-12 flex w-full max-w-7xl flex-col max-sm:grow sm:mb-24 sm:min-h-full sm:px-6 lg:px-8">
    <LoadingSpinner v-if="state.isFetchingMember" class="m-auto h-16 w-16" />
    <ErrorState
      v-else-if="state.fetchMemberErrorMessage"
      class="m-auto"
      :description="state.fetchMemberErrorMessage"
      :title="$t('members.detail.onFetch.fail')" />
    <template v-else-if="state.member">
      <!-- trick to trigger useHead.titleTemplate -->
      <Head><title></title></Head>
      <section class="mt-6 flex flex-row flex-wrap px-3 sm:mt-40 sm:px-0">
        <div class="min-w-[12rem] shrink grow basis-0" />
        <header class="flex w-full max-w-2xl shrink-0 grow flex-col">
          <div class="flex flex-row space-x-5 sm:ml-8">
            <div class="shrink-0">
              <div class="relative">
                <img
                  alt=""
                  class="h-16 w-16 rounded-full bg-gray-200"
                  :src="state.member.picture" />
                <span
                  v-if="
                    !!state.member.lastSeen && dayjs().diff(state.member.lastSeen, 'hour', true) < 1
                  "
                  class="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-400 ring-2 ring-white" />
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <h1 class="text-2xl font-bold text-gray-900">
                {{
                  [state.member.firstName, state.member.lastName].filter(Boolean).join(' ') ||
                  state.member.email
                }}
              </h1>
              <i18n-t
                v-if="!!state.member.lastSeen"
                class="text-sm font-medium text-gray-500"
                keypath="members.detail.header.description"
                scope="global"
                tag="p">
                <template #date>
                  <time
                    class="lowercase text-gray-900"
                    :datetime="state.member.lastSeen"
                    :title="dayjs(state.member.lastSeen).format('llll')">
                    {{
                      dayjs().isSame(state.member.lastSeen, 'day')
                        ? dayjs(state.member.lastSeen).fromNow()
                        : dayjs(state.member.lastSeen).calendar(dayjs())
                    }}
                  </time>
                </template>
              </i18n-t>
              <div class="mt-1 flex flex-row flex-wrap items-center gap-2">
                <span
                  v-if="state.member.balance < 0"
                  class="shrink basis-0 whitespace-nowrap rounded-full bg-red-500/10 px-2 py-0.5 text-center text-xs leading-6 text-red-400 ring-1 ring-inset ring-red-500/20">
                  {{
                    $t('members.detail.orders.tickets.overconsumed', {
                      count: Math.abs(state.member.balance),
                    })
                  }}
                </span>
                <span
                  v-if="state.member.membershipOk"
                  class="shrink basis-0 whitespace-nowrap rounded-full bg-indigo-500/10 px-2 py-0.5 text-center text-xs leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                  {{
                    $t('members.detail.membership.current', { year: state.member.lastMembership })
                  }}
                </span>
                <span
                  v-else
                  class="shrink basis-0 whitespace-nowrap rounded-full bg-neutral-500/10 px-2 py-0.5 text-center text-xs leading-6 text-neutral-500 ring-1 ring-inset ring-neutral-500/20">
                  {{ $t('members.detail.membership.last', { year: state.member.lastMembership }) }}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div class="min-w-[12rem] shrink grow basis-0" />
      </section>

      <SectionRow class="mt-6">
        <LoadingSpinner v-if="state.isFetchingPresences" class="m-auto h-12 w-12" />
        <PresencesGraph
          v-else
          :key="`presence-graph-${state.shouldRenderAllPresences}`"
          class="max-sm:overflow-x-auto"
          v-bind="
            state.shouldRenderAllPresences &&
            state.presences.length && {
              class: 'overflow-x-auto',
              endDate: dayjs(
                Math.max(...state.presences.map(({ date }) => dayjs(date).valueOf())),
              ).format('YYYY-MM-DD'),
              startDate: dayjs(
                Math.min(...state.presences.map(({ date }) => dayjs(date).valueOf())),
              ).format('YYYY-MM-DD'),
            }
          "
          :presences="state.presences" />
        <template #title>
          <h2 class="mx-3 text-3xl font-bold tracking-tight text-gray-900 sm:mx-0">
            {{ $t('members.detail.attendance.title') }}
          </h2>
        </template>
        <template #description>
          <RadioGroup
            v-model="state.shouldRenderAllPresences"
            class="mx-3 my-1 flex gap-1 self-start rounded-lg bg-slate-100 p-0.5 transition-colors sm:mx-0">
            <RadioGroupOption
              v-for="option in [false, true]"
              :key="`presence-option-${option}`"
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
                  :class="['text-gray-600 group-hover:text-gray-900', checked && 'text-gray-900']">
                  {{
                    option
                      ? $t('members.detail.attendance.period.allTime')
                      : $t('members.detail.attendance.period.last6Months')
                  }}
                </RadioGroupLabel>
              </button>
            </RadioGroupOption>
          </RadioGroup>
          <p class="mx-3 mt-1 whitespace-pre-line text-sm text-gray-500 sm:mx-0">
            {{ $t('members.detail.attendance.description') }}
          </p>
        </template>
        <template #append>
          <dl class="sticky top-3 flex flex-col gap-3 px-3 sm:px-0">
            <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <template v-if="!!attendanceLast30Days">
                <dt class="truncate font-medium text-gray-500 sm:text-sm">
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
                        count: attendanceLast30Days,
                      })}`" />
                  </template>
                </i18n-t>
              </template>
              <i18n-t
                v-else
                class="mt-1"
                keypath="members.detail.attendance.last30days.value"
                scope="global"
                tag="dd">
                <template #amount>
                  <div
                    v-if="state.isFetchingPresences"
                    class="mb-1 h-8 w-32 animate-pulse rounded-3xl bg-slate-200" />
                  <span v-else class="block text-3xl font-semibold tracking-tight text-gray-900">
                    {{ $t('members.detail.attendance.last30days.empty') }}
                  </span>
                </template>
              </i18n-t>
            </div>
          </dl>
        </template>
      </SectionRow>

      <SectionRow
        class="mt-16 px-3 sm:px-0"
        :description="$t('members.detail.profile.description')"
        :title="$t('members.detail.profile.title')">
        <ProfilePanel :member="state.member" @update:member="onUpdateMember" />
        <WordpressPanel class="mt-3" :member="state.member" @update:member="onUpdateMember" />

        <template #append>
          <dl class="sticky top-3 flex flex-col gap-3">
            <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt class="truncate font-medium text-gray-500 sm:text-sm">
                {{ $t('members.detail.profile.since.label') }}
              </dt>
              <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {{ dayjs(state.member.created).format('YYYY') }}
              </dd>
            </div>
            <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt class="truncate font-medium text-gray-500 sm:text-sm">
                {{ $t('members.detail.attendance.allTime.label') }}
              </dt>
              <i18n-t
                class="mt-1"
                keypath="members.detail.attendance.allTime.value"
                scope="global"
                tag="dd">
                <template #amount>
                  <animated-counter
                    class="block text-3xl font-semibold tracking-tight text-gray-900"
                    :decimals="Number(!Number.isInteger(totalAttendance))"
                    :duration="1"
                    :end-amount="totalAttendance"
                    separator=" "
                    :suffix="`
                      ${$t('members.detail.attendance.allTime.suffix', {
                        count: totalAttendance,
                      })}`" />
                </template>
              </i18n-t>
            </div>
          </dl>
        </template>
      </SectionRow>

      <SectionRow
        class="mt-16 px-3 sm:px-0"
        :description="$t('members.detail.orders.description')"
        :title="$t('members.detail.orders.title')">
        <div class="flex min-h-full flex-row flex-wrap items-stretch gap-3">
          <TicketsListPanel
            class="max-h-[40rem] min-w-[16rem] shrink grow basis-0"
            :loading="state.isFetchingTickets"
            :remaining="state.member.balance"
            :tickets="state.tickets" />
          <SubscriptionsListPanel
            :active="state.subscriptions.some(({ ended }) => dayjs().isBefore(ended))"
            class="max-h-[40rem] min-w-[16rem] shrink grow basis-0"
            :loading="state.isFetchingSubscriptions"
            :subscriptions="state.subscriptions" />
        </div>

        <template #append>
          <dl class="sticky top-3 flex flex-col gap-3">
            <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt class="truncate font-medium text-gray-500 sm:text-sm">
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
                  <animated-counter
                    class="block text-3xl font-semibold tracking-tight text-gray-900"
                    :decimals="Number.isInteger(totalAmountSpent) ? 0 : 2"
                    :duration="1"
                    :end-amount="totalAmountSpent"
                    separator=" "
                    suffix=" €" />
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
          ROUTE_NAMES.MEMBERS.DETAIL.PRESENCES.DETAIL,
        ].includes($route.name as string)
      "
      @close="$router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX })">
      <RouterView
        :loading="
          state.isFetchingMember ||
          state.isFetchingPresences ||
          state.isFetchingSubscriptions ||
          state.isFetchingTickets
        "
        :member="state.member"
        :member-id="id"
        :presences="state.presences"
        :subscriptions="state.subscriptions"
        :tickets="state.tickets" />
    </SideDialog>
  </article>
</template>

<script setup lang="ts">
import PresencesGraph from './Detail/PresencesGraph.vue';
import ProfilePanel from './Detail/ProfilePanel.vue';
import SectionRow from './Detail/SectionRow.vue';
import SubscriptionsListPanel from './Detail/Subscriptions/SubscriptionsListPanel.vue';
import TicketsListPanel from './Detail/Tickets/TicketsListPanel.vue';
import WordpressPanel from './Detail/WordpressPanel.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import SideDialog from '@/components/layout/SideDialog.vue';
import { handleSilentError, parseErrorText } from '@/helpers/errors';
import { ROUTE_NAMES } from '@/router/names';
import { Attendance, Member, getMember, getMemberPresences } from '@/services/api/members';
import { Subscription, getAllMemberSubscriptions } from '@/services/api/subscriptions';
import { Ticket, getAllMemberTickets } from '@/services/api/tickets';
import { useNotificationsStore } from '@/store/notifications';
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue';
import { useHead } from '@unhead/vue';
import { Head } from '@unhead/vue/components';
import dayjs from 'dayjs';
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
  isFetchingMember: false,
  member: null as Member | null,
  fetchMemberErrorMessage: null as string | null,

  isFetchingPresences: false,
  presences: [] as Attendance[],

  isFetchingSubscriptions: false,
  subscriptions: [] as Subscription[],

  isFetchingTickets: false,
  tickets: [] as Ticket[],

  shouldRenderAllPresences: false as boolean,
  isTicketsDialogVisible: true as boolean,
});

useHead({
  titleTemplate: (title?: string) =>
    [
      title,
      [state.member?.firstName, state.member?.lastName].filter(Boolean).join(' '),
      i18n.t('head.title'),
    ]
      .filter(Boolean)
      .join(' - '),
});

const totalAmountSpent = computed<number>(() => {
  const totalTicketsAmount = state.tickets.reduce((total, ticket) => {
    return total + ticket.amount;
  }, 0);
  const totalSubscriptionsAmount = state.subscriptions.reduce((total, subscription) => {
    return total + subscription.amount;
  }, 0);

  return totalTicketsAmount + totalSubscriptionsAmount;
});

const monthlyAmountSpent = computed<number>(() => {
  if (state.member) {
    const [lastPresence] = state.presences
      .filter(({ amount }) => amount > 0)
      .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));

    const totalMonths =
      Math.ceil(
        Math.abs(
          dayjs(lastPresence?.date || state.member.lastSeen).diff(
            state.member.created,
            'month',
            true,
          ),
        ),
      ) || 1;

    return totalAmountSpent.value / totalMonths;
  }
  return 0;
});

const attendanceLast30Days = computed<number>(() => {
  return state.presences
    .filter(({ date }) => dayjs().diff(dayjs(date), 'day') <= 30)
    .reduce((acc, { amount }) => acc + amount, 0);
});

const totalAttendance = computed<number>(() => {
  return state.presences.reduce((acc, { amount }) => acc + amount, 0);
});

const fetchMember = (memberId: string) => {
  state.isFetchingMember = true;
  state.fetchMemberErrorMessage = null;
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

const fetchPresences = (memberId: string) => {
  state.isFetchingPresences = true;
  getMemberPresences(memberId)
    .then((presences) => {
      state.presences = presences;
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.detail.attendance.onFetch.fail'),
      );
      return Promise.reject(error);
    })
    .finally(() => {
      state.isFetchingPresences = false;
    });
};

const fetchSubscriptions = (memberId: string) => {
  state.isFetchingSubscriptions = true;
  getAllMemberSubscriptions(memberId)
    .then((subscriptions) => {
      state.subscriptions = subscriptions;
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.detail.orders.subscriptions.onFetch.fail'),
      );
      return Promise.reject(error);
    })
    .finally(() => {
      state.isFetchingSubscriptions = false;
    });
};

const fetchTickets = (memberId: string) => {
  state.isFetchingTickets = true;
  getAllMemberTickets(memberId)
    .then((tickets) => {
      state.tickets = tickets;
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.detail.orders.tickets.onFetch.fail'),
      );
      return Promise.reject(error);
    })
    .finally(() => {
      state.isFetchingTickets = false;
    });
};

const onUpdateMember = (member: Member) => {
  state.member = member;
};

watch(
  () => props.id,
  (memberId) => {
    if (memberId) {
      fetchMember(memberId);
      fetchPresences(memberId);
      fetchSubscriptions(memberId);
      fetchTickets(memberId);
    }
  },
  { immediate: true },
);
</script>
