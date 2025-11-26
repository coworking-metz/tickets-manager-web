<template>
  <VueECharts
    :key="`echarts-${width}`"
    ref="chart"
    class="size-full"
    :option="options"
    @click="(event) => $emit('click', event)" />
</template>

<script lang="ts" setup>
import { useStatsColors } from '../statsColors';
import { ActivityPeriod } from '@/services/api/stats/activity';
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
  activities: {
    type: Array as PropType<ActivityPeriod<'year' | 'month' | 'week' | 'day'>[]>,
    default: () => [],
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
    data: props.activities.map(({ date }) => date),
    ...(props.options?.xAxis || {}),
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: (value: number) => value,
      align: 'right',
    },
    splitLine: {
      show: false,
    },
  },
  series: [
    {
      silent: props.disabled,
      name: 'members',
      data: props.activities.map(({ data }) => ({
        value: data.coworkersCount - data.newCoworkersCount,
        itemStyle: {
          color: statsColors.value.member,
        },
      })),
      type: 'bar',
      stack: 'members',
      triggerLineEvent: true,
    },
    {
      silent: props.disabled,
      name: 'new-members',
      data: props.activities.map(({ data }) => ({
        value: data.newCoworkersCount,
        itemStyle: {
          color: statsColors.value.newMember,
        },
      })),
      type: 'bar',
      stack: 'members',
      emphasis: {
        focus: 'series',
      },
      triggerLineEvent: true,
    },
    {
      silent: props.disabled,
      name: 'activity',
      data: props.activities.map(({ data }) => ({
        value: data.coworkedDaysAmount,
        itemStyle: {
          color: statsColors.value.activity,
        },
      })),
      type: 'bar',
      stack: 'activity',
      triggerLineEvent: true,
    },
  ],
}));
</script>
