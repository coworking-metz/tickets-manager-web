<template>
  <Disclosure v-slot="{ open }">
    <DisclosureButton
      class="w-full transition-colors hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-neutral-900/50 dark:active:bg-neutral-900">
      <MemberCard :loading="loading" :member="member">
        <div v-if="!open" class="mt-3 flex w-full shrink flex-row flex-wrap items-center gap-1">
          <span
            v-if="member.usage.tickets.debt.count"
            class="shrink truncate whitespace-nowrap rounded-full px-2 py-0.5 text-center text-xs leading-6 text-gray-800 ring-1 ring-inset dark:text-gray-100"
            :style="`background-color: ${statsColors.debt}88; --tw-ring-color: ${statsColors.debt};`">
            {{
              $t('stats.usage.tickets.debt', {
                count: member.usage.tickets.debt.count,
              })
            }}
          </span>
          <span
            v-if="member.usage.tickets.count"
            class="shrink truncate whitespace-nowrap rounded-full px-2 py-0.5 text-center text-xs leading-6 text-gray-800 ring-1 ring-inset dark:text-gray-100"
            :style="`background-color: ${statsColors.ticket}88; --tw-ring-color: ${statsColors.ticket};`">
            {{
              $t('stats.usage.tickets.label', {
                count: member.usage.tickets.count,
              })
            }}
          </span>
          <span
            v-if="member.usage.subscriptions.count"
            class="shrink truncate whitespace-nowrap rounded-full px-2 py-0.5 text-center text-xs leading-6 text-gray-800 ring-1 ring-inset dark:text-gray-100"
            :style="`background-color: ${statsColors.subscription}88; --tw-ring-color: ${statsColors.subscription};`">
            {{
              $t('stats.usage.subscriptions.count', {
                count: member.usage.subscriptions.count,
              })
            }}
          </span>
        </div>

        <template #append>
          <div class="ml-auto flex flex-row items-center self-start">
            <dd class="text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {{ formatAmount(member.usage.amount) }}
            </dd>

            <SvgIcon
              aria-hidden="true"
              class="mx-1.5 size-6 shrink-0 text-gray-400 dark:text-gray-500"
              :path="open ? mdiChevronUp : mdiChevronDown"
              type="mdi" />
          </div>
        </template>
      </MemberCard>
    </DisclosureButton>
    <DisclosurePanel as="dl" class="flex flex-col gap-1 p-4 pr-8 dark:text-gray-300">
      <div v-if="member.usage.tickets.debt.count" class="flex flex-row items-start justify-between">
        <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
          <span
            class="mt-1.5 block size-3 shrink-0 rounded-full"
            :style="`background-color: ${statsColors.debt};`"></span>
          {{
            $t('stats.usage.tickets.debt', {
              count: member.usage.tickets.debt.count,
            })
          }}
        </dt>
        <dd class="text-base font-medium text-gray-400">
          {{ formatAmount(member.usage.tickets.debt.amount) }}
        </dd>
      </div>

      <div v-if="member.usage.tickets.count" class="flex flex-row place-items-end justify-between">
        <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
          <span
            class="mt-1.5 block size-3 shrink-0 rounded-full"
            :style="`background-color: ${statsColors.ticket};`" />
          {{
            $t(`stats.usage.tickets.label`, {
              count: member.usage.tickets.count,
            })
          }}
        </dt>
        <dd class="text-base font-medium text-gray-900 dark:text-gray-100">
          {{ formatAmount(member.usage.tickets.amount) }}
        </dd>
      </div>
      <div
        v-if="member.usage.subscriptions.count"
        class="flex flex-row items-start justify-between">
        <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
          <span
            class="mt-1.5 block size-3 shrink-0 rounded-full"
            :style="`background-color: ${statsColors.subscription};`" />
          {{
            $t(`stats.usage.subscriptions.label`, {
              count: member.usage.subscriptions.count,
            })
          }}
        </dt>
        <dd class="text-base font-medium text-gray-900 dark:text-gray-100">
          {{ formatAmount(member.usage.subscriptions.amount) }}
        </dd>
      </div>
      <div class="flex flex-row items-start justify-between">
        <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
          <span
            class="mt-1.5 block size-3 shrink-0 rounded-full"
            :style="`background-color: ${totalActivity ? statsColors.activity : theme.silverSand}`" />
          {{
            $t(`stats.usage.activity.count`, {
              count: totalActivity,
            })
          }}
        </dt>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { useStatsColors } from '../statsColors';
import MemberCard from '@/components/MemberCard.vue';
import { formatAmount } from '@/helpers/currency';
import { MemberListItemWithUsage } from '@/services/api/stats/usage';
import { theme } from '@/styles/colors';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
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
});

const statsColors = useStatsColors();

const totalActivity = computed(
  () =>
    props.member.usage.tickets.count +
    props.member.usage.tickets.debt.count +
    props.member.usage.subscriptions.attending.count,
);
</script>
