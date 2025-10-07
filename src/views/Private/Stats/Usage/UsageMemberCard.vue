<template>
  <Disclosure v-slot="{ open }">
    <DisclosureButton
      class="w-full transition-colors hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-neutral-900/50 dark:active:bg-neutral-900">
      <MemberCard :loading="loading" :member="member">
        <div class="mt-3 flex shrink flex-row flex-wrap items-center gap-1">
          <span
            class="shrink basis-0 whitespace-nowrap rounded-full bg-neutral-500/10 px-2 py-0.5 text-center text-xs leading-6 text-neutral-500 ring-1 ring-inset ring-neutral-500/20">
            {{
              $t('stats.usage.activity.count', {
                count: totalActivity,
              })
            }}
          </span>
        </div>

        <template #append>
          <dd class="ml-auto text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {{ fractionAmount(member.usage.amount) }}
          </dd>

          <SvgIcon
            aria-hidden="true"
            class="mx-1.5 size-6 shrink-0 text-gray-400 dark:text-gray-500"
            :path="open ? mdiChevronUp : mdiChevronDown"
            type="mdi" />
        </template>
      </MemberCard>
    </DisclosureButton>
    <DisclosurePanel as="dl" class="flex flex-col gap-1 p-4 dark:text-gray-300">
      <div v-if="member.usage.tickets.debt.count" class="flex flex-row items-start justify-between">
        <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
          <span
            class="mt-1.5 block size-3 rounded-full"
            :style="`background-color: ${statsColors.debt};`"></span>
          {{
            $t('stats.usage.tickets.debt', {
              count: member.usage.tickets.debt.count,
            })
          }}
        </dt>
        <dd class="ml-6 text-base font-medium text-gray-400">
          {{ fractionAmount(member.usage.tickets.debt.amount) }}
        </dd>
      </div>

      <div v-if="member.usage.tickets.count" class="flex flex-row place-items-end justify-between">
        <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
          <span
            class="mt-1.5 block size-3 rounded-full"
            :style="`background-color: ${statsColors.ticket};`" />
          {{
            $t(`stats.usage.tickets.label`, {
              count: member.usage.tickets.count,
            })
          }}
        </dt>
        <dd class="ml-6 text-base font-medium text-gray-900 dark:text-gray-100">
          {{ fractionAmount(member.usage.tickets.amount) }}
        </dd>
      </div>
      <div
        v-if="member.usage.subscriptions.count"
        class="flex flex-row items-start justify-between">
        <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
          <span
            class="mt-1.5 block size-3 rounded-full"
            :style="`background-color: ${statsColors.subscription};`" />
          {{
            $t(`stats.usage.subscriptions.label`, {
              count: member.usage.subscriptions.count,
            })
          }}
          <template v-if="member.usage.subscriptions.attending.count">
            <br />
            {{
              $t(`stats.usage.subscriptions.attending`, {
                count: member.usage.subscriptions.attending.count,
              })
            }}
          </template>
        </dt>
        <dd class="ml-6 text-base font-medium text-gray-900 dark:text-gray-100">
          {{ fractionAmount(member.usage.subscriptions.amount) }}
        </dd>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { useStatsColors } from '../statsColors';
import MemberCard from '@/components/MemberCard.vue';
import { fractionAmount } from '@/helpers/currency';
import { MemberListItemWithUsage } from '@/services/api/stats/usage';
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
    props.member.usage.subscriptions.attending.count +
    props.member.usage.tickets.debt.count,
);
</script>
