<template>
  <VueECharts autoresize :option="options" @click="onClick" />
</template>

<script lang="ts" setup>
import { formatAmount, fractionNumber } from '@/helpers/currency';
import { PriceBreakdown } from '@/services/api/stats/income';
import {
  isUsageFilterActive,
  isUsageFilterSelected,
  StatsUsage,
  toggleUsageFilter,
  UsageCategory,
  UsageFilter,
} from '@/services/api/stats/usage';
import { useTheme } from '@/services/theme';
import { getPriceShade } from '@/views/Private/Stats/priceBreakdown';
import { getReadableTextColor, useStatsColors } from '@/views/Private/Stats/statsColors';
import { SunburstChart } from 'echarts/charts.js';
import { TooltipComponent } from 'echarts/components.js';
import { use } from 'echarts/core.js';
import { CanvasRenderer } from 'echarts/renderers.js';
import { PropType, computed } from 'vue';
import VueECharts from 'vue-echarts';
import { useI18n } from 'vue-i18n';
import type { SunburstSeriesOption } from 'echarts/charts.js';
import type { TooltipComponentOption } from 'echarts/components.js';
import type { ComposeOption } from 'echarts/core.js';
import type { CallbackDataParams } from 'echarts/types/dist/shared.js';

/**
 * @see https://echarts.apache.org/en/cheat-sheet.html
 */
use([TooltipComponent, SunburstChart, CanvasRenderer]);

interface SunburstNode {
  category: UsageCategory;
  price?: number;
  name: string;
  value: number;
  shortLabel: string;
  label: { color: string };
  itemStyle: {
    color: string;
    opacity: number;
    borderColor?: string;
    borderWidth?: number;
    decal?: object;
  };
  children?: SunburstNode[];
}

const props = defineProps({
  usage: {
    type: Object as PropType<StatsUsage>,
    required: true,
  },
});

const selected = defineModel<UsageFilter[]>('selected', {
  default: () => [],
});

const i18n = useI18n();
const theme = useTheme();
const statsColors = useStatsColors();

const onClick = (params: { data?: unknown }) => {
  const { category, price } = (params.data as Partial<SunburstNode> | undefined) ?? {};
  if (category) {
    selected.value = toggleUsageFilter(selected.value, { category, price });
  }
};

const getOpacity = (category: UsageCategory, price?: number) =>
  isUsageFilterActive(selected.value, category, price) ? 1 : 0.3;

const getHighlightBorder = (category: UsageCategory, price?: number) =>
  isUsageFilterSelected(selected.value, category, price)
    ? {
        borderColor: theme.value === 'dark' ? '#f3f4f6' : '#111827', // gray-100 / gray-900
        borderWidth: 3,
      }
    : {};

/**
 * Breakdown by price of a category, or nothing when there is a single price (it would only
 * repeat the category) or when the breakdown is inconsistent with the category total.
 */
const getPriceSlices = (amount: number, byPrice: PriceBreakdown[] = []): PriceBreakdown[] => {
  const slices = byPrice.filter((slice) => slice.amount > 0);
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0);
  return slices.length < 2 || Math.abs(total - amount) > 0.01 ? [] : slices;
};

/**
 * Label of a category, with its count (e.g. "123 tickets").
 */
const formatCount = (category: UsageCategory, count: number) => {
  switch (category) {
    case 'tickets':
      return i18n.t('stats.usage.tickets.label', { count: fractionNumber(count) }, count);
    case 'debt':
      return i18n.t('stats.usage.distribution.debtCount', { count: fractionNumber(count) }, count);
    case 'subscriptions':
      return i18n.t('stats.usage.subscriptions.count', { count: fractionNumber(count) }, count);
  }
};

const buildCategoryNode = (
  category: UsageCategory,
  amount: number,
  count: number,
  color: string,
  byPrice?: PriceBreakdown[],
): SunburstNode => {
  const slices = getPriceSlices(amount, byPrice);
  const ramp =
    category === 'tickets'
      ? statsColors.value.ticketPrices
      : category === 'subscriptions'
        ? statsColors.value.subscriptionPrices
        : [];
  return {
    category,
    name: formatCount(category, count),
    value: amount,
    shortLabel: i18n.t(`stats.usage.distribution.${category}`),
    label: { color: getReadableTextColor(color) },
    itemStyle: {
      color,
      opacity: getOpacity(category),
      ...getHighlightBorder(category),
      // Debt is hatched to be told apart from the lightest (cheapest) tickets
      ...(category === 'debt' && { decal: statsColors.value.debtDecal }),
    },
    ...(slices.length > 0 && {
      children: slices.map((slice, index) => ({
        category,
        price: slice.price,
        // The count is part of the label (e.g. "12 tickets at 8 €")
        name: i18n.t(
          `stats.usage.${category}.byPrice.label`,
          { count: fractionNumber(slice.count), price: formatAmount(slice.price) },
          slice.count,
        ),
        value: slice.amount,
        shortLabel: formatAmount(slice.price),
        label: { color: getReadableTextColor(getPriceShade(ramp, index, slices.length, color)) },
        itemStyle: {
          // From the most intense (cheapest) to the lightest (most expensive)
          color: getPriceShade(ramp, index, slices.length, color),
          opacity: getOpacity(category, slice.price),
          ...getHighlightBorder(category, slice.price),
        },
      })),
    }),
  };
};

const nodes = computed<SunburstNode[]>(() =>
  [
    buildCategoryNode(
      'tickets',
      props.usage.tickets.amount,
      props.usage.tickets.count,
      statsColors.value.ticket,
      props.usage.tickets.byPrice,
    ),
    buildCategoryNode(
      'debt',
      props.usage.tickets.debt?.amount ?? 0,
      props.usage.tickets.debt?.count ?? 0,
      statsColors.value.debt,
    ),
    buildCategoryNode(
      'subscriptions',
      props.usage.subscriptions.amount,
      props.usage.subscriptions.count,
      statsColors.value.subscription,
      props.usage.subscriptions.byPrice,
    ),
  ].filter(({ value }) => value > 0),
);

const total = computed(() => nodes.value.reduce((sum, node) => sum + node.value, 0));

const options = computed<ComposeOption<SunburstSeriesOption | TooltipComponentOption>>(() => ({
  tooltip: {
    trigger: 'item',
    confine: true,
    formatter: (params) => {
      const { value, data } = params as CallbackDataParams;
      const { name } = data as SunburstNode;
      const percent = total.value
        ? fractionNumber(((value as number) / total.value) * 100, undefined, {
            maximumFractionDigits: 1,
          })
        : 0;
      return `${name}<br /><b>${formatAmount(value as number)}</b> (${percent}%)`;
    },
  },
  series: {
    type: 'sunburst',
    radius: ['45%', '92%'],
    // Keep the data order (prices are already sorted) instead of sorting by value
    sort: () => 0,
    // Clicking filters the members list instead of zooming into the node
    nodeClick: false,
    cursor: 'pointer',
    itemStyle: {
      borderColor: theme.value === 'dark' ? '#262626' : '#ffffff',
      borderWidth: 2,
    },
    label: {
      color: theme.value === 'dark' ? '#f3f4f6' : '#111827',
      minAngle: 20,
      formatter: ({ data }) => (data as SunburstNode).shortLabel,
    },
    emphasis: {
      focus: 'ancestor',
    },
    levels: [
      {},
      { r0: '45%', r: '68%', label: { rotate: 'tangential' } },
      { r0: '68%', r: '92%', label: { rotate: 'tangential', fontSize: 10 } },
    ],
    data: nodes.value,
  },
}));
</script>
