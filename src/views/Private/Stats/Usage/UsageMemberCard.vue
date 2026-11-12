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
            v-if="isVisible('subscriptions') && subscriptionsPart.count"
            class="shrink truncate rounded-full px-2 py-0.5 text-center text-xs leading-6 whitespace-nowrap text-gray-800 ring-1 ring-inset dark:text-gray-100"
            :style="`background-color: ${statsColors.subscription}88; --tw-ring-color: ${statsColors.subscription};`">
            <i18n-t
              keypath="stats.usage.subscriptions.count"
              :plural="subscriptionsPart.count"
              scope="global">
              <template #count>
                {{ fractionNumber(subscriptionsPart.count) }}
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
          v-for="row in isVisible('tickets') ? ticketsPriceRows : []"
          :key="`tickets-price-${row.label}`"
          class="flex flex-row items-start justify-between pl-4.5">
          <dt
            class="flex flex-row items-center gap-1.5 text-left text-sm text-gray-500 dark:text-gray-400">
            <span
              class="block size-2 shrink-0 rounded-full"
              :style="{ backgroundColor: row.color }" />
            {{ row.label }}
          </dt>
          <dd class="font-mono text-sm text-gray-500 dark:text-gray-400">
            {{ row.amount }}
          </dd>
        </div>
        <div
          v-if="isVisible('debt') && member.usage.tickets.debt.count"
          class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="{ background: statsColors.debtPattern }" />
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
          v-if="isVisible('subscriptions') && subscriptionsPart.count"
          class="flex flex-row items-start justify-between">
          <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
            <span
              class="mt-1.5 block size-3 shrink-0 rounded-full"
              :style="`background-color: ${statsColors.subscription};`" />
            <i18n-t
              keypath="stats.usage.subscriptions.label"
              :plural="subscriptionsPart.count"
              scope="global">
              <template #count>
                {{ fractionNumber(subscriptionsPart.count) }}
              </template>
            </i18n-t>
            <!-- Attendance is not broken down by price -->
            <template
              v-if="
                !getPrices('subscriptions')?.length && member.usage.subscriptions.attending.count
              ">
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
            {{ formatAmount(subscriptionsPart.amount) }}
          </dd>
        </div>
        <div
          v-for="row in isVisible('subscriptions') ? subscriptionsPriceRows : []"
          :key="`subscriptions-price-${row.label}`"
          class="flex flex-row items-start justify-between pl-4.5">
          <dt
            class="flex flex-row items-center gap-1.5 text-left text-sm text-gray-500 dark:text-gray-400">
            <span
              class="block size-2 shrink-0 rounded-full"
              :style="{ backgroundColor: row.color }" />
            {{ row.label }}
          </dt>
          <dd class="font-mono text-sm text-gray-500 dark:text-gray-400">
            {{ row.amount }}
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
import { getDistinctPrices } from '../priceBreakdown';
import { useStatsColors } from '../statsColors';
import { buildPriceRows } from '../statsTooltip';
import AppIcon from '@/components/AppIcon.vue';
import MemberCard from '@/components/MemberCard.vue';
import AppButtonText from '@/components/form/AppButtonText.vue';
import { formatAmount, fractionNumber } from '@/helpers/currency';
import { ROUTE_NAMES } from '@/router/names';
import {
  computeActivityFromUsage,
  computeUsageAmountInFilters,
  getFilteredPrices,
  getUsageCategoryPart,
  isSamePrice,
  MemberListItemWithUsage,
  UsageCategory,
  UsageFilter,
} from '@/services/api/stats/usage';
import { theme } from '@/styles/colors';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import { mdiChevronDown, mdiChevronRight, mdiChevronUp } from '@mdi/js';
import { computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';

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
   * Only display the contributions matching these filters.
   * An empty list displays all of them.
   */
  filters: {
    type: Array as PropType<UsageFilter[]>,
    default: () => [],
  },
  /**
   * Prices displayed elsewhere (e.g. the period distribution chart), to use the same shades.
   * Defaults to the member own prices.
   */
  prices: {
    type: Object as PropType<{ tickets?: number[]; subscriptions?: number[] }>,
    default: () => ({}),
  },
});

const statsColors = useStatsColors();

const totalActivity = computed(() => computeActivityFromUsage(props.member.usage));
/**
 * Prices displayed for a category: `null` when hidden, empty list for the whole category.
 */
const getPrices = (category: UsageCategory) =>
  props.filters.length ? getFilteredPrices(props.filters, category) : [];
const isVisible = (category: UsageCategory) => getPrices(category) !== null;

const ticketsPart = computed(() =>
  getUsageCategoryPart(props.member.usage, 'tickets', getPrices('tickets') ?? []),
);
const subscriptionsPart = computed(() =>
  getUsageCategoryPart(props.member.usage, 'subscriptions', getPrices('subscriptions') ?? []),
);

// Tickets line includes debt only when debt is displayed too
const displayedTicketsCount = computed(
  () =>
    ticketsPart.value.count +
    (isVisible('debt') ? (props.member.usage.tickets.debt?.count ?? 0) : 0),
);
const displayedTicketsAmount = computed(
  () =>
    ticketsPart.value.amount +
    (isVisible('debt') ? (props.member.usage.tickets.debt?.amount ?? 0) : 0),
);
const i18n = useI18n();

/**
 * Breakdown by price of a category, restricted to the selected prices if any.
 */
const buildCategoryPriceRows = (
  category: 'tickets' | 'subscriptions',
  color: string,
  ramp: string[],
  labelKey: string,
) => {
  const { byPrice } = props.member.usage[category];
  const selectedPrices = getPrices(category) ?? [];
  return buildPriceRows({
    byPrice: selectedPrices.length
      ? byPrice?.filter((slice) => selectedPrices.some((price) => isSamePrice(price, slice.price)))
      : byPrice,
    prices: props.prices[category] ?? getDistinctPrices([byPrice]),
    color,
    ramp,
    formatLabel: ({ count, price }) =>
      i18n.t(labelKey, { count: fractionNumber(count), price: formatAmount(price) }, count),
    formatAmount,
  });
};

const ticketsPriceRows = computed(() =>
  buildCategoryPriceRows(
    'tickets',
    statsColors.value.ticket,
    statsColors.value.ticketPrices,
    'stats.usage.tickets.byPrice.label',
  ),
);
const subscriptionsPriceRows = computed(() =>
  buildCategoryPriceRows(
    'subscriptions',
    statsColors.value.subscription,
    statsColors.value.subscriptionPrices,
    'stats.usage.subscriptions.byPrice.label',
  ),
);

const displayedAmount = computed(() =>
  computeUsageAmountInFilters(props.member.usage, props.filters),
);
</script>
