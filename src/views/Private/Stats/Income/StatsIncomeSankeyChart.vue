<template>
  <VueECharts autoresize :option="options" />
</template>

<script lang="ts" setup>
import { formatAmount, fractionPercentage } from '@/helpers/currency';
import {
  ChargeBreakdown,
  ChargeLabel,
  PriceBreakdown,
  StatsIncome,
} from '@/services/api/stats/income';
import { useTheme } from '@/services/theme';
import { useStatsColors } from '@/views/Private/Stats/statsColors';
import { SankeyChart } from 'echarts/charts.js';
import { TooltipComponent } from 'echarts/components.js';
import { use } from 'echarts/core.js';
import { CanvasRenderer } from 'echarts/renderers.js';
import { PropType, computed } from 'vue';
import VueECharts from 'vue-echarts';
import { useI18n } from 'vue-i18n';
import type { SankeySeriesOption } from 'echarts/charts.js';
import type { TooltipComponentOption } from 'echarts/components.js';
import type { ComposeOption } from 'echarts/core.js';
import type { CallbackDataParams } from 'echarts/types/dist/shared.js';

/**
 * @see https://echarts.apache.org/en/cheat-sheet.html
 */
use([TooltipComponent, SankeyChart, CanvasRenderer]);

// identity colors for charge categories, distinct from the ticket/subscription/membership hues
const CHARGE_COLORS: Record<ChargeLabel, string> = {
  poulaillerRent: '#4a3aa7',
  ptiPoulaillerRent: '#e87ba4',
  insurance: '#1baf7a',
  internet: '#008300',
  transactionFees: '#eb6834',
  bankFees: '#e34948',
  other: '#9ca3af',
};

/**
 * Ordinal ramps for the ticket and subscription price tiers, validated with
 * the dataviz skill's validate_palette.js --ordinal against each surface.
 */
const TICKET_PRICE_RAMP_LIGHT = ['#60a5fa', '#3b82f6', '#1d4ed8', '#1e3a8a'];
const TICKET_PRICE_RAMP_DARK = ['#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd'];
const SUBSCRIPTION_PRICE_RAMP_LIGHT = ['#f59e0b', '#d97706', '#b45309', '#78350f'];
const SUBSCRIPTION_PRICE_RAMP_DARK = ['#b45309', '#d97706', '#f59e0b', '#fbbf24'];

const TICKETS_NODE = 'tickets';
const SUBSCRIPTIONS_NODE = 'subscriptions';
const MEMBERSHIPS_NODE = 'memberships';
const INCOME_NODE = 'income';
const DEFICIT_NODE = 'deficit';
const TOTAL_CHARGES_NODE = 'totalCharges';
const NET_RESULT_NODE = 'netResult';
const ticketPriceNodeId = (price: number) => `ticketPrice-${price}`;
const subscriptionPriceNodeId = (price: number) => `subscriptionPrice-${price}`;

const props = defineProps({
  income: {
    type: Object as PropType<
      Pick<StatsIncome, 'memberships'> & {
        tickets: StatsIncome['tickets'] & { byPrice: PriceBreakdown[] };
        subscriptions: StatsIncome['subscriptions'] & { byPrice: PriceBreakdown[] };
        income: number;
        charges: number;
        chargesBreakdown: ChargeBreakdown[];
      }
    >,
    required: true,
  },
});

const i18n = useI18n();
const currentTheme = useTheme();
const statsColors = useStatsColors();

const priceColor = (ramp: { light: string[]; dark: string[] }, index: number) => {
  const colors = currentTheme.value === 'dark' ? ramp.dark : ramp.light;
  return colors[Math.min(index, colors.length - 1)];
};
const ticketPriceColor = (index: number) =>
  priceColor({ light: TICKET_PRICE_RAMP_LIGHT, dark: TICKET_PRICE_RAMP_DARK }, index);
const subscriptionPriceColor = (index: number) =>
  priceColor({ light: SUBSCRIPTION_PRICE_RAMP_LIGHT, dark: SUBSCRIPTION_PRICE_RAMP_DARK }, index);

const nodeLabel = (id: string): string => {
  if (id.startsWith('ticketPrice-')) {
    const price = Number(id.slice('ticketPrice-'.length));
    return i18n.t('stats.incomes.distribution.ticketByPrice', { price: formatAmount(price) });
  }

  if (id.startsWith('subscriptionPrice-')) {
    const price = Number(id.slice('subscriptionPrice-'.length));
    return i18n.t('stats.incomes.distribution.subscriptionByPrice', {
      price: formatAmount(price),
    });
  }

  switch (id) {
    case TICKETS_NODE:
      return i18n.t('stats.incomes.distribution.tickets');
    case SUBSCRIPTIONS_NODE:
      return i18n.t('stats.incomes.distribution.subscriptions');
    case MEMBERSHIPS_NODE:
      return i18n.t('stats.incomes.distribution.memberships');
    case INCOME_NODE:
      return i18n.t('stats.incomes.title');
    case DEFICIT_NODE:
      return i18n.t('stats.incomes.charges.deficit');
    case TOTAL_CHARGES_NODE:
      return i18n.t('stats.incomes.charges.label');
    case NET_RESULT_NODE:
      return i18n.t('stats.incomes.mode.waterfall.label');
    default:
      return i18n.t(`stats.incomes.charges.${id}`);
  }
};

