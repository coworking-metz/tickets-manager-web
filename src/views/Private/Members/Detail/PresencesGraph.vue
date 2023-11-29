<template>
  <section class="overflow-y-visible max-sm:overflow-x-auto">
    <VueECharts
      ref="chart"
      :option="options"
      style="height: 172px; width: 640px"
      @click="onSelectPresence" />
  </section>
</template>

<script setup lang="ts">
import { ROUTE_NAMES } from '@/router/names';
import { Member } from '@/services/api/members';
import { theme } from '@/styles/colors';
import { useWindowSize } from '@vueuse/core';
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
import { PropType, computed, reactive, ref } from 'vue';
import VueECharts from 'vue-echarts';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { HeatmapSeriesOption } from 'echarts/charts.js';
import type {
  CalendarComponentOption,
  TitleComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption,
} from 'echarts/components.js';
import type { ComposeOption } from 'echarts/core.js';

use([
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  CalendarComponent,
  HeatmapChart,
  CanvasRenderer,
]);

dayjs.extend(weekOfYear);

const i18n = useI18n();
const router = useRouter();
const props = defineProps({
  member: {
    type: Object as PropType<Member>,
    required: true,
  },
});

const { width } = useWindowSize();
const state = reactive({
  shouldHideTooltip: false, // https://github.com/apache/echarts/issues/16454
});
const chart = ref<InstanceType<typeof VueECharts> | null>(null);

const options = computed<
  ComposeOption<
    | TitleComponentOption
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
    // pieces: [
    //   { min: 0, max: 0.5, color: 'red' },
    //   { min: 0.5, max: 1, color: 'green' },
    // ],
  },
  calendar: {
    locale: 'fr-FR',
    top: 20,
    left: 48,
    // right: 40,
    cellSize: 20,
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
      amount,
    ]),
  },
}));

const onSelectPresence = ({ data }: any) => {
  const [date] = data as [string];
  const selectedPresence = props.member.presences.find(
    (presence) => dayjs(presence.date).format('YYYY-MM-DD') === date,
  );
  if (selectedPresence) {
    if (width.value < 840) {
      state.shouldHideTooltip = true;
    }

    router
      .push({
        name: ROUTE_NAMES.MEMBERS.DETAIL.PRESENCES.DETAIL,
        params: {
          presenceId: selectedPresence.id,
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
