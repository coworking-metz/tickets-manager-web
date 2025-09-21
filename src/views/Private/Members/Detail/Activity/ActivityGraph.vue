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
import { useTheme } from '@/services/theme';
import { theme } from '@/styles/colors';
import { useWindowSize } from '@vueuse/core';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import { HeatmapChart } from 'echarts/charts.js';
import { CalendarComponent, TooltipComponent, VisualMapComponent } from 'echarts/components.js';
import { use } from 'echarts/core.js';
import { CanvasRenderer } from 'echarts/renderers.js';
import { capitalize, ceil, range } from 'lodash';
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
    default: () => [],
  },
  startDate: {
    type: String,
    default: () => dayjs().subtract(6, 'month').format('YYYY-MM-DD'),
  },
  endDate: {
    type: String,
    default: () => dayjs().format('YYYY-MM-DD'),
  },
  nonCompliantActivity: {
    type: Array as PropType<Attendance[]>,
    default: () => [],
  },
});

const { width } = useWindowSize();
const state = reactive({
  shouldHideTooltip: false, // https://github.com/apache/echarts/issues/16454
});
const chart = ref<InstanceType<typeof VueECharts> | null>(null);

const currentTheme = useTheme();
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
    backgroundColor: theme.charlestonGreen,
    textStyle: {
      color: '#ffffff',
    },
    borderColor: 'transparent',
    formatter: ({ data: { tooltip } }: any) => tooltip,
  },
  visualMap: {
    show: false,
  },
  calendar: {
    locale: 'fr-FR',
    top: 20,
    left: 48,
    cellSize: 20,
    splitLine: {
      lineStyle: {
        color: currentTheme.value === 'light' ? theme.charlestonGreen : '#e5e7eb',
      },
    },
    monthLabel: {
      nameMap: range(12).map((index) => capitalize(dayjs().set('month', index).format('MMMM'))),
      color: currentTheme.value === 'light' ? theme.charlestonGreen : '#9ca3af',
    },
    dayLabel: {
      firstDay: 0,
      nameMap: range(7).map((index) => capitalize(dayjs().set('day', index).format('dd'))),
      color: currentTheme.value === 'light' ? theme.charlestonGreen : '#9ca3af',
    },
    range: [props.endDate, props.startDate],
    itemStyle: {
      borderWidth: 0.5,
      borderColor: currentTheme.value === 'light' ? '#e5e7eb' : '#9ca3af',
      color: currentTheme.value === 'light' ? '#ffffff' : '#000000',
    },
    yearLabel: { show: false },
  },
  series: {
    locale: 'fr-FR',
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: props.activity.map(({ date, value }) => {
      const nonCompliant = props.nonCompliantActivity.find(({ date: d }) => dayjs(d).isSame(date));
      const color = nonCompliant
        ? nonCompliant.value === 1
          ? '#b91c1c'
          : '#fca5a5' // even tho it could be a full day, the most important is its non compliant period
        : value === 1
          ? theme.meatBrown
          : value === 0.5
            ? theme.peachYellow
            : currentTheme.value === 'light'
              ? theme.papayaWhip
              : theme.charlestonGreen;

      return {
        value: [dayjs(date).format('YYYY-MM-DD'), value],
        itemStyle: {
          color,
        },
        tooltip: i18n.t('members.detail.attendance.graph.tooltip', {
          date: dayjs(date).format('ll') + '<br />',
          amount:
            value === 1
              ? i18n.t('members.detail.attendance.graph.value.FULL')
              : value === 0.5
                ? i18n.t('members.detail.attendance.graph.value.HALF')
                : i18n.t('members.detail.attendance.graph.value.NONE'),
          ...(nonCompliant &&
            nonCompliant.value !== value && {
              suffix:
                nonCompliant.value === 1
                  ? i18n.t('members.detail.attendance.graph.withNonCompliantValue.FULL')
                  : i18n.t('members.detail.attendance.graph.withNonCompliantValue.HALF'),
            }),
        }),
      };
    }),
  },
}));

const onSelect = ({ data }: any) => {
  const [date] = data.value as [string];
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
