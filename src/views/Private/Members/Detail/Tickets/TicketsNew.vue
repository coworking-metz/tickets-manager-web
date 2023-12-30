<template>
  <div class="flex h-full flex-col bg-white shadow-xl">
    <div class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex items-center justify-between">
        <DialogTitle :class="['text-lg font-medium text-white']">
          {{ $t('tickets.new.title') }}
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
        <title>{{ $t('tickets.new.head.title') }}</title>
      </Head>
      <AppTextField
        id="ticket-count"
        v-model.number="state.count"
        :errors="vuelidate.count.$errors.map(({ $message }) => $message as string)"
        :label="$t('tickets.detail.count.label')"
        :prepend-icon="mdiTicket"
        required
        type="number">
        <template #append>
          <span
            class="pointer-events-none absolute inset-y-0 right-0 z-20 mr-3 flex items-center text-gray-400 sm:text-sm">
            {{ $t('tickets.detail.count.unit', { count: state.count }) }}
          </span>
        </template>
      </AppTextField>

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
import { Member } from '@/services/api/members';
import { useNotificationsStore } from '@/store/notifications';
import { DialogTitle } from '@headlessui/vue';
import { mdiPlus, mdiClose, mdiTicket } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import useVuelidate from '@vuelidate/core';
import { numeric, required } from '@vuelidate/validators';
import { PropType, computed, nextTick, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
  member: {
    type: Object as PropType<Member>,
    default: null,
  },
});

const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const state = reactive({
  count: null as null | number,
  isSubmitting: false as boolean,
});

const rules = computed(() => ({
  count: { required: withAppI18nMessage(required), decimal: withAppI18nMessage(numeric) },
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
      notificationsStore.addErrorNotification(error, i18n.t('tickets.new.onFail.message'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};

watch(
  () => props.member,
  (member) => {
    if (member?.balance < 0) {
      state.count = Math.abs(member.balance);
    }
  },
  { immediate: true },
);
</script>
