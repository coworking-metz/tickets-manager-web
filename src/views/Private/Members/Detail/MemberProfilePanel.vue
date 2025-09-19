<template>
  <form class="shadow sm:overflow-hidden sm:rounded-md" @submit.prevent="onSubmit">
    <div class="flex flex-col items-stretch bg-white px-4 pt-5 sm:px-6 sm:pt-6">
      <div class="flex flex-row flex-wrap gap-x-6">
        <AppTextField
          id="first-name"
          v-model="state.firstname"
          autocomplete="given-name"
          class="min-w-48 shrink grow basis-0"
          disabled
          :errors="vuelidate.firstname.$errors.map(({ $message }) => $message as string)"
          :label="$t('members.detail.profile.firstname.label')"
          name="first-name"
          required
          type="text"
          @blur="vuelidate.firstname.$touch()" />
        <AppTextField
          id="last-name"
          v-model="state.lastname"
          autocomplete="family-name"
          class="min-w-48 shrink grow basis-0"
          disabled
          :errors="vuelidate.lastname.$errors.map(({ $message }) => $message as string)"
          :label="$t('members.detail.profile.lastname.label')"
          name="last-name"
          required
          type="text"
          @blur="vuelidate.lastname.$touch()" />
      </div>

      <div class="flex flex-row flex-wrap gap-x-6">
        <AppTextField
          id="email"
          v-model="state.email"
          autocomplete="email"
          class="min-w-48 shrink grow basis-0"
          disabled
          :errors="vuelidate.email.$errors.map(({ $message }) => $message as string)"
          :label="$t('members.detail.profile.email.label')"
          name="email"
          required
          type="email"
          @blur="vuelidate.email.$touch()" />
        <AppTextField
          id="birthdate"
          v-model="state.birthdate"
          autocomplete="bday"
          class="min-w-48 shrink grow basis-0"
          disabled
          :label="$t('members.detail.profile.birthdate.label')"
          name="birthdate"
          :prepend-icon="mdiCakeVariantOutline"
          type="date" />
      </div>

      <AppTextField
        id="badge"
        v-model="state.badgeId"
        class="min-w-48 shrink grow basis-0"
        :description="$t('members.detail.profile.badge.description')"
        :label="$t('members.detail.profile.badge.label')"
        name="badge"
        placeholder="A1:2B:C3:4D"
        :prepend-icon="mdiCreditCardOutline"
        type="text">
        <template #after>
          <button
            class="relative -ml-px mt-1 inline-flex items-center gap-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            type="button"
            @click="state.isScannerVisible = true">
            <SvgIcon aria-hidden="true" class="size-5" :path="mdiCellphoneNfc" type="mdi" />
            <span>{{ $t('members.detail.profile.badge.scan') }}</span>
          </button>
        </template>
      </AppTextField>

      <NFCScannerBottomSheet
        v-model="state.isScannerVisible"
        @update:identifier="(id) => (state.badgeId = id)" />
    </div>

    <div
      class="flex flex-row flex-wrap gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
      <AppButton
        class="border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500"
        :icon="mdiCheckAll"
        :loading="state.isSubmitting"
        type="submit">
        {{ $t('action.apply') }}
      </AppButton>
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
</template>

<script setup lang="ts">
import NFCScannerBottomSheet from '@/components/NFCScannerBottomSheet.vue';
import AppAlert from '@/components/form/AppAlert.vue';
import AppButton from '@/components/form/AppButton.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import {
  getVuelidateErrorFieldsCount,
  handleSilentError,
  scrollToFirstError,
} from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { Member, updateMemberBagdeId } from '@/services/api/members';
import { useNotificationsStore } from '@/store/notifications';
import { mdiCakeVariantOutline, mdiCellphoneNfc, mdiCheckAll, mdiCreditCardOutline } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { useVuelidate } from '@vuelidate/core';
import { email, required } from '@vuelidate/validators';
import { PropType, computed, nextTick, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  member: {
    type: Object as PropType<Member>,
    required: true,
  },
});

const queryClient = useQueryClient();
const notificationsStore = useNotificationsStore();
const i18n = useI18n();
const state = reactive({
  firstname: null as string | null,
  lastname: null as string | null,
  email: null as string | null,
  birthdate: null as string | null,
  badgeId: null as string | null,

  isSubmitting: false as boolean,
  hasFailValidationOnce: false as boolean,

  isScannerVisible: false,
});

const rules = computed(() => ({
  firstname: {
    // required: withAppI18nMessage(required)
  },
  lastname: {
    // required: withAppI18nMessage(required)
  },
  email: {
    required: withAppI18nMessage(required),
    email: withAppI18nMessage(email),
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

  state.isSubmitting = true;
  updateMemberBagdeId(props.member._id, state.badgeId as string)
    .then(() => {
      notificationsStore.addNotification({
        message: i18n.t('members.detail.profile.onUpdate.success', {
          name: [props.member.firstName, props.member.lastName].filter(Boolean).join(' '),
        }),
        type: 'success',
        timeout: 3_000,
      });
      queryClient.invalidateQueries({
        queryKey: ['members', computed(() => props.member._id)],
      });
      queryClient.invalidateQueries({
        queryKey: ['members', computed(() => props.member._id), 'history'],
      });
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.detail.profile.onUpdate.fail', {
          name: [props.member.firstName, props.member.lastName].filter(Boolean).join(' '),
        }),
      );
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};

watch(
  () => props.member,
  (member) => {
    if (member) {
      state.firstname = member.firstName || null;
      state.lastname = member.lastName || null;
      state.email = member.email || null;
      state.birthdate = member.birthDate || null;
      state.badgeId = member.badgeId || null;
    }
  },
  { immediate: true },
);
</script>
