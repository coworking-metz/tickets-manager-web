<template>
  <div class="flex h-full flex-col bg-white shadow-xl">
    <div class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex flex-row items-center justify-between">
        <DialogTitle :class="['text-lg font-medium text-white']">
          {{ $t('subscriptions.new.title') }}
        </DialogTitle>
        <div class="ml-3 flex h-7 items-center">
          <RouterLink
            class="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX }">
            <span class="sr-only">{{ $t('action.close') }}</span>
            <SvgIcon aria-hidden="true" class="h-6 w-6" :path="mdiClose" type="mdi" />
          </RouterLink>
        </div>
      </div>
    </div>
    <form class="flex h-full flex-col px-4 py-6 sm:px-6" @submit.prevent="onSubmit">
      <Head>
        <title>{{ $t('subscriptions.new.head.title') }}</title>
      </Head>
      <AppTextField
        id="subscription-started"
        v-model.number="state.started"
        :errors="vuelidate.started.$errors.map(({ $message }) => $message as string)"
        :label="$t('subscriptions.detail.started.label')"
        :prepend-icon="mdiCalendarStartOutline"
        required
        type="date" />

      <AppTextField
        id="subscription-ended"
        v-model.number="state.ended"
        :errors="vuelidate.ended.$errors.map(({ $message }) => $message as string)"
        :label="$t('subscriptions.detail.ended.label')"
        :prepend-icon="mdiCalendarEndOutline"
        required
        type="date" />

      <AppButton
        class="mt-1 self-start border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500"
        :icon="mdiPlus"
        :loading="state.isSubmitting"
        type="submit">
        {{ $t('action.add') }}
      </AppButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import AppButton from '@/components/form/AppButton.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import { useNotificationsStore } from '@/store/notifications';
import { DialogTitle } from '@headlessui/vue';
import { mdiCalendarEndOutline, mdiCalendarStartOutline, mdiPlus, mdiClose } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { computed, nextTick, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps({
  memberId: {
    type: String,
    required: true,
  },
});

const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const state = reactive({
  started: null as string | null,
  ended: null as string | null,
  isSubmitting: false as boolean,
});

const rules = computed(() => ({
  started: { required: withAppI18nMessage(required) },
  ended: { required: withAppI18nMessage(required) },
}));

const vuelidate = useVuelidate(rules, state);

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }

  state.isSubmitting = true;
  Promise.reject(new Error('Not implemented yet'))
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(error, i18n.t('subscriptions.new.onFail.message'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};
</script>
