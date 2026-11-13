<template>
  <!-- Focus the close button rather than the first text field -->
  <AppDialog
    v-model="isVisible"
    dialog-class="flex flex-col pt-4 sm:max-w-xl relative"
    :initial-focus="closeButton?.$el ?? null">
    <header class="mx-3 flex flex-row items-start sm:mx-6">
      <h2
        class="shrink grow text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        {{ $t('labelPrinter.title') }}
      </h2>
    </header>

    <ErrorState
      v-if="printer.unsupportedReason"
      class="m-auto pb-8"
      :description="
        $t(
          printer.unsupportedReason === 'insecure'
            ? 'labelPrinter.onInsecure.description'
            : 'labelPrinter.onUnavailable.description',
        )
      "
      :title="
        $t(
          printer.unsupportedReason === 'insecure'
            ? 'labelPrinter.onInsecure.title'
            : 'labelPrinter.onUnavailable.title',
        )
      ">
      <template #action><i></i></template>
    </ErrorState>
    <form v-else class="flex flex-col" @submit.prevent="onPrint">
      <div class="mx-3 mt-4 flex flex-col sm:mx-6">
        <figure class="flex flex-col gap-1">
          <div class="overflow-x-scroll rounded-md border border-gray-300 bg-white p-2">
            <canvas ref="preview" class="h-16 max-w-none [image-rendering:pixelated]" />
          </div>
          <p class="text-right text-xs text-gray-500 dark:text-gray-400">
            {{
              $t('labelPrinter.length', {
                length: Math.ceil(state.length ?? 0),
                max: LABEL_MAX_LENGTH_MM,
              })
            }}
          </p>
        </figure>

        <AppTextField
          id="label-text"
          v-model="state.text"
          :errors="vuelidate.text.$errors.map(({ $message }) => $message as string)"
          :label="$t('labelPrinter.text.label')"
          name="label-text"
          required />

        <AppToggleField
          id="label-font"
          v-model="state.fontFamily"
          :errors="vuelidate.fontFamily.$errors.map(({ $message }) => $message as string)"
          :format="(family: string) => family"
          :label="$t('labelPrinter.font.label')"
          :options="LABEL_FONTS.map(({ family }) => family)">
          <template #option="{ option }">
            <span
              :style="{
                fontFamily: `'${option}'`,
                fontWeight: fontOf(option).weight,
              }">
              {{ option }}
            </span>
          </template>
        </AppToggleField>

        <div class="flex flex-row flex-wrap items-end gap-4">
          <AppNumericField
            id="label-size"
            v-model="state.heightMm"
            class="min-w-20 shrink grow basis-0"
            :errors="vuelidate.heightMm.$errors.map(({ $message }) => $message as string)"
            :hint="
              $t('labelPrinter.size.hint', {
                min: formatNumber(MIN_HEIGHT_MM),
                max: formatNumber(MAX_HEIGHT_MM),
              })
            "
            input-class="!pr-12"
            :label="$t('labelPrinter.size.label')"
            name="label-size"
            :options="{ ...NUMERIC_OPTIONS, decimalPlaces: 1, maximumValue: `${MAX_HEIGHT_MM}` }">
            <template #append>
              <span
                class="pointer-events-none absolute inset-y-0 right-0 z-20 flex w-10 items-center text-gray-500 sm:text-sm dark:text-gray-400">
                {{ $t('labelPrinter.size.unit') }}
              </span>
            </template>
          </AppNumericField>
          <AppNumericField
            id="label-letter-spacing"
            v-model="state.letterSpacingPercent"
            class="min-w-20 shrink grow basis-0"
            :errors="
              vuelidate.letterSpacingPercent.$errors.map(({ $message }) => $message as string)
            "
            :hint="
              $t('labelPrinter.letterSpacing.hint', {
                min: formatNumber(0),
                max: formatNumber(MAX_LETTER_SPACING_PERCENT),
              })
            "
            input-class="!pr-12"
            :label="$t('labelPrinter.letterSpacing.label')"
            name="label-letter-spacing"
            :options="{
              ...NUMERIC_OPTIONS,
              decimalPlaces: 0,
              maximumValue: `${MAX_LETTER_SPACING_PERCENT}`,
            }">
            <template #append>
              <span
                class="pointer-events-none absolute inset-y-0 right-0 z-20 flex w-10 items-center text-gray-500 sm:text-sm dark:text-gray-400">
                {{ $t('labelPrinter.letterSpacing.unit') }}
              </span>
            </template>
          </AppNumericField>
        </div>

        <AppAlert
          v-if="printer.error.value"
          class="mb-6"
          :description="
            $te(`labelPrinter.errors.byCode.${printer.error.value.code}.hint`)
              ? $t(`labelPrinter.errors.byCode.${printer.error.value.code}.hint`)
              : undefined
          "
          dismissable
          :title="$t(`labelPrinter.errors.byCode.${printer.error.value.code}.title`)"
          type="error"
          @dismiss="printer.dismissError" />

        <p v-if="printer.isConnected.value" class="text-sm text-gray-500 dark:text-gray-400">
          {{ $t('labelPrinter.connectedTo', { name: printer.deviceName.value ?? 'LetraTag' }) }}
        </p>
      </div>

      <footer
        class="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row-reverse sm:px-6 dark:border-neutral-950 dark:bg-neutral-900/80">
        <AppButtonPlain
          class="dark:ring-offset-neutral-800"
          color="indigo"
          :icon="mdiPrinter"
          :loading="printer.isConnecting.value || printer.isPrinting.value"
          type="submit">
          {{ $t('labelPrinter.print') }}
        </AppButtonPlain>
        <AppAlert
          v-if="state.hasFailValidationOnce"
          class="truncate"
          :title="
            $t('validations.invalidFields', {
              count: getVuelidateErrorFieldsCount(vuelidate.$errors),
            })
          "
          :type="vuelidate.$errors.length > 0 ? 'error' : 'success'" />
      </footer>
    </form>

    <AppButtonIcon
      ref="closeButton"
      class="absolute top-3 right-3 bg-white/5 backdrop-blur-xl dark:bg-neutral-800/5 dark:ring-offset-neutral-800"
      :icon="mdiClose"
      :title="$t('action.close')"
      @click="isVisible = false" />
  </AppDialog>
