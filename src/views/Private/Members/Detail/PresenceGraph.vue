<template>
  <section class="overflow-y-auto">
    <VueECharts ref="chart" class="m-auto" :option="options" style="height: 144px; width: 640px" />
  </section>
</template>

<script setup lang="ts">
import { Member } from '@/services/api/members';
import { theme } from '@/styles/colors';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import { HeatmapChart } from 'echarts/charts.js';
import {
  CalendarComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components.js';
import { use } from 'echarts/core.js';
import { CanvasRenderer } from 'echarts/renderers.js';
import { PropType, computed, ref } from 'vue';
import VueECharts from 'vue-echarts';
import { useI18n } from 'vue-i18n';
import type { HeatmapSeriesOption } from 'echarts/charts';
import type {
  TitleComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption,
  CalendarComponentOption,
} from 'echarts/components';
import type { ComposeOption } from 'echarts/core';

use([
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  CalendarComponent,
  HeatmapChart,
  CanvasRenderer,
]);

dayjs.extend(weekOfYear);

const props = defineProps({
  member: {
    type: Object as PropType<Member>,
    required: true,
  },
});
const chart = ref<InstanceType<typeof VueECharts> | null>(null);

const i18n = useI18n();

const options = computed<
  ComposeOption<
    | TitleComponentOption
    | TooltipComponentOption
    | VisualMapComponentOption
    | CalendarComponentOption
    | HeatmapSeriesOption
  >
>(() => ({
  locale: 'ZH',
  tooltip: {
    position: 'top',
    formatter: ({ data }: any) => {
      const [date, amount] = data as [string, number];
      return dayjs(date).format('LL') + ' : ' + amount;
    },
  },
  visualMap: {
    locale: 'fr-FR',
    min: 0,
    max: 1,
    show: false,
    inRange: {
      color: [theme.papayaWhip, theme.meatBrown], //From smaller to bigger value ->
    },
    // pieces: [
    //   { min: 0, max: 0.5, color: 'red' },
    //   { min: 0.5, max: 1, color: 'green' },
    // ],
  },
  calendar: {
    locale: 'fr-FR',
    top: 48,
    left: 30,
    right: 30,
    cellSize: ['auto', 'auto'],
    range: [dayjs().format('YYYY-MM-DD'), dayjs().subtract(6, 'month').format('YYYY-MM-DD')],
    itemStyle: {
      borderWidth: 0.5,
    },
    yearLabel: { show: false },
  },
  series: {
    locale: 'fr-FR',
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: props.member.presences.map(({ date, amount }) => [
      dayjs(date).format('YYYY-MM-DD'),
      ...(amount ? [amount] : []),
    ]),
  },
}));
</script>
