<template>
  <VueECharts autoresize :option="options" @click="onClick" />
</template>

<script lang="ts" setup>
import { formatAmount } from '@/helpers/currency';
import { StatsUsage, UsageCategory } from '@/services/api/stats/usage';
import { useStatsColors } from '@/views/Private/Stats/statsColors';
import { PieChart } from 'echarts/charts.js';
import { TooltipComponent } from 'echarts/components.js';
import { use } from 'echarts/core.js';
import { CanvasRenderer } from 'echarts/renderers.js';
import { PropType, computed } from 'vue';
import VueECharts from 'vue-echarts';
import { useI18n } from 'vue-i18n';
import type { PieSeriesOption } from 'echarts/charts.js';
import type { TooltipComponentOption } from 'echarts/components.js';
import type { ComposeOption } from 'echarts/core.js';
import type { CallbackDataParams } from 'echarts/types/dist/shared.js';

/**
 * @see https://echarts.apache.org/en/cheat-sheet.html
 */
use([TooltipComponent, PieChart, CanvasRenderer]);

const props = defineProps({
  usage: {
    type: Object as PropType<StatsUsage>,
    required: true,
  },
});

const selected = defineModel<UsageCategory[]>('selected', {
  default: () => [],
});

const i18n = useI18n();

const onClick = (params: { dataIndex: number; data?: unknown }) => {
  const id = (params.data as { id?: UsageCategory } | undefined)?.id;
  if (!id) return;
  selected.value = selected.value.includes(id)
    ? selected.value.filter((category) => category !== id)
    : [...selected.value, id];
};
const statsColors = useStatsColors();

const options = computed<ComposeOption<PieSeriesOption | TooltipComponentOption>>(() => ({
  tooltip: {
    trigger: 'item',
    confine: true,
    formatter: (params) => {
      const { name, value, percent } = params as CallbackDataParams;
      return `${name}<br /><b>${formatAmount(value as number)}</b> (${percent}%)`;
    },
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '90%'],
      label: { show: false },
      labelLine: { show: false },
      itemStyle: {
        borderColor: 'transparent',
        borderWidth: 1,
      },
      emphasis: {
        scale: true,
        scaleSize: 4,
      },
      cursor: 'pointer',
      data: (
        [
          {
            id: 'tickets',
            name: i18n.t('stats.usage.distribution.tickets'),
            value: props.usage.tickets.amount,
            color: statsColors.value.ticket,
          },
          {
            id: 'debt',
            name: i18n.t('stats.usage.distribution.debt'),
            value: props.usage.tickets.debt?.amount ?? 0,
            color: statsColors.value.debt,
          },
          {
            id: 'subscriptions',
            name: i18n.t('stats.usage.distribution.subscriptions'),
            value: props.usage.subscriptions.amount,
            color: statsColors.value.subscription,
          },
        ] as const
      )
        .filter(({ value }) => value > 0)
        .map(({ id, name, value, color }) => ({
          id,
          name,
          value,
          itemStyle: {
            color,
            opacity: !selected.value.length || selected.value.includes(id) ? 1 : 0.3,
          },
        })),
    },
  ],
}));
</script>
