<template>
  <VueECharts autoresize :option="options" />
</template>

<script lang="ts" setup>
import { formatAmount } from '@/helpers/currency';
import { StatsUsage } from '@/services/api/stats/usage';
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

const i18n = useI18n();
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
      data: [
        {
          name: i18n.t('stats.usage.distribution.tickets'),
          value: props.usage.tickets.amount,
          itemStyle: { color: statsColors.value.ticket },
        },
        {
          name: i18n.t('stats.usage.distribution.debt'),
          value: props.usage.tickets.debt?.amount ?? 0,
          itemStyle: { color: statsColors.value.debt },
        },
        {
          name: i18n.t('stats.usage.distribution.subscriptions'),
          value: props.usage.subscriptions.amount,
          itemStyle: { color: statsColors.value.subscription },
        },
      ].filter(({ value }) => value > 0),
    },
  ],
}));
</script>
