<template>
  <LoadingSpinner v-if="loading" class="m-auto size-16" />
  <EmptyState
    v-else-if="!incomes.length"
    :animation="AnalyticsGraph"
    class="m-auto py-8"
    :description="$t('stats.incomes.empty.description')"
    :title="$t('stats.incomes.empty.title')" />
  <VueECharts
    v-else
    :key="`echarts-${width}`"
    ref="chart"
    class="size-full"
    :option="options"
    @click="$emit('click')" />
</template>

<script lang="ts" setup>
import AnalyticsGraph from '@/assets/animations/analytics-graph.lottie';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { fractionAmount } from '@/helpers/currency';
import { IncomePeriodWithCharges } from '@/services/api/incomes';
import { theme } from '@/styles/colors';
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
  loading: {
    type: Boolean,
    default: false,
  },
  incomes: {
    type: Array as PropType<IncomePeriodWithCharges<'year' | 'month' | 'week' | 'day'>[]>,
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
});

const chart = ref();
const { width } = useWindowSize();

const firstCharge = computed(() => props.incomes.map(({ data }) => data.charges).shift());
const lastCharge = computed(() => props.incomes.map(({ data }) => data.charges).pop());

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
    data: props.incomes.map(({ date }) => date),
    ...(props.options?.xAxis || {}),
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: (value: number) => fractionAmount(value),
      align: 'right',
    },
  },
  series: [
    ...(props.waterfall
      ? [
          {
            silent: true,
            name: 'transparent',
            data: props.incomes.map(({ data: { charges, incomes } }) => {
              return {
                value: incomes > charges ? charges : incomes,
                itemStyle: {
                  color: 'transparent',
                },
              };
            }),
            type: 'bar',
            stack: 'net',
          },
          {
            silent: true,
            name: 'net',
            data: props.incomes.map(({ data: { charges, incomes } }) => {
              return {
                value: incomes > charges ? incomes - charges : charges - incomes,
                itemStyle: {
                  color: incomes > charges ? '#047857' : '#fca5a5',
                },
              };
            }),
            type: 'bar',
            stack: 'net',
          },
        ]
      : [
          {
            silent: true,
            name: 'subscriptions',
            data: props.incomes.map(({ data }) => ({
              value: data.subscriptions.amount,
              itemStyle: {
                color: theme.peachYellow,
              },
            })),
            type: 'bar',
            stack: 'incomes',
          },
          {
            silent: true,
            name: 'tickets',
            data: props.incomes.map(({ data }) => ({
              value: data.tickets.amount,
              itemStyle: {
                color: theme.babyBlueEyes,
              },
            })),
            type: 'bar',
            stack: 'incomes',
          },
          {
            silent: true,
            name: 'debt',
            data: props.incomes.map(({ data }) => ({
              value: data.tickets.debt.amount,
              itemStyle: {
                color: theme.azureishWhite,
              },
            })),
            type: 'bar',
            stack: 'incomes',
          },
        ]),
    {
      type: 'line',
      smooth: true,
      smoothMonotone: 'x',
      symbol: 'rect',
      symbolSize: (_value: number, { dataIndex }: { dataIndex: number }) => {
        if (!dataIndex || dataIndex === props.incomes.length - 1) {
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
        color: theme.charlestonGreen,
        width: 2,
        opacity: 1,
      },
      lineStyle: {
        color: theme.charlestonGreen,
        width: 2,
      },
      data: props.incomes.map(({ data }) => ({ value: data.charges || '-' })),
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
