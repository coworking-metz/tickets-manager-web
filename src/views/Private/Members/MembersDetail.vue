<template>
  <article class="flex flex-col pb-12 max-sm:grow sm:min-h-full sm:px-0! sm:pb-24">
    <Head>
      <title>{{ fullname }}</title>
    </Head>
    <section
      class="my-6 flex flex-row flex-wrap max-sm:px-3 sm:pt-12 sm:pr-4 sm:pl-36 [@media_((min-height:840px)_and_(min-width:1024px))]:pt-40">
      <div class="min-w-48 shrink grow basis-0" />
      <header class="flex w-full max-w-2xl shrink-0 grow flex-col">
        <div class="flex flex-row space-x-5">
          <LoadingSpinner v-if="isPendingMember" class="size-16" />
          <component
            v-else
            :is="member?.picture ? 'button' : 'figure'"
            class="group relative shrink-0 self-start rounded-full"
            :inert="!member?.picture"
            @click="() => (state.isPictureDialogVisible = true)">
            <MembersThumbnail
              class="size-16 text-xl"
              :email="member?.email"
              :name="fullname"
              :thumbnail="member?.thumbnail" />
            <div
              v-if="member?.picture"
              class="absolute inset-0 flex rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-60">
              <AppIcon class="m-auto size-8 text-white" :icon="mdiMagnifyPlusOutline" />
            </div>
            <span
              v-if="member?.attending"
              class="absolute right-0.5 bottom-0.5 block size-3 rounded-full bg-emerald-500 ring-4 ring-slate-50 dark:ring-stone-900" />
          </component>

          <div class="flex flex-col gap-1">
            <template v-if="isPendingMember">
              <LoadingSkeleton class="h-8 w-48 rounded-xl" />
              <LoadingSkeleton class="my-1 h-4 w-64" />
              <LoadingSkeleton class="my-0.5 h-6 w-24 rounded-full" />
            </template>
            <template v-else-if="member">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {{ fullname || member.email }}
              </h1>
              <i18n-t
                v-if="member.attending"
                class="text-sm font-medium text-gray-500 dark:text-neutral-400"
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
                class="text-sm font-medium text-gray-500 dark:text-neutral-400"
                keypath="members.detail.profile.lastSeen"
                scope="global"
                tag="p">
                <template #date>
                  <time
                    class="mr-1 inline-block text-gray-900 lowercase dark:text-gray-100"
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
                  class="shrink basis-0 rounded-full bg-red-500/10 px-2 py-0.5 text-center text-xs leading-6 whitespace-nowrap text-red-400 ring-1 ring-red-500/20 ring-inset">
                  {{
                    $t('members.detail.orders.tickets.debt', {
                      count: Math.abs(member.balance),
                    })
                  }}
                </span>
                <span
                  v-if="member.membershipOk"
                  class="shrink basis-0 rounded-full bg-indigo-500/10 px-2 py-0.5 text-center text-xs leading-6 whitespace-nowrap text-indigo-400 ring-1 ring-indigo-500/20 ring-inset">
                  {{ $t('members.detail.membership.current', { year: member.lastMembership }) }}
                </span>
                <span
                  v-else
                  class="shrink basis-0 rounded-full bg-neutral-500/10 px-2 py-0.5 text-center text-xs leading-6 whitespace-nowrap text-neutral-500 ring-1 ring-neutral-500/20 ring-inset">
                  {{
                    member.lastMembership
                      ? $t('members.detail.membership.last', { year: member.lastMembership })
                      : $t('members.detail.membership.none')
                  }}
                </span>
                <VTooltip v-if="member.trustedUser">
                  <span
                    class="flex shrink basis-0 flex-row items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-center text-xs leading-6 whitespace-nowrap text-indigo-400 ring-1 ring-indigo-500/20 ring-inset">
                    {{ $t('members.detail.status.trusted.label') }}
                    <AppIcon class="size-4" :icon="mdiInformationOutline" />
                  </span>
                  <template #popper>
                    <span class="overflow-hidden text-sm whitespace-pre-line">
                      {{ $t('members.detail.status.trusted.description') }}
                    </span>
                  </template>
                </VTooltip>
                <VTooltip v-if="member.activeUser">
                  <span
                    class="flex shrink basis-0 flex-row items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-center text-xs leading-6 whitespace-nowrap text-indigo-400 ring-1 ring-indigo-500/20 ring-inset">
                    {{ $t('members.detail.status.voting.label') }}
                    <AppIcon class="size-4" :icon="mdiInformationOutline" />
                  </span>
                  <template #popper>
                    <span class="overflow-hidden text-sm whitespace-pre-line">
                      {{ $t('members.detail.status.voting.description') }}
                    </span>
                  </template>
                </VTooltip>
              </div>
            </template>
            <AppAlert
              v-if="memberErrorText"
              :description="memberErrorText"
              :title="$t('members.detail.onFetch.fail')"
              type="error" />
          </div>
        </div>

        <nav class="mt-6 flex w-full max-w-2xl flex-row gap-x-3 overflow-x-auto">
          <RouterLink
            v-for="tab in tabs"
            :key="tab.label"
            :aria-current="tab.active ? 'page' : undefined"
            :class="[
              tab.active
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-500'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 hover:dark:border-gray-600 hover:dark:text-gray-200',
              'border-b-2 px-1 pt-2.5 pb-4 text-sm font-medium whitespace-nowrap',
            ]"
            :to="{ name: tab.to.name }">
            {{ tab.label }}
          </RouterLink>
        </nav>
      </header>

      <div class="min-w-48 shrink grow basis-0" />
    </section>

    <RouterViewSlideTransition
      class="mx-auto w-full max-w-7xl sm:pr-4 sm:pl-36"
      :member-id="memberId" />

    <AppDialog
      v-model="state.isPictureDialogVisible"
      dialog-class="max-w-xl relative overflow-hidden min-h-40 !bg-black">
      <img
        v-if="member?.picture"
        class="max-h-[80vh] w-full object-contain"
        :src="member.picture" />
      <AppButtonIcon
        class="absolute top-3 right-3 bg-black/40 text-white! hover:bg-black/60! focus:ring-offset-black"
        :icon="mdiClose"
        :title="$t('action.close')"
        @click="() => (state.isPictureDialogVisible = false)" />
    </AppDialog>
  </article>
