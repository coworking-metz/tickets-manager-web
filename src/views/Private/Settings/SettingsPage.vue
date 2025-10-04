<template>
  <article class="mx-auto flex w-full max-w-6xl grow flex-col items-stretch gap-6">
    <Head>
      <title>{{ $t('settings.head.title') }}</title>
    </Head>

    <div class="flex max-w-3xl shrink-0 grow flex-col gap-6 pb-6 pt-12 sm:pt-40">
      <header class="flex flex-col items-start max-sm:px-3">
        <h1
          class="text-2xl font-bold leading-7 text-gray-900 sm:mx-0 sm:truncate sm:text-3xl sm:tracking-tight dark:text-gray-100">
          {{ $t('settings.title') }}
        </h1>
        <p class="mt-1 truncate text-base text-slate-500 dark:text-slate-400">
          {{ $t('settings.description') }}
        </p>
      </header>

      <AppPanel body-class="rounded-lg" class="overflow-visible">
        <h3
          class="flex flex-row items-center gap-2 text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
          {{ $t('settings.computeAttendance.title') }}
        </h3>
        <p class="mt-2 max-w-prose whitespace-pre-line text-sm text-gray-500 dark:text-gray-400">
          {{ $t('settings.computeAttendance.description') }}
        </p>
        <form class="mt-6 flex flex-col" @submit.prevent="onSubmit">
          <div class="flex flex-row flex-wrap items-start gap-x-3">
            <AppPeriodField
              v-model="state.period"
              class="min-w-52 shrink grow basis-0"
              :errors="vuelidate.period.start.$errors.map(({ $message }) => $message as string)"
              :label="$t('settings.computeAttendance.period.label')"
              :optional="!!state.macAddress"
              :placeholder="$t('settings.computeAttendance.period.placeholder')" />
            <AppTextField
              v-model="state.macAddress"
              class="min-w-52 shrink grow basis-0"
              clearable
              :errors="vuelidate.macAddress.$errors.map(({ $message }) => $message as string)"
              :label="$t('settings.computeAttendance.macAddress.label')"
              max-length="17"
              :optional="Boolean(state.period.start && state.period.end)"
              :placeholder="$t('settings.computeAttendance.macAddress.placeholder')"
              :prepend-icon="mdiDevices" />
          </div>

          <div class="flex flex-row flex-wrap items-center gap-3">
            <AppButtonPlain
              class="dark:focus:ring-offset-neutral-800"
              color="indigo"
              :icon="mdiSync"
              :loading="state.isComputingAttendance"
              type="submit">
              {{ $t('settings.computeAttendance.submit') }}
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
          </div>
        </form>
      </AppPanel>
    </div>
  </article>
</template>

<script lang="ts" setup>
import AppAlert from '@/components/form/AppAlert.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppPeriodField from '@/components/form/AppPeriodField.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppPanel from '@/components/layout/AppPanel.vue';
import { DATE_FORMAT } from '@/helpers/dates';
import { getVuelidateErrorFieldsCount, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { computeAttendance } from '@/services/api/attendance';
import { useNotificationsStore } from '@/store/notifications';
import { mdiDevices, mdiSync } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import useVuelidate from '@vuelidate/core';
import { helpers, requiredIf, macAddress as vuelidateMacAddress } from '@vuelidate/validators';
import dayjs from 'dayjs';
import { computed, nextTick, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  macAddress: {
    type: String,
    default: null,
  },
});

const now = dayjs();
const i18n = useI18n();
const notificationStore = useNotificationsStore();
const state = reactive({
  isComputingAttendance: false,
  macAddress: null as string | null,
  period: {
    start: now.subtract(7, 'days').format(DATE_FORMAT) as string,
    end: now.format(DATE_FORMAT) as string,
  },
  hasFailValidationOnce: false,
});

const rules = computed(() => ({
  macAddress: {
    required: withAppI18nMessage(requiredIf(() => !state.period.start || !state.period.end)),
    macAddress: helpers.withMessage(
      i18n.t('validations.macAddress') as string,
      vuelidateMacAddress(':'),
    ),
  },
  period: {
    start: {
      required: withAppI18nMessage(requiredIf(() => !state.macAddress)),
    },
  },
}));

const vuelidate = useVuelidate(rules, state);

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    state.hasFailValidationOnce = true;
    nextTick(scrollToFirstError);
    return;
  }

  vuelidate.value.$reset();

  state.isComputingAttendance = true;
  computeAttendance({
    macAddress: state.macAddress,
    start: state.period.start,
    end: state.period.end,
  })
    .then(() => {
      notificationStore.addSuccessNotification(
        i18n.t('settings.computeAttendance.onCompute.success'),
      );
    })
    .catch((error) => {
      notificationStore.addErrorNotification(
        error,
        i18n.t('settings.computeAttendance.onCompute.fail'),
      );
      return Promise.reject(error);
    })
    .finally(() => {
      state.isComputingAttendance = false;
    });
};

watch(
  () => props.macAddress,
  (newMacAddress) => {
    state.macAddress = newMacAddress;
  },
  { immediate: true },
);
</script>
