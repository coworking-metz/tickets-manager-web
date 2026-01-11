<template>
  <AppPanel tag="form" @submit.prevent="onSubmit">
    <ul class="flex flex-col gap-4">
      <AppSwitchField
        as="li"
        :description="$t('members.detail.profile.capabilities.values.MANAGER.description')"
        disabled
        :label="$t('members.detail.profile.capabilities.values.MANAGER.label')"
        :loading="isFetchingMember"
        :model-value="member?.isAdmin" />

      <AppSwitchField
        v-for="capability in uniq([
          ...Object.keys(UserCapabilities),
          ...Object.keys(capabilities ?? {}), // to render capabilities not implemented yet
        ])"
        :key="`member-capability-${capability}`"
        as="li"
        :description="$t(`members.detail.profile.capabilities.values.${capability}.description`)"
        :label="$t(`members.detail.profile.capabilities.values.${capability}.label`)"
        :loading="isFetchingCapabilites"
        :model-value="state.capabilities?.[capability as UserCapabilities] ?? false"
        @update:model-value="(enabled) => onSetCapability(capability, enabled)" />

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
      <AppButtonTonal
        class="dark:focus:ring-offset-neutral-800"
        color="indigo"
        :loading="state.isResetting"
        @click="() => (state.isResetDialogVisible = true)">
        {{ $t('members.detail.profile.capabilities.reset.label') }}
      </AppButtonTonal>
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

    <AppDialogConfirm
      v-model="state.isResetDialogVisible"
      :confirming="state.isResetting"
      :icon="mdiInformationOutline"
      :title="$t('members.detail.profile.capabilities.reset.title')"
      type="info"
      @confirm="onReset">
      <p class="mt-2 text-gray-500 sm:text-sm dark:text-gray-400">
        {{ $t('members.detail.profile.capabilities.reset.description') }}
      </p>
    </AppDialogConfirm>
  </AppPanel>
</template>

<script setup lang="ts">
import AppAlert from '@/components/form/AppAlert.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppButtonTonal from '@/components/form/AppButtonTonal.vue';
import AppSwitchField from '@/components/form/AppSwitchField.vue';
import AppDialogConfirm from '@/components/layout/AppDialogConfirm.vue';
import AppPanel from '@/components/layout/AppPanel.vue';
import {
  getVuelidateErrorFieldsCount,
  handleSilentError,
  scrollToFirstError,
} from '@/helpers/errors';
import { UserCapabilities } from '@/services/api/auth';
import {
  getMember,
  getMemberCapabilities,
  MemberCapabilities,
  updateMemberCapabilities,
} from '@/services/api/members';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import { useNotificationsStore } from '@/store/notifications';
import { mdiCheckAll, mdiInformationOutline } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { useVuelidate } from '@vuelidate/core';
import { compact, uniq } from 'lodash';
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
  capabilities: null as MemberCapabilities | null,

  isSubmitting: false as boolean,
  isResetDialogVisible: false as boolean,
  isResetting: false as boolean,
  hasFailValidationOnce: false as boolean,
});

const { isFetching: isFetchingMember, data: member } = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.profileById(props.memberId),
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

const onSetCapability = (capability: string, enabled: boolean) => {
  state.capabilities = {
    ...state.capabilities,
    [capability]: enabled,
  } as MemberCapabilities;
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
  updateMemberCapabilities(props.memberId, state.capabilities as MemberCapabilities)
    .then(() => {
      notificationsStore.addSuccessNotification(
        i18n.t('members.detail.profile.capabilities.onUpdate.success', {
          name: compact([member.value?.firstName, member.value?.lastName]).join(' '),
        }),
      );
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

const onReset = () => {
  state.isResetting = true;
  updateMemberCapabilities(props.memberId, {})
    .then(async () => {
      notificationsStore.addSuccessNotification(
        i18n.t('members.detail.profile.capabilities.onReset.success', {
          name: compact([member.value?.firstName, member.value?.lastName]).join(' '),
        }),
      );
      await Promise.all([
        queryClient.resetQueries({
          queryKey: membersQueryKeys.capabilitiesById(props.memberId),
        }),
        queryClient.invalidateQueries({
          queryKey: membersQueryKeys.historyById(props.memberId),
        }),
      ]);
      state.isResetDialogVisible = false;
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.detail.profile.capabilities.onReset.fail', {
          name: compact([member.value?.firstName, member.value?.lastName]).join(' '),
        }),
      );
      return Promise.reject(error);
    })
    .finally(() => {
      state.isResetting = false;
    });
};

watch(
  capabilities,
  (memberCapabilities) => {
    if (memberCapabilities) {
      state.capabilities = { ...memberCapabilities };
    }
  },
  { immediate: true },
);
</script>
