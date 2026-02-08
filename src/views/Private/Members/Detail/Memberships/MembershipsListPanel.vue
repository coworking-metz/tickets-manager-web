<template>
  <AppPanel
    body-class="!p-0 flex flex-col overflow-hidden"
    class="flex flex-col"
    :title="$t('members.detail.orders.memberships.title')">
    <template #title:append>
      <span
        v-if="!memberships?.length"
        class="shrink-0 rounded-full bg-gray-500/10 px-3 py-1 leading-6 text-gray-400 ring-1 ring-inset ring-gray-500/20 sm:text-sm">
        {{ $t('members.detail.membership.none') }}
      </span>
    </template>

    <div class="relative flex shrink grow flex-col overflow-hidden">
      <LoadingSpinner v-if="isFetchingMemberships" class="mx-auto my-16 size-16" />
      <AppAlert
        v-else-if="membershipsErrorText"
        class="m-4"
        :description="membershipsErrorText"
        :title="$t('members.detail.orders.memberships.onFetch.fail')"
        type="error" />
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
              'flex flex-col gap-1 p-4 transition-colors hover:bg-slate-100 active:bg-slate-200 sm:px-6 dark:hover:bg-zinc-900 dark:active:bg-zinc-950',
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
                {{
                  compact([
                    dayjs(membership.membershipStart).year() !==
                      dayjs(membership.membershipEnd).year() &&
                      dayjs(membership.membershipStart).year(),
                    dayjs(membership.membershipEnd).year(),
                  ]).join(' - ')
                }}
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
                  date: dayjs(membership.purchased).format('dddd ll'),
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

    <template #footer>
      <AppButtonPlain
        class="dark:focus:ring-offset-stone-950"
        color="neutral"
        :icon="mdiPlus"
        replace
        :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.MEMBERSHIPS.NEW }">
        {{ $t('members.detail.orders.memberships.add') }}
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
import { getAllMemberMemberships } from '@/services/api/memberships';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import { mdiChevronDoubleDown, mdiPlus } from '@mdi/js';
import dayjs from 'dayjs';
import { compact } from 'lodash';
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router';

const SHOULD_SCROLL_ABOVE_COUNT = 4;

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
} = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.membershipsById(props.memberId),
    queryFn: () => getAllMemberMemberships(props.memberId),
  })),
);
</script>
