<template>
  <AppTextField v-bind="$attrs">
    <template #default>
      <VueDatePicker
        v-model="date"
        auto-apply
        :preset-dates="presetDates"
        :range="range"
        text-input
        :time-config="{ enableTimePicker: false }" />
    </template>
  </AppTextField>
</template>

<script setup lang="ts">
import { PresetDate, VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import AppTextField from './AppTextField.vue';

const date = defineModel({
  type: [Date, String] as unknown as () => Date | string,
  default: '',
});

const props = defineProps({
  presetDates: {
    type: Array as () => Array<PresetDate>,
    default: () => [],
  },
  range: {
    type: Boolean,
    default: false,
  },
});
</script>
