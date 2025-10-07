<template>
  <AppDateField multi-calendars :preset-dates="presets" range v-bind="$attrs" />
</template>

<script setup lang="ts">
import AppDateField from './AppDateField.vue';
import dayjs from 'dayjs';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const date = defineModel({
  type: [Date, String] as unknown as () => Date | string,
  default: '',
});

const i18n = useI18n();

const now = dayjs();
const presets = computed(() => [
  {
    label: i18n.t('date.preset.currentWeek'),
    value: [now.startOf('week').toDate(), now.endOf('week').toDate()],
  },
  {
    label: i18n.t('date.preset.currentMonth'),
    value: [now.startOf('month').toDate(), now.endOf('month').toDate()],
  },
  {
    label: i18n.t('date.preset.currentYear'),
    value: [now.startOf('year').toDate(), now.endOf('year').toDate()],
  },
  {
    label: i18n.t('date.preset.last30Days'),
    value: [now.subtract(30, 'day').toDate(), now.toDate()],
  },
  {
    label: i18n.t('date.preset.last6Months'),
    value: [now.subtract(6, 'month').toDate(), now.toDate()],
  },
  {
    label: i18n.t('date.preset.lastYear'),
    value: [
      now.subtract(1, 'year').startOf('year').toDate(),
      now.subtract(1, 'year').endOf('year').toDate(),
    ],
  },
  {
    label: i18n.t('date.preset.sinceYearStart'),
    value: [now.startOf('year').toDate(), now.toDate()],
  },
  {
    label: i18n.t('date.preset.sinceFirstDay'),
    value: [now.year(2014).startOf('year').toDate(), now.toDate()],
  },
]);
</script>
