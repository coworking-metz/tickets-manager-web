<template>
  <div class="flex flex-col">
    <SectionRow>
      <LoadingSpinner v-if="isFetchingActivity" class="mx-auto h-[172px] w-12" />
      <div v-else class="relative">
        <span
          v-if="
            state.shouldRenderAllActivity &&
            firstActivityDate?.isBefore(dayjs().subtract(6, 'months'))
          "
          class="absolute left-0 z-10 h-[172px] w-10 bg-gradient-to-r from-slate-50 from-0% max-sm:hidden dark:from-stone-900" />
        <span
          v-if="
            state.shouldRenderAllActivity &&
            firstActivityDate?.isBefore(dayjs().subtract(6, 'months'))
          "
          class="absolute right-0 z-10 h-[172px] w-10 bg-gradient-to-l from-slate-50 from-0% max-sm:hidden dark:from-stone-900" />

        <ActivityGraph
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
          :selected-date="selectedActivityDate" />
      </div>

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
          :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.TIMELINE.ACTIVITY.NEW }">
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
                  class="block whitespace-nowrap text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
                  keypath="members.detail.attendance.summary.value"
                  :plural="periodAttendance"
                  scope="global"
                  tag="span">
                  <template #count>
                    <AnimatedNumber
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

      <SideDialog
        :model-value="doesRouteBelongsTo(route, ROUTE_NAMES.MEMBERS.DETAIL.TIMELINE.ACTIVITY)"
        @update:model-value="router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.TIMELINE.INDEX })">
        <RouterView :member="member" :member-id="memberId" />
      </SideDialog>
    </SectionRow>

    <SectionRow
      class="mt-16 max-sm:px-3"
      :description="$t('members.detail.audit.description')"
      :title="$t('members.detail.audit.title')">
      <MemberHistoryPanel :member-id="memberId" />
    </SectionRow>
  </div>
</template>

<script setup lang="ts">
import ActivityGraph from './Activity/ActivityGraph.vue';
import MemberHistoryPanel from './MemberHistoryPanel.vue';
import SectionRow from './SectionRow.vue';
import AnimatedNumber from '@/components/AnimatedNumber.vue';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppAlert from '@/components/form/AppAlert.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppSegmentedControl from '@/components/form/AppSegmentedControl.vue';
import AppPanel from '@/components/layout/AppPanel.vue';
import SideDialog from '@/components/layout/SideDialog.vue';
import { formatAmount } from '@/helpers/currency';
import { doesRouteBelongsTo } from '@/router/helpers';
import { ROUTE_NAMES } from '@/router/names';
import { getMember, getMemberActivity } from '@/services/api/members';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import { mdiPlus } from '@mdi/js';
import dayjs from 'dayjs';
import { PropType, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
  selectedActivityDate: {
    type: String as PropType<string | null>,
    default: null,
  },
});

const route = useRoute();
const router = useRouter();
const state = reactive({
  shouldRenderAllActivity: false as boolean,
});

const { isPending: isPendingMember, data: member } = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.profileById(props.memberId),
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
</script>
