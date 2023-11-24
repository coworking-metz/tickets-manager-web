<template>
  <form class="shadow sm:overflow-hidden sm:rounded-md" @submit.prevent="onSubmit">
    <div class="flex flex-col items-stretch bg-white px-4 py-5 sm:p-6">
      <div class="flex flex-row flex-wrap gap-x-6">
        <AppTextField
          id="first-name"
          v-model="state.firstname"
          autocomplete="given-name"
          class="grow"
          :label="$t('members.detail.profile.firstname.label')"
          name="first-name"
          type="text" />
        <AppTextField
          id="last-name"
          v-model="state.lastname"
          autocomplete="family-name"
          class="grow"
          :label="$t('members.detail.profile.lastname.label')"
          name="last-name"
          type="text" />
      </div>

      <div class="flex flex-row flex-wrap gap-x-6">
        <AppTextField
          id="email"
          v-model="state.email"
          autocomplete="email"
          class="min-w-[12rem] grow basis-0"
          :errors="vuelidate.email.$errors.map(({ $message }) => $message as string)"
          :label="$t('members.detail.profile.email.label')"
          name="email"
          type="email"
          @blur="vuelidate.email.$touch()" />
        <AppTextField
          id="phone"
          v-model="state.phone"
          autocomplete="tel"
          class="min-w-[12rem] grow basis-0"
          :label="$t('members.detail.profile.phone.label')"
          name="phone"
          type="tel" />
      </div>

      <div class="flex flex-col">
        <p class="block text-sm font-medium text-gray-700">
          {{
            $t('members.detail.profile.macAddresses.label', { count: state.macAddresses.length })
          }}
        </p>
        <i18n-t
          class="block text-gray-500"
          keypath="members.detail.profile.macAddresses.description.text"
          tag="small">
          <template #link>
            <a
              class="font-medium text-blue-600 hover:underline dark:text-blue-500"
              href=""
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
        <ul class="mt-1 flex flex-col gap-6">
          <li
            v-for="(macAddress, index) in state.macAddresses"
            :key="`mac-address-${macAddress}`"
            class="flex rounded-md shadow-sm">
            <div class="relative flex grow items-stretch focus-within:z-10">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SvgIcon
                  aria-hidden="true"
                  class="h-5 w-5 text-gray-400"
                  :path="mdiLaptop"
                  type="mdi" />
              </div>
              <input
                v-model="state.macAddresses[index].address"
                class="block w-full rounded-none rounded-l-md border-gray-300 pl-10 uppercase focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="A0:B1:C2:D3:E4:F5"
                type="text" />
            </div>
            <button
              class="relative -ml-px inline-flex items-center gap-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              type="button"
              @click="() => onRemoveMacAddress(index)">
              <SvgIcon
                aria-hidden="true"
                class="h-5 w-5 text-gray-400"
                :path="mdiClose"
                type="mdi" />
              <span>{{ $t('members.detail.profile.macAddresses.remove') }}</span>
            </button>
          </li>
          <li>
            <button
              class="inline-flex flex-row items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              type="button"
              @click="onAddMacAddress">
              <SvgIcon aria-hidden="true" class="mr-3 h-5 w-5" :path="mdiPlus" type="mdi" />
              {{
                $t('members.detail.profile.macAddresses.add', { count: state.macAddresses.length })
              }}
            </button>
          </li>
        </ul>
      </div>

      <hr class="mt-6 border-gray-200" />

      <ul class="flex flex-col py-2">
        <SwitchGroup as="li" class="flex items-center justify-between py-2">
          <div class="flex flex-col">
            <SwitchLabel as="p" class="text-sm font-medium text-gray-900" passive>
              {{ $t('members.detail.profile.features.manager.label') }}
            </SwitchLabel>
            <SwitchDescription class="text-sm text-gray-500">
              {{ $t('members.detail.profile.features.manager.description') }}
            </SwitchDescription>
          </div>
          <Switch
            v-model="state.isManager"
            :class="[
              state.isManager ? 'bg-teal-500' : 'bg-gray-200',
              'relative ml-4 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2',
            ]">
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
            <SwitchLabel as="p" class="text-sm font-medium text-gray-900" passive>
              {{ $t('members.detail.profile.features.parking.label') }}
            </SwitchLabel>
            <SwitchDescription class="text-sm text-gray-500">
              {{ $t('members.detail.profile.features.parking.description') }}
            </SwitchDescription>
          </div>
          <Switch
            v-model="state.hasParkingAccess"
            :class="[
              state.hasParkingAccess ? 'bg-teal-500' : 'bg-gray-200',
              'relative ml-4 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2',
            ]">
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
    <div class="flex flex-row bg-gray-50 px-4 py-3 sm:px-6">
      <AppButton :icon="mdiCheckAll" type="submit">
        {{ $t('action.apply') }}
      </AppButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import AppButton from '@/components/form/AppButton.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import { Member } from '@/services/api/members';
import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from '@headlessui/vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiClose, mdiLaptop, mdiCheckAll, mdiPlus, mdiOpenInNew } from '@mdi/js';
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import { watch } from 'vue';
import { PropType, reactive } from 'vue';

interface MacAddress {
  address: string;
}

const props = defineProps({
  member: {
    type: Object as PropType<Member>,
    required: true,
  },
});

const state = reactive({
  firstname: null as string | null,
  lastname: null as string | null,
  email: null as string | null,
  phone: null as string | null,
  macAddresses: [] as MacAddress[],
  isManager: false as boolean,
  hasParkingAccess: false as boolean,
});

const rules = {
  firstname: { required },
  lastname: { required },
  email: { required, email },
};

const vuelidate = useVuelidate(rules, state);

const onAddMacAddress = () => {
  state.macAddresses.push({ address: '' });
};

const onRemoveMacAddress = (index: number) => {
  state.macAddresses.splice(index, 1);
};

const onSubmit = () => {
  console.log(state.macAddresses);
};

watch(
  () => props.member,
  (member) => {
    if (member) {
      state.firstname = member.firstname || null;
      state.lastname = member.lastname || null;
      state.email = member.email || null;
      state.phone = member.phone || null;
      state.macAddresses = member.macAddresses.map((address) => ({ address })) || [];
    }
  },
  { immediate: true },
);
</script>
