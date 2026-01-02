<template>
  <AppPanel tag="form" @submit.prevent="onSubmit">
    <div class="flex flex-col items-stretch">
      <fieldset class="flex flex-col">
        <legend class="block font-medium text-gray-900 sm:text-sm dark:text-gray-100">
          {{ $t('members.detail.profile.macAddresses.label', { count: state.devices.length }) }}
        </legend>
        <i18n-t
          class="block text-sm text-gray-500 dark:text-gray-400"
          keypath="members.detail.profile.macAddresses.description.text"
          scope="global"
          tag="span">
          <template #link>
            <a
              class="font-medium text-indigo-600 hover:underline dark:text-indigo-500"
              href="https://www.studentinternet.eu/fr/docs/nederlands/depannage/comment-puis-je-trouver-ladresse-mac-de-mon-appareil/"
              target="_blank">
              {{ $t('members.detail.profile.macAddresses.description.link') }}
            </a>
            <SvgIcon
              aria-hidden="true"
              class="inline-block size-4 pb-1 text-indigo-600"
              :path="mdiOpenInNew"
              type="mdi" />
          </template>
        </i18n-t>
        <ul class="mt-1 flex flex-col">
          <li
            v-for="(device, index) in state.devices"
            :key="`device-${device.id}`"
            class="flex flex-col">
            <AppTextField
              :id="`mac-address-${index}`"
              class="app-mac-address"
              :errors="vuelidate.devices.$each.$message[index]"
              :loading="isFetchingMember"
              max-length="17"
              :model-value="state.devices[index].macAddress"
              placeholder="A0:B1:C2:D3:E4:F5"
              :prepend-icon="mdiLaptop"
              required
              @update:model-value="(value: string) => onMacAddressInput(index, value)">
              <template #append>
                <a
                  v-if="
                    state.devices[index].macAddress &&
                    !vuelidate.devices.$each.$response.$data[index].macAddress.$error
                  "
                  class="absolute inset-y-0 right-0 z-20 flex items-center px-3 font-medium text-indigo-600 hover:underline max-sm:hidden sm:text-sm dark:text-indigo-500"
                  :href="`https://maclookup.app/search/result?mac=${state.devices[index].macAddress}`"
                  target="_blank">
                  {{ $t('members.detail.profile.macAddresses.verify') }}
                  <SvgIcon
                    aria-hidden="true"
                    class="ml-1 inline-block size-5"
                    :path="mdiOpenInNew"
                    type="mdi" />
                </a>
              </template>

              <template #after>
                <AppButtonPlain
                  class="relative -ml-px rounded-none focus:z-10 dark:focus:ring-offset-neutral-800"
                  color="gray"
                  :icon="mdiSync"
                  :to="{
                    name: ROUTE_NAMES.SETTINGS,
                    query: {
                      macAddress: device.macAddress,
                    },
                  }">
                  <span class="max-sm:hidden">
                    {{ $t('members.detail.profile.macAddresses.compute') }}
                  </span>
                </AppButtonPlain>
                <AppButtonPlain
                  class="relative -ml-px rounded-none rounded-r-md dark:focus:ring-offset-neutral-800"
                  color="gray"
                  :icon="mdiClose"
                  @click="() => onRemoveMacAddress(index)">
                  <span class="max-sm:hidden">
                    {{ $t('members.detail.profile.macAddresses.remove') }}
                  </span>
                </AppButtonPlain>
              </template>
            </AppTextField>
          </li>
          <li>
            <AppButtonPlain
              class="dark:focus:ring-offset-neutral-800"
              color="neutral"
              :icon="mdiPlus"
              @click="onAddMacAddress">
              {{ $t('members.detail.profile.macAddresses.add', { count: state.devices.length }) }}
            </AppButtonPlain>
          </li>
        </ul>
      </fieldset>

      <AppAlert
        v-if="memberErrorText"
        class="mt-5"
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
        {{ $t('members.detail.profile.macAddresses.apply') }}
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
import AppTextField from '@/components/form/AppTextField.vue';
import AppPanel from '@/components/layout/AppPanel.vue';
import {
  getVuelidateErrorFieldsCount,
  handleSilentError,
  scrollToFirstError,
} from '@/helpers/errors';
import { ROUTE_NAMES } from '@/router/names';
import { Device, getMember, updateMemberMacAddresses } from '@/services/api/members';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import { useNotificationsStore } from '@/store/notifications';
import { mdiCheckAll, mdiClose, mdiLaptop, mdiOpenInNew, mdiPlus, mdiSync } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { useVuelidate } from '@vuelidate/core';
import { helpers, macAddress, required } from '@vuelidate/validators';
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
  devices: [] as Device[],

  isSubmitting: false as boolean,
  hasFailValidationOnce: false as boolean,
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
  devices: {
    $each: helpers.forEach({
      macAddress: {
        required: helpers.withMessage(i18n.t('validations.required') as string, required),
        macAddress: helpers.withMessage(
          i18n.t('validations.macAddress') as string,
          macAddress(':'),
        ),
      },
    }),
  },
}));

const vuelidate = useVuelidate(rules, state);

const onAddMacAddress = () => {
  state.devices.push({ id: '', macAddress: '' });
  nextTick(() => document.getElementById(`mac-address-${state.devices.length - 1}`)?.focus());
};

const onRemoveMacAddress = (deviceIndex: number) => {
  state.devices.splice(deviceIndex, 1);
};

const onMacAddressInput = (deviceIndex: number, userInput: string) => {
  let macAddress = userInput.toUpperCase().replace(/\W/gi, ''); // Remove all non-alphanumeric characters;
  if (macAddress.length >= 3) {
    macAddress = macAddress.replace(/(.{2})/g, '$1:'); // Append a colon (:) after every second character;
  }
  state.devices[deviceIndex].macAddress = macAddress.slice(0, 17);
};

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    state.hasFailValidationOnce = true;
    nextTick(scrollToFirstError);
    return;
  }

  state.isSubmitting = true;
  (async () => {
    await updateMemberMacAddresses(
      props.memberId,
      state.devices.map(({ macAddress }) => macAddress),
    );
  })()
    .then(() => {
      notificationsStore.addSuccessNotification(
        i18n.t('members.detail.profile.macAddresses.onUpdate.success', {
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
        i18n.t('members.detail.profile.macAddresses.onUpdate.fail', {
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
      state.devices =
        fetchedMember.macAddresses.map((macAddress) => ({ id: macAddress, macAddress })) || [];
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.app-mac-address:deep(input) {
  text-transform: uppercase;
}
</style>
