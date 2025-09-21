<template>
  <section
    class="flex flex-col bg-white shadow sm:overflow-hidden sm:rounded-md dark:bg-neutral-800">
    <header
      class="flex flex-row flex-wrap items-center justify-between gap-1 border-b border-gray-200 px-4 py-5 sm:p-6 dark:border-neutral-700">
      <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100">
        {{ $t('members.detail.orders.memberships.title') }}
      </h4>
      <span
        v-if="!memberships?.length"
        class="rounded-full bg-gray-500/10 px-3 py-1 leading-6 text-gray-400 ring-1 ring-inset ring-gray-500/20 sm:text-sm">
        {{ $t('members.detail.membership.none') }}
      </span>
    </header>

    <div class="relative flex shrink grow flex-col overflow-hidden">
      <AppAlert
        v-if="membershipsErrorText"
        class="m-4"
        :description="membershipsErrorText"
        :title="$t('members.detail.orders.memberships.onFetch.fail')"
        type="error" />
      <LoadingSpinner v-if="isFetchingMemberships" class="mx-auto my-16 size-16" />
      <ul
        v-else-if="memberships"
        :class="[
          'flex shrink grow flex-col divide-y divide-gray-200 dark:divide-neutral-700',
          state.shouldScroll ? 'overflow-y-scroll' : 'overflow-y-hidden',
        ]"
        role="list">
        <li v-for="membership in memberships" :key="`membership-${membership._id}`">
          <RouterLink
            :class="[
              'flex flex-col gap-1 px-6 py-4 hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-900',
              route.params.membershipId === `${membership._id}` &&
                route.name === ROUTE_NAMES.MEMBERS.DETAIL.MEMBERSHIPS.DETAIL &&
                'bg-slate-50 dark:bg-zinc-900/80',
            ]"
            replace
            :to="{
              name: ROUTE_NAMES.MEMBERS.DETAIL.MEMBERSHIPS.DETAIL,
              params: { membershipId: membership._id },
            }">
            <div class="flex flex-row items-end gap-1 text-gray-900 dark:text-gray-100">
              <strong class="text-3xl">
                {{ dayjs(membership.membershipStart).year() }}
              </strong>
              <p class="ml-auto text-lg">
                {{ fractionAmount(membership.amount) }}
              </p>
            </div>

            <time
              class="text-gray-500 sm:text-sm dark:text-gray-400"
              :datetime="dayjs(membership.purchased).toISOString()">
              {{
                $t('members.detail.orders.memberships.purchased', {
                  date: dayjs(membership.purchased).format('dddd LL'),
                })
              }}
            </time>
          </RouterLink>
        </li>
      </ul>

      <button
        v-if="!state.shouldScroll && memberships && memberships.length >= SHOULD_SCROLL_ABOVE_COUNT"
        class="absolute inset-x-0 bottom-0 flex flex-row items-center justify-center bg-gradient-to-t from-white from-0% pb-4 pt-12 text-gray-500 transition hover:text-gray-700 dark:from-neutral-800 dark:text-gray-400 dark:hover:text-gray-200"
        @click="state.shouldScroll = true">
        <SvgIcon aria-hidden="true" class="mr-2 size-5" :path="mdiChevronDoubleDown" type="mdi" />
        {{ $t('members.detail.orders.memberships.more') }}
      </button>
    </div>

    <footer
      class="mt-auto flex flex-row border-t border-t-gray-200 bg-gray-50 px-4 py-3 sm:px-6 dark:border-neutral-950 dark:bg-neutral-900/50">
      <AppButtonPlain
        class="dark:focus:ring-offset-stone-950"
        color="neutral"
        :icon="mdiPlus"
        replace
        :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.MEMBERSHIPS.NEW }">
        {{ $t('members.detail.orders.memberships.add') }}
      </AppButtonPlain>
    </footer>
  </section>
</template>
<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppAlert from '@/components/form/AppAlert.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import { fractionAmount } from '@/helpers/currency';
import { ROUTE_NAMES } from '@/router/names';
import { getAllMemberMemberships } from '@/services/api/memberships';
import { useAppQuery } from '@/services/query';
import { mdiChevronDoubleDown, mdiPlus } from '@mdi/js';
import dayjs from 'dayjs';
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router';

const SHOULD_SCROLL_ABOVE_COUNT = 5;

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const state = reactive({
  shouldScroll: false,
});

const {
  isFetching: isFetchingMemberships,
  data: memberships,
  errorText: membershipsErrorText,
} = useAppQuery({
  queryKey: ['members', computed(() => props.memberId), 'memberships'],
  queryFn: () => getAllMemberMemberships(props.memberId),
  retry: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});
</script>
