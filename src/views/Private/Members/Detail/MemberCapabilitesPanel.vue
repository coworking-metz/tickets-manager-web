<template>
  <form class="shadow sm:overflow-hidden sm:rounded-md" @submit.prevent="onSubmit">
    <ul class="flex flex-col gap-4 bg-white px-4 py-5 sm:p-6">
      <AppSwitchField
        as="li"
        :description="$t('members.detail.profile.capabilities.manager.description')"
        disabled
        :label="$t('members.detail.profile.capabilities.manager.label')"
        :model-value="member.isAdmin" />
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
        v-if="capabilitiesError"
        :description="capabilitiesError.message"
        :title="$t('members.detail.profile.capabilities.onFetch.fail')"
        type="error">
        <template #action>
          <AppButton
            class="self-start border border-gray-300 bg-white text-base text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-gray-400 sm:w-auto sm:text-sm"
            :loading="isFetchingCapabilites"
            @click="refetchCapabilities">
            {{ $t('action.retry') }}
          </AppButton>
        </template>
      </AppAlert>
    </ul>

    <div
      class="flex flex-row flex-wrap gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
      <AppButton
        class="border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500"
        :icon="mdiCheckAll"
        :loading="state.isSubmitting"
        type="submit">
        {{ $t('members.detail.profile.capabilities.apply') }}
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
import AppAlert from '@/components/form/AppAlert.vue';
import AppButton from '@/components/form/AppButton.vue';
import AppSwitchField from '@/components/form/AppSwitchField.vue';
import {
  getVuelidateErrorFieldsCount,
  handleSilentError,
  scrollToFirstError,
} from '@/helpers/errors';
import { UserCapabilities } from '@/services/api/auth';
import { Member, getMemberCapabilities, updateMemberCapabilities } from '@/services/api/members';
import { useNotificationsStore } from '@/store/notifications';
import { mdiCheckAll } from '@mdi/js';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { useVuelidate } from '@vuelidate/core';
import { PropType, computed, nextTick, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['update:member']);
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
  canUnlockGate: false as boolean,
  hasParkingAccess: false as boolean,
  canUnlockDeckDoor: false as boolean,
  hasKeysAccess: false as boolean,

  isSubmitting: false as boolean,
  hasFailValidationOnce: false as boolean,
});

const {
  isFetching: isFetchingCapabilites,
  data: capabilities,
  error: capabilitiesError,
  refetch: refetchCapabilities,
} = useQuery({
  queryKey: ['members', computed(() => props.member._id), 'capabilities'],
  queryFn: ({ queryKey: [_, memberId] }) => getMemberCapabilities(memberId),
  retry: false,
  refetchOnWindowFocus: false,
});

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
    await updateMemberCapabilities(props.member._id, {
      [UserCapabilities.UNLOCK_GATE]: state.canUnlockGate,
      [UserCapabilities.PARKING_ACCESS]: state.hasParkingAccess,
      [UserCapabilities.UNLOCK_DECK_DOOR]: state.canUnlockDeckDoor,
      [UserCapabilities.KEYS_ACCESS]: state.hasKeysAccess,
    });
  })()
    .then(() => {
      notificationsStore.addNotification({
        message: i18n.t('members.detail.profile.capabilities.onUpdate.success', {
          name: [props.member.firstName, props.member.lastName].filter(Boolean).join(' '),
        }),
        type: 'success',
        timeout: 3_000,
      });
      queryClient.invalidateQueries({
        queryKey: ['members', computed(() => props.member._id), 'history'],
      });
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.detail.profile.capabilities.onUpdate.fail', {
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
