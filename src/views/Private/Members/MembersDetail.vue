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
      <SectionRow class="px-3 sm:mt-40 sm:px-0">
        <header class="flex shrink-0 flex-col">
          <div class="flex flex-row items-center space-x-5 sm:ml-8">
            <div class="shrink-0">
              <div class="relative">
                <img alt="" class="h-16 w-16 rounded-full" :src="state.member.picture" />
                <span
                  v-if="!!state.member.lastSeen && dayjs().isSame(state.member.lastSeen, 'day')"
                  class="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-400 ring-2 ring-white" />
              </div>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ [state.member.firstname, state.member.lastname].filter(Boolean).join(' ') }}
              </h1>
              <i18n-t
                v-if="!!state.member.lastSeen"
                class="text-sm font-medium text-gray-500"
                keypath="members.detail.header.description"
                scope="global"
                tag="p">
                <template #date>
                  <time class="lowercase text-gray-900" :datetime="state.member.lastSeen">
                    {{
                      dayjs().isSame(state.member.lastSeen, 'day')
                        ? dayjs(state.member.lastSeen).fromNow()
                        : dayjs(state.member.lastSeen).calendar(dayjs())
                    }}
                  </time>
                </template>
              </i18n-t>
            </div>
          </div>
        </header>
      </SectionRow>

      <SectionRow class="mt-8">
        <LoadingSpinner v-if="state.isFetchingPresences" class="m-auto h-12 w-12" />
        <ErrorState
          v-else-if="state.fetchPresencesErrorMessage"
          :description="state.fetchPresencesErrorMessage"
          horizontal
          :title="$t('members.detail.attendance.onFetch.fail')">
          <template #action>
            <AppButton
              class="mt-6 border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500"
              @click="() => fetchPresences(props.id)">
              {{ $t('action.retry') }}
            </AppButton>
          </template>
        </ErrorState>
        <PresencesGraph
          v-else
          :key="`presence-graph-${state.areAllPresencesVisible}`"
          class="max-sm:overflow-x-auto"
          v-bind="
            state.areAllPresencesVisible && {
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
          <h2 class="px-3 text-xl font-medium leading-6 text-gray-900 sm:px-0">
            {{ $t('members.detail.attendance.title') }}
          </h2>
        </template>
        <template #description>
          <RadioGroup
            v-model="state.areAllPresencesVisible"
            class="my-1 flex gap-1 self-start rounded-lg bg-slate-100 p-0.5 transition-colors">
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
          <p class="mt-1 whitespace-pre-line px-3 text-sm text-gray-500 sm:px-0">
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

      <hr class="my-6 border-t border-gray-200" />

      <SectionRow
        class="px-3 sm:px-0"
        :description="$t('members.detail.profile.description')"
        :title="$t('members.detail.profile.title')">
        <ProfilePanel :member="state.member" />
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

      <hr class="my-6 border-t border-gray-200" />

      <SectionRow
        ref="ordersRowElement"
        class="px-3 sm:px-0"
        :description="$t('members.detail.orders.description')"
        :title="$t('members.detail.orders.title')">
        <div class="flex flex-row flex-wrap items-stretch gap-3">
          <TicketsListPanel
            class="min-w-[16rem] shrink grow basis-0"
            :remaining="state.member.balance"
            :tickets="state.member.tickets" />
          <SubscriptionsListPanel
            class="min-w-[16rem] shrink grow basis-0"
            :subscriptions="state.member.subscriptions" />
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
        :loading="state.isFetchingMember || state.isFetchingPresences"
        :member="state.member"
        :member-id="id"
        :presences="state.presences" />
    </SideDialog>
  </article>
</template>

<script setup lang="ts">
import PresencesGraph from './Detail/PresencesGraph.vue';
import ProfilePanel from './Detail/ProfilePanel.vue';
import SectionRow from './Detail/SectionRow.vue';
import SubscriptionsListPanel from './Detail/Subscriptions/SubscriptionsListPanel.vue';
import TicketsListPanel from './Detail/Tickets/TicketsListPanel.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppButton from '@/components/form/AppButton.vue';
import SideDialog from '@/components/layout/SideDialog.vue';
import { handleSilentError, parseErrorText } from '@/helpers/errors';
import { ROUTE_NAMES } from '@/router/names';
import {
  TICKET_UNIT_COST_IN_EUR,
  Member,
  getMember,
  getMemberPresences,
  Attendance,
} from '@/services/api/members';
import { SUBSCRIPTION_UNIT_COST_IN_EUR } from '@/services/api/subscriptions';
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue';
import { useHead } from '@unhead/vue';
import { Head } from '@unhead/vue/components';
import { useIntersectionObserver } from '@vueuse/core';
import dayjs from 'dayjs';
import { computed, reactive, ref, watch } from 'vue';
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

const i18n = useI18n();
const state = reactive({
  isFetchingMember: false,
  member: null as Member | null,
  fetchMemberErrorMessage: null as string | null,

  isFetchingPresences: false,
  presences: [] as Attendance[],
  fetchPresencesErrorMessage: null as string | null,

  areAllPresencesVisible: false as boolean,
  isTicketsDialogVisible: true as boolean,
});
const ordersRowElement = ref(null);
const totalCounter = ref(null);

useHead({
  titleTemplate: (title?: string) =>
    [
      title,
      [state.member?.firstname, state.member?.lastname].filter(Boolean).join(' '),
      i18n.t('head.title'),
    ]
      .filter(Boolean)
      .join(' - '),
});

useIntersectionObserver(ordersRowElement, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    (totalCounter.value as any).start();
  }
});

const totalAmountSpent = computed<number>(() => {
  const totalTickets =
    state.member?.tickets?.reduce((total, ticket) => {
      return total + ticket.tickets;
    }, 0) ?? 0;
  const totalTicketsAmount = totalTickets * TICKET_UNIT_COST_IN_EUR;
  const totalSubscriptionsAmount =
    (state.member?.subscriptions?.length ?? 0) * SUBSCRIPTION_UNIT_COST_IN_EUR;

  return totalTicketsAmount + totalSubscriptionsAmount;
});

const monthlyAmountSpent = computed<number>(() => {
  const totalMonths = dayjs().diff(dayjs(state.member?.created), 'month');
  return totalAmountSpent.value / totalMonths;
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
  state.fetchPresencesErrorMessage = null;
  getMemberPresences(memberId)
    .then((presences) => {
      state.presences = presences;
    })
    .catch(handleSilentError)
    .catch(async (error) => {
      state.fetchPresencesErrorMessage = await parseErrorText(error);
      return Promise.reject(error);
    })
    .finally(() => {
      state.isFetchingPresences = false;
    });
};

watch(
  () => props.id,
  (memberId) => {
    if (memberId) {
      fetchMember(memberId);
      fetchPresences(memberId);
    }
  },
  { immediate: true },
);
</script>
