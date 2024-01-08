<template>
  <section class="overflow-visible">
    <VueECharts
      ref="chart"
      :option="options"
      :style="{
        height: '172px',
        width: `${20 * ceil(dayjs(props.endDate).diff(props.startDate, 'week', true)) + 96}px`,
      }"
      @click="onSelect" />
  </section>
</template>

<script setup lang="ts">
import { ROUTE_NAMES } from '@/router/names';
import { Attendance } from '@/services/api/members';
import { theme } from '@/styles/colors';
import { useWindowSize } from '@vueuse/core';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import { HeatmapChart } from 'echarts/charts.js';
import { CalendarComponent, TooltipComponent, VisualMapComponent } from 'echarts/components.js';
import { use } from 'echarts/core.js';
import { CanvasRenderer } from 'echarts/renderers.js';
import { ceil } from 'lodash';
import { PropType, computed, reactive, ref } from 'vue';
import VueECharts from 'vue-echarts';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { HeatmapSeriesOption } from 'echarts/charts.js';
import type {
  CalendarComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption,
} from 'echarts/components.js';
import type { ComposeOption } from 'echarts/core.js';

use([TooltipComponent, VisualMapComponent, CalendarComponent, HeatmapChart, CanvasRenderer]);

dayjs.extend(weekOfYear);

const i18n = useI18n();
const router = useRouter();
const props = defineProps({
  activity: {
    type: Array as PropType<Attendance[]>,
    required: true,
  },
  startDate: {
    type: String,
    default: () => dayjs().subtract(6, 'month').format('YYYY-MM-DD'),
  },
  endDate: {
    type: String,
    default: () => dayjs().format('YYYY-MM-DD'),
  },
});

const { width } = useWindowSize();
const state = reactive({
  shouldHideTooltip: false, // https://github.com/apache/echarts/issues/16454
});
const chart = ref<InstanceType<typeof VueECharts> | null>(null);

const options = computed<
  ComposeOption<
    | TooltipComponentOption
    | VisualMapComponentOption
    | CalendarComponentOption
    | HeatmapSeriesOption
  >
>(() => ({
  tooltip: {
    position: 'top',
    show: !state.shouldHideTooltip,
    formatter: ({ data }: any) => {
      const [date, amount] = data as [string, number];
      return i18n.t('members.detail.attendance.graph.tooltip', {
        date: dayjs(date).format('LL'),
        amount:
          amount === 1
            ? i18n.t('members.detail.attendance.graph.value.FULL')
            : amount === 0.5
              ? i18n.t('members.detail.attendance.graph.value.HALF')
              : i18n.t('members.detail.attendance.graph.value.NONE'),
      });
    },
  },
  visualMap: {
    locale: 'fr-FR',
    min: 0,
    max: 1,
    show: false,
    inRange: {
      color: ['#ffffff', theme.peachYellow, theme.meatBrown], //From smaller to bigger value ->
    },
  },
  calendar: {
    locale: 'fr-FR',
    top: 20,
    left: 48,
    cellSize: 20,
    range: [props.endDate, props.startDate],
    itemStyle: {
      borderWidth: 0.5,
    },
    yearLabel: { show: false },
  },
  series: {
    locale: 'fr-FR',
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: props.activity.map(({ date, value }) => [dayjs(date).format('YYYY-MM-DD'), value]),
  },
}));

const onSelect = ({ data }: any) => {
  const [date] = data as [string];
  const selected = props.activity.find(
    (activity) => dayjs(activity.date).format('YYYY-MM-DD') === date,
  );
  if (selected) {
    if (width.value < 840) {
      state.shouldHideTooltip = true;
    }

    router
      .replace({
        name: ROUTE_NAMES.MEMBERS.DETAIL.ACTIVITY.DETAIL,
        params: {
          date: selected.date,
          id: router.currentRoute.value.params.id,
        },
      })
      .finally(() => {
        if (width.value < 840) {
          state.shouldHideTooltip = false;
        }
      });
  }
};
</script>
