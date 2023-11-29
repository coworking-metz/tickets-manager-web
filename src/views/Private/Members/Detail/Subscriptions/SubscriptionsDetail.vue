<template>
  <div class="flex h-full flex-col bg-white shadow-xl">
    <div class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex items-center justify-between">
        <DialogTitle :class="['text-lg font-medium text-white', loading && 'animate-pulse']">
          <div v-if="loading" class="h-4 w-48 rounded-full bg-slate-300" />
          <span v-else-if="selectedSubscription">
            {{
              $t('subscriptions.detail.title', {
                startDate: dayjs(selectedSubscription.startDate).format('LL'),
              })
            }}
          </span>
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
      <div v-if="loading" class="h-3 w-64 rounded-full bg-slate-400" />
      <p v-else-if="selectedSubscription" class="text-sm text-indigo-300">
        {{
          $t('subscriptions.detail.description', {
            purchasedDate: dayjs(selectedSubscription.purchased).format('LL'),
            purchasedTime: dayjs(selectedSubscription.purchased).format('LT'),
          })
        }}
      </p>
    </div>
    <LoadingSpinner v-if="loading" class="m-auto h-16 w-16" />
    <form
      v-else-if="selectedSubscription"
      class="flex h-full flex-col px-4 py-6 sm:px-6"
      @submit.prevent="onSubmit">
      <Head>
        <title>
          {{
            $t('subscriptions.detail.head.title', {
              startDate: dayjs(selectedSubscription.startDate).format('LL'),
            })
          }}
        </title>
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
        class="mt-1 self-start"
        :icon="mdiCheck"
        :loading="state.isSubmitting"
        type="submit">
        {{ $t('action.edit') }}
      </AppButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppButton from '@/components/form/AppButton.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import { Member, Subscription } from '@/services/api/members';
import { useNotificationsStore } from '@/store/notifications';
import { DialogTitle } from '@headlessui/vue';
import { mdiCalendarEndOutline, mdiCalendarStartOutline, mdiCheck, mdiClose } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import dayjs from 'dayjs';
import { PropType, computed, nextTick, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  member: {
    type: Object as PropType<Member>,
    default: null,
  },
  id: {
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

const selectedSubscription = computed<Subscription | null>(() => {
  return props.member?.subscriptions.find(({ id }) => `${id}` === `${props.id}`) ?? null;
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
      notificationsStore.addErrorNotification(error, i18n.t('subscriptions.detail.onFail.message'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};

watch(
  () => selectedSubscription.value,
  (subscription) => {
    if (subscription) {
      state.started = dayjs(subscription.startDate).format('YYYY-MM-DD');
      state.ended = dayjs(subscription.endDate).format('YYYY-MM-DD');
    }
  },
  { immediate: true },
);
</script>