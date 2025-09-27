<template>
  <AppPanel tag="form" @submit.prevent="onSubmit">
    <ul class="flex flex-col gap-4">
      <AppSwitchField
        as="li"
        :description="$t('members.detail.profile.capabilities.manager.description')"
        disabled
        :label="$t('members.detail.profile.capabilities.manager.label')"
        :loading="isFetchingMember"
        :model-value="member?.isAdmin" />
      <AppSwitchField
        v-model="state.canUnlockGate"
        as="li"
        :description="$t('members.detail.profile.capabilities.unlockGate.description')"
        :label="$t('members.detail.profile.capabilities.unlockGate.label')"
        :loading="isFetchingCapabilites" />
      <AppSwitchField
        v-model="state.hasParkingAccess"
        as="li"
        :description="$t('members.detail.profile.capabilities.parkingAccess.description')"
        :label="$t('members.detail.profile.capabilities.parkingAccess.label')"
        :loading="isFetchingCapabilites" />
      <AppSwitchField
        v-model="state.canUnlockDeckDoor"
        as="li"
        :description="$t('members.detail.profile.capabilities.unlockDeckDoor.description')"
        :label="$t('members.detail.profile.capabilities.unlockDeckDoor.label')"
        :loading="isFetchingCapabilites" />
      <AppSwitchField
        v-model="state.hasKeysAccess"
        as="li"
        :description="$t('members.detail.profile.capabilities.keysAccess.description')"
        :label="$t('members.detail.profile.capabilities.keysAccess.label')"
        :loading="isFetchingCapabilites" />
      <AppAlert
        v-if="capabilitiesErrorText"
        :description="capabilitiesErrorText"
        :title="$t('members.detail.profile.capabilities.onFetch.fail')"
        type="error" />
    </ul>

    <template #footer>
      <AppButtonPlain
        class="dark:focus:ring-offset-neutral-800"
        color="indigo"
        :icon="mdiCheckAll"
        :loading="state.isSubmitting"
        type="submit">
        {{ $t('members.detail.profile.capabilities.apply') }}
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
import AppAlert from '@/components/form/AppAlert.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppSwitchField from '@/components/form/AppSwitchField.vue';
import AppPanel from '@/components/layout/AppPanel.vue';
import {
  getVuelidateErrorFieldsCount,
  handleSilentError,
  scrollToFirstError,
} from '@/helpers/errors';
import { UserCapabilities } from '@/services/api/auth';
import { getMember, getMemberCapabilities, updateMemberCapabilities } from '@/services/api/members';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import { useNotificationsStore } from '@/store/notifications';
import { mdiCheckAll } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { useVuelidate } from '@vuelidate/core';
import { compact } from 'lodash';
import { computed, nextTick, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['update:member']);
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
  canUnlockGate: false as boolean,
  hasParkingAccess: false as boolean,
  canUnlockDeckDoor: false as boolean,
  hasKeysAccess: false as boolean,

  isSubmitting: false as boolean,
  hasFailValidationOnce: false as boolean,
});

const { isFetching: isFetchingMember, data: member } = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.byId(props.memberId),
    queryFn: () => getMember(props.memberId),
  })),
);

const {
  isFetching: isFetchingCapabilites,
  data: capabilities,
  errorText: capabilitiesErrorText,
} = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.capabilitiesById(props.memberId),
    queryFn: () => getMemberCapabilities(props.memberId),
  })),
);

const rules = computed(() => ({}));

const vuelidate = useVuelidate(rules, state);

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    state.hasFailValidationOnce = true;
    nextTick(scrollToFirstError);
    return;
  }

  state.isSubmitting = true;
  (async () => {
    await updateMemberCapabilities(props.memberId, {
      [UserCapabilities.UNLOCK_GATE]: state.canUnlockGate,
      [UserCapabilities.PARKING_ACCESS]: state.hasParkingAccess,
      [UserCapabilities.UNLOCK_DECK_DOOR]: state.canUnlockDeckDoor,
      [UserCapabilities.KEYS_ACCESS]: state.hasKeysAccess,
    });
  })()
    .then(() => {
      notificationsStore.addNotification({
        message: i18n.t('members.detail.profile.capabilities.onUpdate.success', {
          name: compact([member.value?.firstName, member.value?.lastName]).join(' '),
        }),
        type: 'success',
        timeout: 3_000,
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.historyById(props.memberId),
      });
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.detail.profile.capabilities.onUpdate.fail', {
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
  capabilities,
  (memberCapabilities) => {
    state.canUnlockGate = memberCapabilities?.[UserCapabilities.UNLOCK_GATE] ?? false;
    state.hasParkingAccess = memberCapabilities?.[UserCapabilities.PARKING_ACCESS] ?? false;
    state.canUnlockDeckDoor = memberCapabilities?.[UserCapabilities.UNLOCK_DECK_DOOR] ?? false;
    state.hasKeysAccess = memberCapabilities?.[UserCapabilities.KEYS_ACCESS] ?? false;
  },
  { immediate: true },
);
</script>
