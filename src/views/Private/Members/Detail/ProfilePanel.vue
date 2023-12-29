<template>
  <form class="shadow sm:overflow-hidden sm:rounded-md" @submit.prevent="onSubmit">
    <div class="flex flex-col items-stretch bg-white px-4 py-5 sm:p-6">
      <div class="flex flex-row flex-wrap gap-x-6">
        <AppTextField
          id="first-name"
          v-model="state.firstname"
          autocomplete="given-name"
          class="min-w-[12rem] shrink grow basis-0"
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
          class="min-w-[12rem] shrink grow basis-0"
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
          class="min-w-[12rem] shrink grow basis-0"
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
          class="min-w-[12rem] shrink grow basis-0"
          disabled
          :label="$t('members.detail.profile.birthdate.label')"
          name="birthdate"
          :prepend-icon="mdiCakeVariantOutline"
          type="date" />
      </div>

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
              class="font-medium text-blue-600 hover:underline dark:text-blue-500"
              href="https://www.studentinternet.eu/fr/docs/nederlands/depannage/comment-puis-je-trouver-ladresse-mac-de-mon-appareil/"
              target="_blank">
              {{ $t('members.detail.profile.macAddresses.description.link') }}
            </a>
            <SvgIcon
              aria-hidden="true"
              class="inline-block h-4 w-4 pb-1 text-blue-600"
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
              v-model="state.devices[index].macAddress"
              class="app-mac-address"
              :errors="vuelidate.devices.$each.$message[index]"
              placeholder="A0:B1:C2:D3:E4:F5"
              :prepend-icon="mdiLaptop"
              required
              @blur="vuelidate.email.$touch()">
              <template #append>
                <a
                  v-if="
                    state.devices[index].macAddress &&
                    !vuelidate.devices.$each.$response.$data[index].macAddress.$error
                  "
                  class="absolute inset-y-0 right-0 z-20 flex items-center px-3 font-medium text-blue-600 hover:underline max-sm:hidden sm:text-sm dark:text-blue-500"
                  :href="`https://maclookup.app/search/result?mac=${state.devices[index].macAddress}`"
                  target="_blank">
                  {{ $t('members.detail.profile.macAddresses.check') }}
                  <SvgIcon
                    aria-hidden="true"
                    class="ml-1 inline-block h-5 w-5"
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
                    class="h-5 w-5 text-gray-400"
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
              <SvgIcon aria-hidden="true" class="mr-2 h-5 w-5" :path="mdiPlus" type="mdi" />
              {{ $t('members.detail.profile.macAddresses.add', { count: state.devices.length }) }}
            </AppButton>
          </li>
        </ul>
      </fieldset>

      <hr class="mt-6 border-gray-200" />

      <ul class="flex flex-col py-2">
        <SwitchGroup as="li" class="flex items-center justify-between py-2">
          <div class="flex flex-col">
            <SwitchLabel as="p" class="font-medium text-gray-900 sm:text-sm" passive>
              {{ $t('members.detail.profile.features.manager.label') }}
            </SwitchLabel>
            <SwitchDescription class="text-sm text-gray-500">
              {{ $t('members.detail.profile.features.manager.description') }}
            </SwitchDescription>
          </div>
          <Switch
            v-model="state.isManager"
            :class="[
              'cursor-not-allowed opacity-70',
              state.isManager ? 'bg-teal-500' : 'bg-gray-200',
              'relative ml-4 inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2',
            ]"
            disabled>
            <span
              aria-hidden="true"
              :class="[
                state.isManager ? 'translate-x-5' : 'translate-x-0',
                'inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              ]" />
          </Switch>
        </SwitchGroup>
        <SwitchGroup as="li" class="flex items-center justify-between py-2">
          <div class="flex flex-col">
            <SwitchLabel as="p" class="font-medium text-gray-900 sm:text-sm" passive>
              {{ $t('members.detail.profile.features.parking.label') }}
            </SwitchLabel>
            <SwitchDescription class="text-sm text-gray-500">
              {{ $t('members.detail.profile.features.parking.description') }}
            </SwitchDescription>
          </div>
          <Switch
            v-model="state.hasParkingAccess"
            :class="[
              'cursor-not-allowed opacity-70',
              state.hasParkingAccess ? 'bg-teal-500' : 'bg-gray-200',
              'relative ml-4 inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2',
            ]"
            disabled>
            <span
              aria-hidden="true"
              :class="[
                state.hasParkingAccess ? 'translate-x-5' : 'translate-x-0',
                'inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              ]" />
          </Switch>
        </SwitchGroup>
      </ul>
    </div>
    <div class="flex flex-row border-t-[1px] border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
      <AppButton
        class="border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500"
        :icon="mdiCheckAll"
        :loading="state.isSubmitting"
        type="submit">
        {{ $t('action.apply') }}
      </AppButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import AppButton from '@/components/form/AppButton.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { Device, Member, updateMemberMacAddresses } from '@/services/api/members';
import { useNotificationsStore } from '@/store/notifications';
import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from '@headlessui/vue';
import {
  mdiClose,
  mdiLaptop,
  mdiCheckAll,
  mdiPlus,
  mdiOpenInNew,
  mdiCakeVariantOutline,
} from '@mdi/js';
import { useVuelidate } from '@vuelidate/core';
import { required, email, helpers, macAddress } from '@vuelidate/validators';
import { computed, watch } from 'vue';
import { PropType, reactive, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['update:member']);
const props = defineProps({
  member: {
    type: Object as PropType<Member>,
    required: true,
  },
});

const notificationsStore = useNotificationsStore();
const i18n = useI18n();
const state = reactive({
  firstname: null as string | null,
  lastname: null as string | null,
  email: null as string | null,
  birthdate: null as string | null,
  devices: [] as Device[],
  isManager: false as boolean,
  hasParkingAccess: false as boolean,
  isSubmitting: false as boolean,
});

const rules = computed(() => ({
  firstname: { required: withAppI18nMessage(required) },
  lastname: { required: withAppI18nMessage(required) },
  email: { required: withAppI18nMessage(required), email: withAppI18nMessage(email) },
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

const onRemoveMacAddress = (index: number) => {
  state.devices.splice(index, 1);
};

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }

  state.isSubmitting = true;
  // updateMember(props.member.id, {
  //   firstName: state.firstname,
  //   lastName: state.lastname,
  //   email: state.email,
  //   birthdate: state.birthdate,
  //   macAddresses: state.devices.map(({ macAddress }) => macAddress),
  // } as Member)
  updateMemberMacAddresses(
    props.member._id,
    state.devices.map(({ macAddress }) => macAddress),
  )
    .then((updatedMember) => {
      // emit('update:member', updatedMember);
      notificationsStore.addNotification({
        message: i18n.t('members.detail.profile.onUpdate.success', {
          name: [updatedMember.firstName, updatedMember.lastName].filter(Boolean).join(' '),
        }),
        type: 'success',
        timeout: 3_000,
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
      state.birthdate = member.birthdate || null;
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
