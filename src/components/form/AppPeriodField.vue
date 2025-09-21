<template>
  <VueTailwindDatepicker
    v-model="period"
    :as-single="width < 640"
    :formatter="{
      date: DATE_FORMAT,
      month: 'MMM',
    }"
    :i18n="i18n.locale.value.substring(0, 2)"
    :options="
      {
        footer: {
          apply: $t('action.apply'),
          cancel: $t('action.cancel'),
        },
      } as never
    "
    :shortcuts="shortcuts"
    v-slot="{ placeholder, clear }"
    use-range
    v-bind="$attrs">
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
      :model-value="
        period.start && period.end
          ? $t('period.value', {
              start: dayjs(period.start).format('ll'),
              end: dayjs(period.end).format('ll'),
            })
          : ''
      "
      :name="name"
      :optional="optional"
      :placeholder="placeholder"
      :prepend-icon="prependIcon"
      readonly
      :required="required"
      :tabindex="tabindex"
      @clear="
        () => {
          onClear();
          clear();
        }
      ">
      <template v-for="(_, slot) of $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </AppTextField>
  </VueTailwindDatepicker>
</template>

<script setup lang="ts">
import { type ErrorMessage } from './AppFieldHint.vue';
import AppTextField from './AppTextField.vue';
import { DATE_FORMAT } from '@/helpers/dates';
import { useWindowSize } from '@vueuse/core';
import dayjs from 'dayjs';
import { computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import VueTailwindDatepicker from 'vue-tailwind-datepicker';

const period = defineModel({
  type: Object as PropType<{ start: Date | string; end: Date | string }>,
  default: () => ({
    start: '',
    end: '',
  }),
});

defineProps({
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
  type: {
    type: String,
    default: 'text',
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
});

const { width } = useWindowSize();
const i18n = useI18n();

const shortcuts = computed(() => () => [
  {
    label: i18n.t('audit.list.period.shortcuts.today'),
    atClick: () => {
      const now = dayjs();
      return [now.startOf('day').toDate(), now.add(1, 'day').toDate()];
    },
  },
  {
    label: i18n.t('audit.list.period.shortcuts.currentWeek'),
    atClick: () => {
      const now = dayjs();
      return [now.startOf('week').toDate(), now.endOf('week').toDate()];
    },
  },
  {
    label: i18n.t('audit.list.period.shortcuts.last7days'),
    atClick: () => {
      const now = dayjs();
      return [now.subtract(7, 'day').toDate(), now.toDate()];
    },
  },
  {
    label: i18n.t('audit.list.period.shortcuts.last30days'),
    atClick: () => {
      const now = dayjs();
      return [now.subtract(30, 'day').toDate(), now.toDate()];
    },
  },
  {
    label: i18n.t('audit.list.period.shortcuts.sinceFirstDay'),
    atClick: () => [dayjs('01-01-2014').toDate()],
  },
]);

const onClear = () => {
  period.value.start = '';
  period.value.end = '';
};
</script>
