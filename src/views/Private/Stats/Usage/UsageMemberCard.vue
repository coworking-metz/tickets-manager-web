<template>
  <Disclosure v-slot="{ open }">
    <DisclosureButton
      class="w-full transition-colors hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-neutral-900/50 dark:active:bg-neutral-900">
      <MemberCard :loading="loading" :member="member">
        <div v-if="!open" class="mt-3 flex w-full shrink flex-row flex-wrap items-center gap-1">
          <slot name="chips:prepend" />
          <span
            v-if="isVisible('tickets') && displayedTicketsCount"
            class="shrink truncate rounded-full px-2 py-0.5 text-center text-xs leading-6 whitespace-nowrap text-gray-800 ring-1 ring-inset dark:text-gray-100"
            :style="`background-color: ${statsColors.ticket}88; --tw-ring-color: ${statsColors.ticket};`">
            <i18n-t
              keypath="stats.usage.tickets.label"
              :plural="displayedTicketsCount"
              scope="global">
              <template #count>
                {{ fractionNumber(displayedTicketsCount) }}
              </template>
            </i18n-t>
          </span>

          <span
            v-if="isVisible('debt') && member.usage.tickets.debt.count"
            class="shrink truncate rounded-full px-2 py-0.5 text-center text-xs leading-6 whitespace-nowrap text-gray-800 ring-1 ring-inset dark:text-gray-100"
            :style="`background-color: ${statsColors.debt}88; --tw-ring-color: ${statsColors.debt};`">
            <i18n-t
              keypath="stats.usage.tickets.debt.count"
              :plural="member.usage.tickets.debt.count"
              scope="global">
              <template #count>
                {{ fractionNumber(member.usage.tickets.debt.count) }}
              </template>
            </i18n-t>
          </span>

          <span
            v-if="isVisible('subscriptions') && member.usage.subscriptions.count"
            class="shrink truncate rounded-full px-2 py-0.5 text-center text-xs leading-6 whitespace-nowrap text-gray-800 ring-1 ring-inset dark:text-gray-100"
            :style="`background-color: ${statsColors.subscription}88; --tw-ring-color: ${statsColors.subscription};`">
            <i18n-t
              keypath="stats.usage.subscriptions.count"
              :plural="member.usage.subscriptions.count"
              scope="global">
              <template #count>
                {{ fractionNumber(member.usage.subscriptions.count) }}
              </template>
            </i18n-t>
          </span>
          <slot name="chips:append" />
        </div>

        <template #append>
          <div class="ml-auto flex flex-row items-center self-start">
            <dd class="text-xl font-semibold text-gray-900 sm:text-3xl dark:text-gray-100">
              {{ formatAmount(displayedAmount) }}
            </dd>

            <AppIcon
              class="mx-1.5 size-6 shrink-0 text-gray-400 dark:text-gray-500"
              :icon="open ? mdiChevronUp : mdiChevronDown" />
          </div>
        </template>
      </MemberCard>
    </DisclosureButton>
    <DisclosurePanel as="dl" class="flex flex-col gap-1 py-4 dark:text-gray-300">
      <dl class="pr-8 pl-4">
        <div
          v-if="isVisible('tickets') && displayedTicketsCount"
          class="flex flex-row place-items-end justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.ticket};`" />
            <i18n-t
              keypath="stats.usage.tickets.label"
              :plural="displayedTicketsCount"
              scope="global">
              <template #count>
                {{ fractionNumber(displayedTicketsCount) }}
              </template>
            </i18n-t>
          </dt>
          <dd class="font-mono text-base font-medium text-gray-900 dark:text-gray-100">
            {{ formatAmount(displayedTicketsAmount) }}
          </dd>
        </div>
        <div
          v-if="isVisible('debt') && member.usage.tickets.debt.count"
          class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.debt};`" />
            <i18n-t
              keypath="stats.usage.tickets.debt.label"
              :plural="member.usage.tickets.debt.count"
              scope="global">
              <template #count>
                {{ fractionNumber(member.usage.tickets.debt.count) }}
              </template>
            </i18n-t>
          </dt>
          <dd class="font-mono text-base font-medium text-gray-400">
            {{
              isVisible('tickets')
                ? `-${formatAmount(member.usage.tickets.debt.amount)}`
                : formatAmount(member.usage.tickets.debt.amount)
            }}
          </dd>
        </div>
        <div
          v-if="isVisible('subscriptions') && member.usage.subscriptions.count"
          class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.subscription};`" />
            <i18n-t
              keypath="stats.usage.subscriptions.label"
              :plural="member.usage.subscriptions.count"
              scope="global">
              <template #count>
                {{ fractionNumber(member.usage.subscriptions.count) }}
              </template>
            </i18n-t>
            <template v-if="member.usage.subscriptions.attending.count">
              <br />
              <i18n-t
                keypath="stats.usage.subscriptions.attending"
                :plural="member.usage.subscriptions.attending.count"
                scope="global">
                <template #count>
                  {{ fractionNumber(member.usage.subscriptions.attending.count) }}
                </template>
              </i18n-t>
            </template>
          </dt>
          <dd class="font-mono text-base font-medium text-gray-900 dark:text-gray-100">
            {{ formatAmount(member.usage.subscriptions.amount) }}
          </dd>
        </div>
        <div class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${totalActivity ? statsColors.activity : theme.silverSand}`" />

            <i18n-t keypath="stats.usage.activity.label" :plural="totalActivity" scope="global">
              <template #count>
                {{ fractionNumber(totalActivity) }}
              </template>
            </i18n-t>
          </dt>
        </div>
      </dl>

      <AppButtonText
        class="mt-5 mr-4 self-end dark:focus:ring-offset-stone-900"
        color="indigo"
        :to="{
          name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
          params: {
            memberId: member._id,
          },
        }">
        {{
          $t('stats.usage.members.navigateTo', {
            name: member.firstName ?? member.lastName ?? member.email,
          })
        }}
        <AppIcon class="-mr-2 size-5" :icon="mdiChevronRight" />
      </AppButtonText>
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { useStatsColors } from '../statsColors';
import AppIcon from '@/components/AppIcon.vue';
import MemberCard from '@/components/MemberCard.vue';
import AppButtonText from '@/components/form/AppButtonText.vue';
import { formatAmount, fractionNumber } from '@/helpers/currency';
import { ROUTE_NAMES } from '@/router/names';
import {
  computeActivityFromUsage,
  computeUsageAmountInCategories,
  MemberListItemWithUsage,
  UsageCategory,
} from '@/services/api/stats/usage';
import { theme } from '@/styles/colors';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import { mdiChevronDown, mdiChevronRight, mdiChevronUp } from '@mdi/js';
import { computed, PropType } from 'vue';

const props = defineProps({
  member: {
    type: Object as PropType<MemberListItemWithUsage>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  /**
   * Only display the contributions of these categories.
   * An empty list displays all of them.
   */
  categories: {
    type: Array as PropType<UsageCategory[]>,
    default: () => [],
  },
});

const statsColors = useStatsColors();

const totalActivity = computed(() => computeActivityFromUsage(props.member.usage));
const isVisible = (category: UsageCategory) =>
  !props.categories.length || props.categories.includes(category);

// Tickets line includes debt only when debt is displayed too
const displayedTicketsCount = computed(
  () =>
    props.member.usage.tickets.count +
    (isVisible('debt') ? (props.member.usage.tickets.debt?.count ?? 0) : 0),
);
const displayedTicketsAmount = computed(
  () =>
    props.member.usage.tickets.amount +
    (isVisible('debt') ? (props.member.usage.tickets.debt?.amount ?? 0) : 0),
);
const displayedAmount = computed(() =>
  computeUsageAmountInCategories(props.member.usage, props.categories),
);
</script>