</template>

<script setup lang="ts">
import ErrorState from '@/components/ErrorState.vue';
import AppAlert from '@/components/form/AppAlert.vue';
import AppButtonIcon from '@/components/form/AppButtonIcon.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppNumericField from '@/components/form/AppNumericField.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppToggleField from '@/components/form/AppToggleField.vue';
import AppDialog from '@/components/layout/AppDialog.vue';
import { getVuelidateErrorFieldsCount, scrollToFirstError } from '@/helpers/errors';
import { formatNumber } from '@/helpers/numeric';
import useLabelPrinter, {
  DEFAULT_LETTER_SPACING,
  LABEL_FONTS,
  dotsToMm,
  FEED_STRETCH,
  HEAD_DOTS,
  LABEL_MAX_LENGTH_MM,
  loadFont,
  measureLabel,
  mmToDots,
} from '@/helpers/useLabelPrinter';
import { withAppI18nMessage } from '@/i18n';
import { useNotificationsStore } from '@/store/notifications';
import { mdiClose, mdiPrinter } from '@mdi/js';
import useVuelidate from '@vuelidate/core';
import { maxValue, minValue, required } from '@vuelidate/validators';
import { computed, nextTick, onBeforeUnmount, reactive, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type Autonumeric from 'autonumeric';

const isVisible = defineModel({
  type: Boolean,
  default: false,
});

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
});

