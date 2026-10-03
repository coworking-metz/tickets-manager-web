<template>
  <Disclosure v-slot="{ open }">
    <DisclosureButton
      class="w-full transition-colors hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-neutral-900/50 dark:active:bg-neutral-900">
      <MemberCard :loading="loading" :member="member">
        <div v-if="!open" class="mt-3 flex w-full shrink flex-row flex-wrap items-center gap-1">
          <span
            v-if="member.income.tickets.count"
            class="shrink truncate rounded-full px-2 py-0.5 text-center text-xs leading-6 whitespace-nowrap text-gray-800 ring-1 ring-inset dark:text-gray-100"
            :style="`background-color: ${statsColors.ticketOrder}88; --tw-ring-color: ${statsColors.ticketOrder};`">
            <i18n-t
              keypath="stats.incomes.tickets.label"
              :plural="member.income.tickets.count"
              scope="global">
              <template #count>
                {{ fractionNumber(member.income.tickets.count) }}
              </template>
            </i18n-t>
          </span>

          <span
            v-if="member.income.subscriptions.count"
            class="shrink truncate rounded-full px-2 py-0.5 text-center text-xs leading-6 whitespace-nowrap text-gray-800 ring-1 ring-inset dark:text-gray-100"
            :style="`background-color: ${statsColors.subscriptionOrder}88; --tw-ring-color: ${statsColors.subscriptionOrder};`">
            <i18n-t
              keypath="stats.incomes.subscriptions.label"
              :plural="member.income.subscriptions.count"
              scope="global">
              <template #count>
                {{ fractionNumber(member.income.subscriptions.count) }}
              </template>
            </i18n-t>
          </span>

          <span
            v-if="member.income.memberships.count"
            class="shrink truncate rounded-full px-2 py-0.5 text-center text-xs leading-6 whitespace-nowrap text-gray-800 ring-1 ring-inset dark:text-gray-100"
            :style="`background-color: ${statsColors.membershipOrder}88; --tw-ring-color: ${statsColors.membershipOrder};`">
            <i18n-t
              keypath="stats.incomes.memberships.label"
              :plural="member.income.memberships.count"
              scope="global">
              <template #count>
                {{ fractionNumber(member.income.memberships.count) }}
              </template>
            </i18n-t>
          </span>
        </div>

        <template #append>
          <div class="ml-auto flex flex-row items-center self-start">
            <dd class="text-xl font-semibold text-gray-900 sm:text-3xl dark:text-gray-100">
              {{ formatAmount(member.income.amount) }}
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
        <div v-if="member.income.tickets.count" class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.ticketOrder};`" />
            <i18n-t
              keypath="stats.incomes.tickets.label"
              :plural="member.income.tickets.count"
              scope="global">
              <template #count>
                {{ fractionNumber(member.income.tickets.count) }}
              </template>
            </i18n-t>
          </dt>
          <dd class="font-mono text-base font-medium text-gray-900 dark:text-gray-100">
            {{ formatAmount(member.income.tickets.amount) }}
          </dd>
        </div>
        <div
          v-if="member.income.subscriptions.count"
          class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.subscriptionOrder};`" />
            <i18n-t
              keypath="stats.incomes.subscriptions.label"
              :plural="member.income.subscriptions.count"
              scope="global">
              <template #count>
                {{ fractionNumber(member.income.subscriptions.count) }}
              </template>
            </i18n-t>
          </dt>
          <dd class="font-mono text-base font-medium text-gray-900 dark:text-gray-100">
            {{ formatAmount(member.income.subscriptions.amount) }}
          </dd>
        </div>
        <div
          v-if="member.income.memberships.count"
          class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.membershipOrder};`" />
            <i18n-t
              keypath="stats.incomes.memberships.label"
              :plural="member.income.memberships.count"
              scope="global">
              <template #count>
                {{ fractionNumber(member.income.memberships.count) }}
              </template>
            </i18n-t>
          </dt>
          <dd class="font-mono text-base font-medium text-gray-900 dark:text-gray-100">
            {{ formatAmount(member.income.memberships.amount) }}
          </dd>
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
          $t('stats.incomes.members.navigateTo', {
            name: member.firstName ?? member.lastName ?? member.email,
          })
        }}
        <AppIcon class="-mr-2 size-5" :icon="mdiChevronRight" />
      </AppButtonText>
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue';
import MemberCard from '@/components/MemberCard.vue';
import AppButtonText from '@/components/form/AppButtonText.vue';
import { formatAmount, fractionNumber } from '@/helpers/currency';
import { ROUTE_NAMES } from '@/router/names';
import { MemberListItemWithIncome } from '@/services/api/stats/income';
import { useStatsColors } from '@/views/Private/Stats/statsColors';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import { mdiChevronDown, mdiChevronRight, mdiChevronUp } from '@mdi/js';
import { PropType } from 'vue';

defineProps({
  member: {
    type: Object as PropType<MemberListItemWithIncome>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const statsColors = useStatsColors();
</script>
