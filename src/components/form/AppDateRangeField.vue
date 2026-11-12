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
    @click="open"
    @keydown.enter.prevent="open"
    @keydown.space.prevent="open">
    <!--
      Elements around the field (e.g. previous / next period buttons) have their own action:
      their clicks and keys must not reach the field and open the calendar
    -->
    <template #before>
      <div class="contents" @click.stop @keydown.enter.stop @keydown.space.stop>
        <slot name="before" />
      </div>
    </template>
    <template v-for="(_, slot) of otherSlots" #[slot]="scope" :key="slot">
      <slot :name="slot" v-bind="scope" />
    </template>
    <template #after>
      <div class="contents" @click.stop @keydown.enter.stop @keydown.space.stop>
        <slot name="after" />
      </div>
    </template>
  </AppTextField>

  <!-- Focus the close button rather than the first calendar day -->
  <AppDialogConfirm
    v-model="state.isCalendarOpen"
    initial-focus="close"
    panel-class="sm:max-w-4xl"
    :title="label"
    @confirm="onConfirm">
    <VueDatePicker
      v-model="state.range"
      :action-row="{ showSelect: false, showCancel: false }"
      auto-apply
      :config="{
        monthChangeOnScroll: false,
      }"
      :dark="theme === 'dark'"
      :enable-time-picker="false"
      :hide-navigation="['time']"
      inline
      model-type="yyyy-MM-dd"
      :multi-calendars="width > 768"
      :preset-dates="resolvedPresetDates"
      range
      :week-start="1">
      <template v-for="preset in resolvedPresetDates" :key="preset.slot" #[preset.slot]>
        <AppButtonText
          class="justify-start p-2! text-sm whitespace-nowrap sm:w-full"
          color="gray"
          @click="onPresetSelect(preset)">
          {{ preset.label }}
        </AppButtonText>
      </template>
    </VueDatePicker>

    <template #confirm="{ loading: confirming }">
      <AppButtonPlain
        class="w-full sm:w-auto sm:text-sm dark:focus:ring-offset-neutral-900/80"
        color="indigo"
        :loading="confirming"
        type="submit">
        {{ $t('action.apply') }}
      </AppButtonPlain>
    </template>
  </AppDialogConfirm>
</template>

<script setup lang="ts">
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppButtonText from '@/components/form/AppButtonText.vue';
import { type ErrorMessage } from '@/components/form/AppFieldHint.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppDialogConfirm from '@/components/layout/AppDialogConfirm.vue';
import { DATE_FORMAT } from '@/helpers/dates';
import { useMobileWidth } from '@/helpers/screen';
import { useTheme } from '@/services/theme';
import { PresetDate, VueDatePicker } from '@vuepic/vue-datepicker';
import { createReusableTemplate, onKeyStroke, useWindowSize } from '@vueuse/core';
import dayjs from 'dayjs';
import { computed, PropType, reactive, toValue, useSlots, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import '@vuepic/vue-datepicker/dist/main.css';

defineOptions({
  inheritAttrs: false,
});

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

const i18n = useI18n();
const isMobile = useMobileWidth();
const theme = useTheme();
const { width } = useWindowSize();
const state = reactive({
  isCalendarOpen: false,
  range: null as [string, string] | null,
});

const slots = useSlots();
const otherSlots = computed(() =>
  Object.fromEntries(Object.entries(slots).filter(([name]) => !['before', 'after'].includes(name))),
);

const [DefinePicker, ReusePicker] = createReusableTemplate();

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

// each preset gets its own slot so that selecting it applies the range right away
const resolvedPresetDates = computed(() =>
  (props.presetDates ?? defaultPresetDates.value).map((preset, index) => ({
    ...preset,
    slot: `preset-${index}`,
  })),
);

const onPresetSelect = (preset: PresetDate) => {
  const [start, end] = [toValue(preset.value)].flat();
  period.value = {
    start: dayjs(start).format(DATE_FORMAT),
    end: dayjs(end ?? start).format(DATE_FORMAT),
  };
  state.isCalendarOpen = false;
};

const open = () => {
  if (props.disabled) return;
  state.isCalendarOpen = true;
};

// the dialog handles Escape by itself, the dropdown doesn't
onKeyStroke('Escape', () => {
  state.isCalendarOpen = false;
});

watch(
  () => state.isCalendarOpen,
  (visible) => {
    if (visible) {
      state.range =
        period.value.start && period.value.end ? [period.value.start, period.value.end] : null;
    }
  },
);

const onClear = () => {
  period.value = { start: '', end: '' };
};

const onConfirm = () => {
  if (state.range) {
    const [start, end] = state.range;
    period.value = {
      start: dayjs(start).format(DATE_FORMAT),
      end: dayjs(end ?? start).format(DATE_FORMAT),
    };
  }
  state.isCalendarOpen = false;
};
</script>

<style>
/* the popper content brings its own panel styling */
.app-date-range-popper .v-popper__inner {
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.app-date-range-popper .v-popper__arrow-container {
  display: none;
}

.dp--menu {
  border: none;
}

.dp--preset-dates {
  max-width: 204px;
}
</style>
