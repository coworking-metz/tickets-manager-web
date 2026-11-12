<template>
  <VueECharts
    :key="`echarts-${width}`"
    ref="chart"
    class="size-full"
    :option="options"
    @click="(event) => $emit('click', event)" />
</template>

<script lang="ts" setup>
import { fractionAmount } from '@/helpers/currency';
import { PeriodUsage } from '@/services/api/stats/usage';
import { buildPriceSeries } from '@/views/Private/Stats/priceBreakdown';
import { useStatsColors } from '@/views/Private/Stats/statsColors';
import { useWindowSize } from '@vueuse/core';
import { BarChart, LineChart } from 'echarts/charts.js';
import { GridComponent, MarkLineComponent, TooltipComponent } from 'echarts/components.js';
import { use } from 'echarts/core.js';
import { CanvasRenderer } from 'echarts/renderers.js';
import { PropType, computed, ref } from 'vue';
import VueECharts from 'vue-echarts';
import type {
  GridComponentOption,
  MarkLineComponentOption,
  TooltipComponentOption,
} from 'echarts/components.js';
import type { ComposeOption } from 'echarts/core.js';

/**
 * @see https://echarts.apache.org/en/cheat-sheet.html
 */
use([MarkLineComponent, TooltipComponent, GridComponent, BarChart, LineChart, CanvasRenderer]);

defineEmits(['click']);
const props = defineProps({
  usages: {
    type: Array as PropType<PeriodUsage<'year' | 'month' | 'week' | 'day'>[]>,
    default: () => [],
  },
  /**
   * Whether to display the net income
   */
  waterfall: {
    type: Boolean,
    default: false,
  },
  thresholdFormatter: {
    type: Function as PropType<({ value }: { value: number }) => string>,
    default: null,
  },
  options: {
    type: Object as PropType<ComposeOption<GridComponentOption | TooltipComponentOption>>,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const chart = ref();
const { width } = useWindowSize();
const statsColors = useStatsColors();

const firstCharge = computed(() => props.usages.map(({ data }) => data.charges).shift());
const lastCharge = computed(() => props.usages.map(({ data }) => data.charges).pop());

const options = computed<
  ComposeOption<GridComponentOption | TooltipComponentOption | MarkLineComponentOption>
>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
    ...(props.options?.tooltip || {}),
  },
  xAxis: {
    type: 'category',
    data: props.usages.map(({ date }) => date),
    ...(props.options?.xAxis || {}),
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: (value: number) => fractionAmount(value),
      align: 'right',
      clickable: true,
    },
    splitLine: {
      show: false,
    },
  },
  series: [
    ...(props.waterfall
      ? [
          {
            silent: props.disabled,
            name: 'transparent',
            data: props.usages.map(({ data: { charges, amount } }) => {
              return {
                value: amount > charges ? charges : amount,
                itemStyle: {
                  color: 'transparent',
                },
              };
            }),
            type: 'bar',
            stack: 'net',
          },
          {
            silent: props.disabled,
            name: 'net',
            data: props.usages.map(({ data: { charges, amount } }) => {
              return {
                value: amount > charges ? amount - charges : charges - amount,
                itemStyle: {
                  color: amount > charges ? '#047857' : '#fca5a5',
                },
              };
            }),
            type: 'bar',
            stack: 'net',
          },
        ]
      : [
          ...buildPriceSeries({
            name: 'subscriptions',
            stack: 'usage',
            color: statsColors.value.subscription,
            ramp: statsColors.value.subscriptionPrices,
            periods: props.usages,
            getTotal: ({ data }) => data.subscriptions.amount,
            getByPrice: ({ data }) => data.subscriptions.byPrice,
            disabled: props.disabled,
          }),
          ...buildPriceSeries({
            name: 'tickets',
            stack: 'usage',
            color: statsColors.value.ticket,
            ramp: statsColors.value.ticketPrices,
            periods: props.usages,
            getTotal: ({ data }) => data.tickets.amount,
            getByPrice: ({ data }) => data.tickets.byPrice,
            disabled: props.disabled,
          }),
          {
            silent: props.disabled,
            name: 'debt',
            data: props.usages.map(({ data }) => ({
              value: data.tickets.debt.amount,
              itemStyle: {
                color: statsColors.value.debt,
                // Hatched to be told apart from the lightest (cheapest) tickets
                decal: statsColors.value.debtDecal,
              },
            })),
            type: 'bar',
            stack: 'usage',
            triggerLineEvent: true,
            emphasis: {
              focus: 'series',
            },
          },
        ]),
    {
      type: 'line',
      smooth: true,
      animation: false,
      smoothMonotone: 'x',
      symbol: 'rect',
      symbolSize: (_value: number, { dataIndex }: { dataIndex: number }) => {
        if (!dataIndex || dataIndex === props.usages.length - 1) {
          // quick hack to get the series width
          const bandWidth = chart.value.chart
            .getModel()
            .getComponent('series')
            .coordinateSystem.getAxis('x')
            .getBandWidth();
          return [bandWidth * 0.7 - 2, 2];
        }
        return 0;
      },
      emphasis: {
        scale: false,
      },
      itemStyle: {
        color: statsColors.value.charges,
        width: 2,
        opacity: 1,
      },
      lineStyle: {
        color: statsColors.value.charges,
        width: 2,
      },
      data: props.usages.map(({ data }) => ({ value: data.charges || '-' })),
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: {
          type: 'solid',
          // color: theme.charlestonGreen,
          color: 'transparent',
          width: 2,
          cap: 'round',
        },
        data: [
          ...(firstCharge.value !== lastCharge.value
            ? [
                {
                  yAxis: firstCharge.value,
                  label: {
                    position: 'start',
                    show: true,
                    color: statsColors.value.charges,
                    formatter: ({ value }: { value: number }) => fractionAmount(value),
                    overflow: 'break',
                    lineHeight: 16,
                  },
                },
              ]
            : []),
          {
            yAxis: lastCharge.value,
            label: {
              show: true,
              overflow: 'break',
              lineHeight: 16,
              color: statsColors.value.charges,
              ...(props.thresholdFormatter
                ? {
                    formatter: props.thresholdFormatter,
                  }
                : {}),
            },
          },
        ],
      },
    },
  ],
}));
</script>
