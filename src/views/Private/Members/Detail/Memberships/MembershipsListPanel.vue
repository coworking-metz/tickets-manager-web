<template>
  <div
    class="flex flex-col divide-y divide-gray-200 bg-white shadow sm:overflow-hidden sm:rounded-md">
    <div class="flex flex-row flex-wrap items-center justify-between gap-1 px-4 py-5 sm:p-6">
      <h4 class="text-lg font-medium">{{ $t('members.detail.orders.memberships.title') }}</h4>
      <span
        v-if="!memberships?.length"
        class="rounded-full bg-gray-500/10 px-3 py-1 leading-6 text-gray-400 ring-1 ring-inset ring-gray-500/20 sm:text-sm">
        {{ $t('members.detail.membership.none') }}
      </span>
    </div>

    <ul
      :class="[
        'relative flex shrink grow flex-col',
        state.shouldScroll ? 'overflow-y-scroll' : 'overflow-y-hidden',
      ]"
      role="list">
      <AppAlert
        v-if="membershipsErrorText"
        class="m-4"
        :description="membershipsErrorText"
        :title="$t('members.detail.orders.memberships.onFetch.fail')"
        type="error" />
      <LoadingSpinner v-if="isFetchingMemberships" class="mx-auto my-16 size-16" />
      <template v-else>
        <li
          v-for="membership in memberships"
          :key="`membership-${membership._id}`"
          class="border-b border-gray-200">
          <RouterLink
            :class="{
              ['flex flex-col gap-1 px-6 py-4 hover:bg-slate-100 active:bg-slate-200']: true,
              ['bg-slate-50']:
                route.params.membershipId === `${membership._id}` &&
                route.name === ROUTE_NAMES.MEMBERS.DETAIL.MEMBERSHIPS.DETAIL,
            }"
            replace
            :to="{
              name: ROUTE_NAMES.MEMBERS.DETAIL.MEMBERSHIPS.DETAIL,
              params: { membershipId: membership._id },
            }">
            <div class="flex flex-row items-end gap-1">
              <strong class="text-3xl">
                {{ dayjs(membership.membershipStart).year() }}
              </strong>
              <p class="ml-auto text-lg">
                {{ fractionAmount(membership.amount) }}
              </p>
            </div>

            <time
              class="text-gray-500 sm:text-sm"
              :datetime="dayjs(membership.purchased).toISOString()">
              {{
                $t('members.detail.orders.memberships.purchased', {
                  date: dayjs(membership.purchased).format('dddd LL'),
                })
              }}
            </time>
          </RouterLink>
        </li>
        <button
          v-if="!state.shouldScroll && memberships && memberships.length >= 6"
          class="absolute inset-x-0 bottom-0 flex flex-row items-center justify-center bg-gradient-to-t from-white from-0% pb-4 pt-12 text-gray-500 transition hover:text-gray-700"
          @click="state.shouldScroll = true">
          <SvgIcon aria-hidden="true" class="mr-2 size-5" :path="mdiChevronDoubleDown" type="mdi" />
          {{ $t('members.detail.orders.memberships.more') }}
        </button>
      </template>
    </ul>
    <div class="mt-auto flex flex-row bg-gray-50 px-4 py-3 sm:px-6">
      <RouterLink
        class="flex flex-row items-center rounded-md border border-gray-300 bg-white px-3 py-2 font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
        replace
        :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.MEMBERSHIPS.NEW }">
        <SvgIcon aria-hidden="true" class="mr-2 size-5" :path="mdiPlus" type="mdi" />
        {{ $t('members.detail.orders.memberships.add') }}
      </RouterLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppAlert from '@/components/form/AppAlert.vue';
import { fractionAmount } from '@/helpers/currency';
import { ROUTE_NAMES } from '@/router/names';
import { getAllMemberMemberships } from '@/services/api/memberships';
import { useAppQuery } from '@/services/query';
import { mdiChevronDoubleDown, mdiPlus } from '@mdi/js';
import dayjs from 'dayjs';
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router';

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
