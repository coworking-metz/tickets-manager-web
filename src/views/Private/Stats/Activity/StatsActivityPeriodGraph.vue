<template>
  <LoadingSpinner v-if="loading" class="m-auto size-16" />
  <EmptyState
    v-else-if="!activities.length"
    :animation="AnalyticsGraph"
    class="m-auto py-8"
    :description="$t('stats.activity.empty.description')"
    :title="$t('stats.activity.empty.title')" />
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
import { ActivityPeriod } from '@/services/api/activity';
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
  activities: {
    type: Array as PropType<ActivityPeriod<'year' | 'month' | 'week' | 'day'>[]>,
    default: () => [],
  },
  options: {
    type: Object as PropType<ComposeOption<GridComponentOption | TooltipComponentOption>>,
    default: null,
  },
});

const chart = ref();
const { width } = useWindowSize();

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
  },
  series: [
    {
      silent: true,
      name: 'members',
      data: props.activities.map(({ data }) => ({
        value: data.coworkersCount - data.newCoworkersCount,
        itemStyle: {
          color: theme.frenchSkyBlue,
        },
      })),
      type: 'bar',
      stack: 'activity',
      emphasis: {
        focus: 'series',
      },
    },
    {
      silent: true,
      name: 'new-members',
      data: props.activities.map(({ data }) => ({
        value: data.newCoworkersCount,
        itemStyle: {
          color: theme.blueCrayola,
        },
      })),
      type: 'bar',
      stack: 'activity',
      emphasis: {
        focus: 'series',
      },
    },
  ],
}));
</script>