const options = computed<ComposeOption<SankeySeriesOption | TooltipComponentOption>>(() => {
  const net = props.income.income - props.income.charges;
  const isDeficit = net < 0;
  const chargesBreakdown = props.income.chargesBreakdown.filter(({ amount }) => amount > 0);
  const ticketsByPrice = props.income.tickets.byPrice.filter(({ amount }) => amount > 0);
  const subscriptionsByPrice = props.income.subscriptions.byPrice.filter(
    ({ amount }) => amount > 0,
  );
  const total = props.income.income;
  const percentOf = (value: number) => (total > 0 ? value / total : 0);

  const nodes = [
    // depth 0: ticket and subscription price tiers
    ...ticketsByPrice.map(({ price, amount }, index) => ({
      name: ticketPriceNodeId(price),
      value: amount,
      depth: 0,
      itemStyle: { color: ticketPriceColor(index) },
    })),
    ...subscriptionsByPrice.map(({ price, amount }, index) => ({
      name: subscriptionPriceNodeId(price),
      value: amount,
      depth: 0,
      itemStyle: { color: subscriptionPriceColor(index) },
    })),
    // depth 1: income sources
    {
      name: TICKETS_NODE,
      value: props.income.tickets.amount,
      depth: 1,
      itemStyle: { color: statsColors.value.ticketOrder },
    },
    {
      name: SUBSCRIPTIONS_NODE,
      value: props.income.subscriptions.amount,
      depth: 1,
      itemStyle: { color: statsColors.value.subscriptionOrder },
    },
    {
      name: MEMBERSHIPS_NODE,
      value: props.income.memberships.amount,
      depth: 1,
      itemStyle: { color: statsColors.value.membershipOrder },
    },
    // depth 2: revenue, plus the deficit (if any) needed to cover expenses
    {
      name: INCOME_NODE,
      value: props.income.income,
      depth: 2,
      itemStyle: { color: statsColors.value.charges },
    },
    ...(isDeficit
      ? [{ name: DEFICIT_NODE, value: -net, depth: 2, localY: 1, itemStyle: { color: '#dc2626' } }]
      : []),
    // depth 3: total expenses, plus the net result (if any)
    {
      name: TOTAL_CHARGES_NODE,
      value: props.income.charges,
      depth: 3,
      itemStyle: { color: statsColors.value.charges },
    },
    ...(isDeficit
      ? []
      : [
          {
            name: NET_RESULT_NODE,
            value: net,
            depth: 3,
            localY: 1,
            itemStyle: { color: '#047857' },
          },
        ]),
    // depth 4: expenses detail
    ...chargesBreakdown.map(({ label, amount }) => ({
      name: label,
      value: amount,
      depth: 4,
      itemStyle: { color: CHARGE_COLORS[label] ?? CHARGE_COLORS.other },
    })),
  ];

  const links = [
    ...ticketsByPrice.map(({ price, amount }) => ({
      source: ticketPriceNodeId(price),
      target: TICKETS_NODE,
      value: amount,
    })),
    ...subscriptionsByPrice.map(({ price, amount }) => ({
      source: subscriptionPriceNodeId(price),
      target: SUBSCRIPTIONS_NODE,
      value: amount,
    })),
    ...(props.income.tickets.amount > 0
      ? [{ source: TICKETS_NODE, target: INCOME_NODE, value: props.income.tickets.amount }]
      : []),
    ...(props.income.subscriptions.amount > 0
      ? [
          {
            source: SUBSCRIPTIONS_NODE,
            target: INCOME_NODE,
            value: props.income.subscriptions.amount,
          },
        ]
      : []),
    ...(props.income.memberships.amount > 0
      ? [
          {
            source: MEMBERSHIPS_NODE,
            target: INCOME_NODE,
            value: props.income.memberships.amount,
          },
        ]
      : []),
    ...(isDeficit
      ? [
          { source: INCOME_NODE, target: TOTAL_CHARGES_NODE, value: props.income.income },
          { source: DEFICIT_NODE, target: TOTAL_CHARGES_NODE, value: -net },
        ]
      : [
          { source: INCOME_NODE, target: TOTAL_CHARGES_NODE, value: props.income.charges },
          { source: INCOME_NODE, target: NET_RESULT_NODE, value: net },
        ]),
    ...chargesBreakdown.map(({ label, amount }) => ({
      source: TOTAL_CHARGES_NODE,
      target: label,
      value: amount,
    })),
  ];

  return {
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: (params) => {
        const { dataType, name, value } = params as CallbackDataParams;
        const percent = fractionPercentage(percentOf(value as number), i18n.locale.value);
        return dataType === 'edge'
          ? `${formatAmount(value as number)} (${percent})`
          : `${nodeLabel(name)}<br /><b>${formatAmount(value as number)}</b> (${percent})`;
      },
    },
    series: [
      {
        type: 'sankey',
        emphasis: { focus: 'adjacency' },
        label: {
          formatter: (params) => {
            const { name, value } = params as CallbackDataParams;
            const percent = fractionPercentage(percentOf(value as number), i18n.locale.value);
            return `${nodeLabel(name)}\n${percent}`;
          },
        },
        lineStyle: { color: 'gradient', opacity: 0.3 },
        nodes,
        links,
      },
    ],
  };
});
</script>
