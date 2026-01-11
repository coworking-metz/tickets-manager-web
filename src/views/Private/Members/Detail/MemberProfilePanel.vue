<template>
  <AppPanel body-class="!pb-1" tag="form" @submit.prevent="onSubmit">
    <div class="flex flex-col items-stretch">
      <div class="flex flex-row flex-wrap gap-x-6">
        <AppTextField
          id="first-name"
          v-model="state.firstname"
          autocomplete="given-name"
          class="min-w-48 shrink grow basis-0"
          disabled
          :errors="vuelidate.firstname.$errors.map(({ $message }) => $message as string)"
          :label="$t('members.detail.profile.firstname.label')"
          :loading="isFetchingMember"
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
          :loading="isFetchingMember"
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
          :loading="isFetchingMember"
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
          :loading="isFetchingMember"
          name="birthdate"
          :prepend-icon="mdiCakeVariantOutline"
          type="date"
          @update:model-value="(birthdate) => (state.birthdate = birthdate)" />
      </div>

      <AppTextField
        id="badge"
        class="min-w-48 shrink grow basis-0"
        :description="$t('members.detail.profile.badge.description')"
        :label="$t('members.detail.profile.badge.label')"
        :loading="isFetchingMember"
        max-length="11"
        :model-value="state.badgeId"
        name="badge"
        placeholder="A1:2B:C3:4D"
        :prepend-icon="mdiCreditCardOutline"
        type="text"
        @update:model-value="onBadgeIdInput">
        <template #after>
          <AppButtonPlain
            class="relative -ml-px mt-1 self-stretch rounded-none rounded-r-md dark:focus:ring-offset-neutral-800"
            color="gray"
            :icon="mdiCellphoneNfc"
            @click="state.isScannerVisible = true">
            {{ $t('members.detail.profile.badge.scan') }}
          </AppButtonPlain>
        </template>
      </AppTextField>

      <NFCScannerDialog
        v-model="state.isScannerVisible"
        @update:identifier="(id) => (state.badgeId = id)" />

      <AppAlert
        v-if="memberErrorText"
        class="mb-5"
        :description="memberErrorText"
        :title="$t('members.detail.onFetch.fail')"
        type="error" />
    </div>

    <template #footer>
      <AppButtonPlain
        class="dark:focus:ring-offset-neutral-800"
        color="indigo"
        :icon="mdiCheckAll"
        :loading="state.isSubmitting"
        type="submit">
        {{ $t('action.apply') }}
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
    </template>
  </AppPanel>
</template>

<script setup lang="ts">
import NFCScannerDialog from '@/components/NFCScannerDialog.vue';
import AppAlert from '@/components/form/AppAlert.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppPanel from '@/components/layout/AppPanel.vue';
import {
  getVuelidateErrorFieldsCount,
  handleSilentError,
  scrollToFirstError,
} from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { getMember, updateMemberBagdeId } from '@/services/api/members';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import { useNotificationsStore } from '@/store/notifications';
import { mdiCakeVariantOutline, mdiCellphoneNfc, mdiCheckAll, mdiCreditCardOutline } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { useVuelidate } from '@vuelidate/core';
import { email, required } from '@vuelidate/validators';
import { compact } from 'lodash';
import { computed, nextTick, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  memberId: {
    type: String,
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

const {
  isFetching: isFetchingMember,
  data: member,
  errorText: memberErrorText,
} = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.profileById(props.memberId),
    queryFn: () => getMember(props.memberId),
  })),
);

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

const onBadgeIdInput = (userInput: string) => {
  let badgeId = userInput.toUpperCase().replace(/\W/gi, ''); // Remove all non-alphanumeric characters;
  if (badgeId.length >= 3) {
    badgeId = badgeId.replace(/(.{2})/g, '$1:'); // Append a colon (:) after every second character;
  }
  state.badgeId = badgeId.slice(0, 11);
};

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    state.hasFailValidationOnce = true;
    nextTick(scrollToFirstError);
    return;
  }
  vuelidate.value.$reset();

  state.isSubmitting = true;
  updateMemberBagdeId(props.memberId, state.badgeId as string)
    .then(() => {
      notificationsStore.addSuccessNotification(
        i18n.t('members.detail.profile.onUpdate.success', {
          name: compact([member.value?.firstName, member.value?.lastName]).join(' '),
        }),
      );
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.profileById(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.historyById(props.memberId),
      });
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.detail.profile.onUpdate.fail', {
          name: compact([member.value?.firstName, member.value?.lastName]).join(' '),
        }),
      );
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};

watch(
  member,
  (fetchedMember) => {
    if (fetchedMember) {
      state.firstname = fetchedMember.firstName || null;
      state.lastname = fetchedMember.lastName || null;
      state.email = fetchedMember.email || null;
      state.birthdate = fetchedMember.birthDate || null;
      state.badgeId = fetchedMember.badgeId || null;
    }
  },
  { immediate: true },
);
</script>
