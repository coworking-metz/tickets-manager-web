<template>
  <AppTextField
    :id="id"
    :append-icon="appendIcon"
    :autocomplete="autocomplete"
    :clearable="clearable"
    :description="description"
    :disabled="disabled"
    :errors="errors"
    :hide-details="hideDetails"
    :hint="hint"
    :input-class="inputClass"
    :invalid="invalid"
    :label="label"
    :loading="loading"
    :model-value="displayValue"
    :name="name"
    :optional="optional"
    :placeholder="placeholder"
    :prepend-icon="prependIcon"
    readonly
    :required="required"
    :tabindex="tabindex"
    @clear="onClear"
    @click="openDialog"
    @keydown.enter.prevent="openDialog"
    @keydown.space.prevent="openDialog">
    <template #before>
      <slot name="before" />
    </template>
    <template v-for="(_, slot) of otherSlots" #[slot]="scope" :key="slot">
      <slot :name="slot" v-bind="scope" />
    </template>
    <template #after>
      <slot name="after" />
    </template>
  </AppTextField>

  <AppDialogConfirm
    v-model="isDialogVisible"
    panel-class="sm:max-w-4xl"
    :title="label"
    @confirm="onConfirm">
    <VueDatePicker
      v-model="stagedRange"
      :action-row="{ showSelect: false, showCancel: false }"
      auto-apply
      class="mt-4"
      :enable-time-picker="false"
      :hide-navigation="['time']"
      inline
      model-type="yyyy-MM-dd"
      :multi-calendars="showSingleCalendar ? 1 : 2"
      :preset-dates="resolvedPresetDates"
      range
      :week-start="1" />

    <template #confirm>
      <AppButtonPlain
        class="w-full sm:w-auto sm:text-sm"
        color="neutral"
        type="button"
        @click="isDialogVisible = false">
        {{ $t('action.cancel') }}
      </AppButtonPlain>
      <AppButtonPlain class="w-full sm:w-auto sm:text-sm" color="indigo" type="submit">
        {{ $t('action.confirm') }}
      </AppButtonPlain>
    </template>
  </AppDialogConfirm>
</template>

<script setup lang="ts">
import AppButtonPlain from './AppButtonPlain.vue';
import { type ErrorMessage } from './AppFieldHint.vue';
import AppTextField from './AppTextField.vue';
import AppDialogConfirm from '@/components/layout/AppDialogConfirm.vue';
import { DATE_FORMAT } from '@/helpers/dates';
import { PresetDate, VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useWindowSize } from '@vueuse/core';
import dayjs from 'dayjs';
import { computed, PropType, ref, useSlots, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const period = defineModel({
  type: Object as PropType<{ start: string; end: string }>,
  default: () => ({
    start: '',
    end: '',
  }),
});

const props = defineProps({
  label: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: null,
  },
  autocomplete: {
    type: String,
    default: null,
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: null,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  errors: {
    type: Array as PropType<ErrorMessage[]>,
    default: () => [],
  },
  prependIcon: {
    type: String,
    default: '',
  },
  appendIcon: {
    type: String,
    default: '',
  },
  hideDetails: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: '',
  },
  tabindex: {
    type: String,
    default: null,
  },
  optional: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  inputClass: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: null,
  },
  presetDates: {
    type: Array as PropType<PresetDate[]>,
    default: null,
  },
});

const slots = useSlots();
const otherSlots = computed(() =>
  Object.fromEntries(Object.entries(slots).filter(([name]) => !['before', 'after'].includes(name))),
);

const i18n = useI18n();
const { width } = useWindowSize();
// two side-by-side calendars plus the presets sidebar need more room than the app's
// usual mobile breakpoint, so this dialog uses its own, wider threshold
const CALENDARS_MIN_WIDTH = 900;
const showSingleCalendar = computed(() => width.value < CALENDARS_MIN_WIDTH);

const isDialogVisible = ref(false);
const stagedRange = ref<[string, string] | null>(null);

const displayValue = computed(() =>
  period.value.start && period.value.end
    ? i18n.t('period.value', {
        start: dayjs(period.value.start).format('ll'),
        end: dayjs(period.value.end).format('ll'),
      })
    : '',
);

const defaultPresetDates = computed<PresetDate[]>(() => {
  const now = dayjs();
  return [
    {
      label: i18n.t('period.shortcuts.today'),
      value: [now.format(DATE_FORMAT), now.format(DATE_FORMAT)],
    },
    {
      label: i18n.t('period.shortcuts.last7days'),
      value: [now.subtract(7, 'day').format(DATE_FORMAT), now.format(DATE_FORMAT)],
    },
    {
      label: i18n.t('period.shortcuts.currentWeek'),
      value: [now.startOf('week').format(DATE_FORMAT), now.endOf('week').format(DATE_FORMAT)],
    },
    {
      label: i18n.t('period.shortcuts.currentMonth'),
      value: [now.startOf('month').format(DATE_FORMAT), now.endOf('month').format(DATE_FORMAT)],
    },
    {
      label: i18n.t('period.shortcuts.last30days'),
      value: [now.subtract(30, 'day').format(DATE_FORMAT), now.format(DATE_FORMAT)],
    },
    {
      label: i18n.t('period.shortcuts.last6Months'),
      value: [now.subtract(6, 'month').format(DATE_FORMAT), now.format(DATE_FORMAT)],
    },
    {
      label: i18n.t('period.shortcuts.currentYear'),
      value: [now.startOf('year').format(DATE_FORMAT), now.endOf('year').format(DATE_FORMAT)],
    },
    {
      label: i18n.t('period.shortcuts.lastYear'),
      value: [
        now.subtract(1, 'year').startOf('year').format(DATE_FORMAT),
        now.subtract(1, 'year').endOf('year').format(DATE_FORMAT),
      ],
    },
    {
      label: i18n.t('period.shortcuts.sinceYearStart'),
      value: [now.startOf('year').format(DATE_FORMAT), now.format(DATE_FORMAT)],
    },
    {
      label: i18n.t('period.shortcuts.sinceFirstDay'),
      value: [now.year(2014).startOf('year').format(DATE_FORMAT), now.format(DATE_FORMAT)],
    },
  ];
});

const resolvedPresetDates = computed(() => props.presetDates ?? defaultPresetDates.value);

const openDialog = () => {
  if (props.disabled) return;
  isDialogVisible.value = true;
};

watch(isDialogVisible, (visible) => {
  if (visible) {
    stagedRange.value =
      period.value.start && period.value.end ? [period.value.start, period.value.end] : null;
  }
});

const onConfirm = () => {
  period.value = stagedRange.value
    ? { start: stagedRange.value[0], end: stagedRange.value[1] }
    : { start: '', end: '' };
  isDialogVisible.value = false;
};

const onClear = () => {
  period.value = { start: '', end: '' };
};
</script>