</template>

<script setup lang="ts">
import MembersThumbnail from './MembersThumbnail.vue';
import AppIcon from '@/components/AppIcon.vue';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppAlert from '@/components/form/AppAlert.vue';
import AppButtonIcon from '@/components/form/AppButtonIcon.vue';
import AppDialog from '@/components/layout/AppDialog.vue';
import RouterViewSlideTransition from '@/components/layout/RouterViewSlideTransition.vue';
import { doesRouteBelongsTo } from '@/router/helpers';
import { ROUTE_NAMES } from '@/router/names';
import { getMember, isMemberBalanceInsufficient } from '@/services/api/members';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import { mdiClose, mdiInformationOutline, mdiMagnifyPlusOutline } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import dayjs from 'dayjs';
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
});

const i18n = useI18n();
const route = useRoute();
const state = reactive({
  isPictureDialogVisible: false as boolean,
});

const {
  isPending: isPendingMember,
  data: member,
  errorText: memberErrorText,
} = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.profileById(props.memberId),
    queryFn: () => getMember(props.memberId),
  })),
);

const fullname = computed<string>(() =>
  [member.value?.firstName, member.value?.lastName].filter(Boolean).join(' '),
);

const tabs = computed(() => [
  {
    label: i18n.t('members.detail.tabs.timeline'),
    to: {
      name: ROUTE_NAMES.MEMBERS.DETAIL.TIMELINE.INDEX,
    },
    active: doesRouteBelongsTo(route, ROUTE_NAMES.MEMBERS.DETAIL.TIMELINE),
  },
  {
    label: i18n.t('members.detail.tabs.profile'),
    to: {
      name: ROUTE_NAMES.MEMBERS.DETAIL.PROFILE.INDEX,
    },
    active: doesRouteBelongsTo(route, ROUTE_NAMES.MEMBERS.DETAIL.PROFILE),
  },
  {
    label: i18n.t('members.detail.tabs.orders'),
    to: {
      name: ROUTE_NAMES.MEMBERS.DETAIL.ORDERS.INDEX,
    },
    active: doesRouteBelongsTo(route, ROUTE_NAMES.MEMBERS.DETAIL.ORDERS),
  },
]);

watch(
  () => props.memberId,
  (newMemberId, oldMemberId) => {
    // scroll to top to let the user know that member has changed
    if (newMemberId !== oldMemberId) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  },
);
</script>