const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const printer = useLabelPrinter();
const preview = useTemplateRef<HTMLCanvasElement>('preview');
const closeButton = useTemplateRef<InstanceType<typeof AppButtonIcon>>('closeButton');

const MIN_HEIGHT_MM = 1;
const MAX_HEIGHT_MM = Math.floor(dotsToMm(HEAD_DOTS) * 10) / 10;
const MAX_LETTER_SPACING_PERCENT = 50;
const NUMERIC_OPTIONS: Autonumeric.Options = {
  allowDecimalPadding: false,
  decimalCharacter: ',',
  decimalCharacterAlternative: '.',
  digitGroupSeparator: ' ',
  emptyInputBehavior: 'null',
  minimumValue: '0',
  modifyValueOnWheel: false,
};

const state = reactive({
  text: props.text,
  fontFamily: 'Eveleth Clean',
  heightMm: MAX_HEIGHT_MM as number | null,
  letterSpacingPercent: (DEFAULT_LETTER_SPACING * 100) as number | null,
  length: null as number | null,
  hasFailValidationOnce: false as boolean,
});

const fontOf = (family: string) =>
  LABEL_FONTS.find((font) => font.family === family) ?? LABEL_FONTS[0];

const renderOptions = computed(() => ({
  font: fontOf(state.fontFamily),
  // empty field: back to the defaults (full height, default spacing)
  size: state.heightMm ? mmToDots(state.heightMm) : HEAD_DOTS,
  letterSpacing: (state.letterSpacingPercent ?? DEFAULT_LETTER_SPACING * 100) / 100,
}));

const rules = computed(() => ({
  text: {
    required: withAppI18nMessage(required),
  },
  fontFamily: {
    required: withAppI18nMessage(required),
  },
  heightMm: {
    required: withAppI18nMessage(required),
    minValue: withAppI18nMessage(minValue(MIN_HEIGHT_MM)),
    maxValue: withAppI18nMessage(maxValue(MAX_HEIGHT_MM)),
  },
  letterSpacingPercent: {
    required: withAppI18nMessage(required),
    minValue: withAppI18nMessage(minValue(0)),
    maxValue: withAppI18nMessage(maxValue(MAX_LETTER_SPACING_PERCENT)),
  },
}));

const vuelidate = useVuelidate(rules, state, { $autoDirty: true });

let renderId = 0;
const renderPreview = async () => {
  const id = ++renderId;
  try {
    const label = await printer.renderLabel(state.text, renderOptions.value);
    const canvas = preview.value;
    if (id !== renderId || !canvas) return;
    canvas.width = label.width;
    canvas.height = label.height;
    // undo the print stretch: show the label as it will come out
    canvas.style.aspectRatio = `${label.width / FEED_STRETCH} / ${label.height}`;
    canvas.getContext('2d')?.drawImage(label, 0, 0);
    state.length = state.text.trim() ? measureLabel(label) : null;
  } catch (error) {
    console.error('[LabelPrinter] preview', error);
  }
};

const onPrint = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    state.hasFailValidationOnce = true;
    nextTick(scrollToFirstError);
    return;
  }

  vuelidate.value.$reset();

  // first print: pair the printer (still within the click user gesture required by Web Bluetooth)
  if (!printer.isConnected.value) await printer.connect();
  if (!printer.isConnected.value) return;
  if (await printer.print(state.text, renderOptions.value)) {
    notificationsStore.addSuccessNotification(i18n.t('labelPrinter.onPrint.success'));
  }
};

// font names are displayed in their own font
LABEL_FONTS.forEach((font) =>
  loadFont(font).catch((error) => console.error('[LabelPrinter] font', font.family, error)),
);

// do not keep the printer bound to a dialog that no longer exists
onBeforeUnmount(printer.disconnect);

watch(
  () => props.text,
  (text) => (state.text = text),
);

watch([isVisible, preview, () => state.text, renderOptions], () => {
  if (isVisible.value && preview.value) renderPreview();
});
</script>
