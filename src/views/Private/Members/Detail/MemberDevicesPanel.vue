<template>
  <form class="shadow sm:overflow-hidden sm:rounded-md" @submit.prevent="onSubmit">
    <div class="flex flex-col items-stretch bg-white px-4 py-5 sm:p-6">
      <fieldset class="flex flex-col">
        <legend class="block font-medium text-gray-900 sm:text-sm">
          {{ $t('members.detail.profile.macAddresses.label', { count: state.devices.length }) }}
        </legend>
        <i18n-t
          class="block text-sm text-gray-500"
          keypath="members.detail.profile.macAddresses.description.text"
          scope="global"
          tag="span">
          <template #link>
            <a
              class="font-medium text-indigo-600 hover:underline"
              href="https://www.studentinternet.eu/fr/docs/nederlands/depannage/comment-puis-je-trouver-ladresse-mac-de-mon-appareil/"
              target="_blank">
              {{ $t('members.detail.profile.macAddresses.description.link') }}
            </a>
            <SvgIcon
              aria-hidden="true"
              class="inline-block size-4 pb-1 text-blue-600"
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
                  class="absolute inset-y-0 right-0 z-20 flex items-center px-3 font-medium text-indigo-600 hover:underline max-sm:hidden sm:text-sm"
                  :href="`https://maclookup.app/search/result?mac=${state.devices[index].macAddress}`"
                  target="_blank">
                  {{ $t('members.detail.profile.macAddresses.check') }}
                  <SvgIcon
                    aria-hidden="true"
                    class="ml-1 inline-block size-5"
                    :path="mdiOpenInNew"
                    type="mdi" />
                </a>
              </template>

              <template #after>
                <button
                  class="relative -ml-px inline-flex items-center gap-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  type="button"
                  @click="() => onRemoveMacAddress(index)">
                  <SvgIcon
                    aria-hidden="true"
                    class="size-5 text-gray-400"
                    :path="mdiClose"
                    type="mdi" />
                  <span>{{ $t('members.detail.profile.macAddresses.remove') }}</span>
                </button>
              </template>
            </AppTextField>
          </li>
          <li>
            <AppButton
              class="border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-gray-400"
              @click="onAddMacAddress">
              <SvgIcon aria-hidden="true" class="mr-2 size-5" :path="mdiPlus" type="mdi" />
              {{ $t('members.detail.profile.macAddresses.add', { count: state.devices.length }) }}
            </AppButton>
          </li>
        </ul>
      </fieldset>
    </div>

    <div
      class="flex flex-row flex-wrap gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
      <AppButton
        class="border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500"
        :icon="mdiCheckAll"
        :loading="state.isSubmitting"
        type="submit">
        {{ $t('members.detail.profile.macAddresses.apply') }}
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
import AppTextField from '@/components/form/AppTextField.vue';
import {
  getVuelidateErrorFieldsCount,
  handleSilentError,
  scrollToFirstError,
} from '@/helpers/errors';
import { Device, Member, updateMemberMacAddresses } from '@/services/api/members';
import { useNotificationsStore } from '@/store/notifications';
import { mdiCheckAll, mdiClose, mdiLaptop, mdiOpenInNew, mdiPlus } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { useVuelidate } from '@vuelidate/core';
import { helpers, macAddress, required } from '@vuelidate/validators';
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
  devices: [] as Device[],

  isSubmitting: false as boolean,
  hasFailValidationOnce: false as boolean,
});

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
      props.member._id,
      state.devices.map(({ macAddress }) => macAddress),
    );
  })()
    .then(() => {
      notificationsStore.addNotification({
        message: i18n.t('members.detail.profile.macAddresses.onUpdate.success', {
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
        i18n.t('members.detail.profile.macAddresses.onUpdate.fail', {
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
      state.devices =
        member.macAddresses.map((macAddress) => ({ id: macAddress, macAddress })) || [];
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
