<template>
  <section class="overflow-visible">
    <VueECharts
      :option="options"
      :style="{
        height: '96px',
        width: '100%',
      }" />
  </section>
</template>

<script setup lang="ts">
import { Attendance } from '@/services/api/members';
import { theme } from '@/styles/colors';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import { CustomChart } from 'echarts/charts.js';
import { GridComponent, TooltipComponent, VisualMapComponent } from 'echarts/components.js';
import { graphic, use } from 'echarts/core.js';
import { CanvasRenderer } from 'echarts/renderers.js';
import { PropType, computed } from 'vue';
import VueECharts from 'vue-echarts';
import type {
  GridComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption,
} from 'echarts/components.js';
import type { ComposeOption } from 'echarts/core.js';

use([GridComponent, TooltipComponent, VisualMapComponent, CustomChart, CanvasRenderer]);

dayjs.extend(weekOfYear);

defineProps({
  activity: {
    type: Array as PropType<Attendance[]>,
    required: true,
  },
});

const startingTime = dayjs('2024-01-01T09:00:00.000Z');
const dailyActivity = [...Array(10)].map((_, index) => {
  const duration = Math.random() * 1000 * 60 * 60;
  const date = startingTime.add(index, 'hour');
  return {
    date: date,
    // duration: Math.random() * 1000 * 60 * 60,
    value: [index, date.valueOf(), date.valueOf() + duration, duration],
    itemStyle: {
      normal: {
        color: theme.meatBrown,
      },
    },
  };
});

const renderItem = (params: any, api: any) => {
  var categoryIndex = api.value(0);
  var start = api.coord([api.value(1), categoryIndex]);
  var end = api.coord([api.value(2), categoryIndex]);
  var height = api.size([0, 1])[1] * 0.6;
  var rectShape = graphic.clipRectByRect(
    {
      x: start[0],
      y: start[1] - height / 2,
      width: end[0] - start[0],
      height: height,
    },
    {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height,
    },
  );
  return (
    rectShape && {
      type: 'rect',
      transition: ['shape'],
      shape: rectShape,
      style: api.style(),
    }
  );
};

const options = computed<
  ComposeOption<TooltipComponentOption | VisualMapComponentOption | GridComponentOption>
>(() => ({
  tooltip: {
    formatter: function (params: any) {
      return (
        params.marker +
        `Started: ${dayjs(params.value[1]).format('HH[h]mm')}` +
        '<br />Duration: ' +
        Math.round(dayjs.duration(params.value[3]).asMinutes()) +
        ' minutes'
      );
    },
  },
  grid: {
    left: 20,
    height: 64,
    right: 20,
    top: 0,
  },
  xAxis: {
    min: startingTime.valueOf(),
    // scale: true,
    axisLabel: {
      formatter: function (val: number) {
        return dayjs(val).format('HH:mm');
      },
    },
  },
  yAxis: {
    show: false,
    data: ['Duration'],
  },
  series: [
    {
      type: 'custom',
      renderItem: renderItem,
      itemStyle: {
        opacity: 0.8,
      },
      encode: {
        x: [1, 2],
        y: 0,
      },
      data: dailyActivity,
    },
  ],
}));
</script>
