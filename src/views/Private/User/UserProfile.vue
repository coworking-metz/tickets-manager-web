<template>
  <article class="mx-auto flex max-h-[840px] w-full max-w-3xl grow flex-col px-6 py-12 lg:px-8">
    <Head>
      <title>{{ $t('user.profile.head.title') }}</title>
    </Head>
    <section class="my-auto flex w-full flex-col items-start sm:flex-row">
      <div class="mb-6 shrink grow basis-0">
        <dotlottie-player autoplay="true" class="h-24 min-w-40" loop :src="RollingTumbleweed" />
      </div>
      <div class="flex w-full flex-col sm:ml-6">
        <div class="sm:border-l sm:border-gray-200 sm:pl-6">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {{ $t('user.profile.title') }}
          </h1>
          <p class="mt-1 text-base text-gray-500">
            {{ $t('user.profile.description') }}
          </p>
        </div>

        <div class="mt-6 flex flex-col gap-6 sm:ml-6">
          <AppTextField
            id="name"
            class="min-w-[12rem] shrink grow basis-0"
            disabled
            hide-details
            :label="$t('user.profile.name.label')"
            :model-value="authStore.user?.name"
            name="name"
            type="text" />
          <AppTextField
            id="email"
            class="min-w-[12rem] shrink grow basis-0"
            disabled
            hide-details
            :label="$t('user.profile.email.label')"
            :model-value="authStore.user?.email"
            name="email"
            type="email" />

          <div class="flex flex-col gap-1">
            <p class="block font-medium text-gray-900 sm:text-sm">
              {{ $t('user.profile.roles.label') }}
            </p>
            <ul class="flex flex-row flex-wrap gap-2">
              <li
                v-for="role in authStore.user?.roles"
                :key="`user-role-${role}`"
                class="inline-flex items-center rounded-md bg-indigo-100 px-2.5 py-0.5 text-sm font-medium text-indigo-800">
                {{ $t(`user.profile.roles.value.${role}`) }}
              </li>
            </ul>
          </div>
        </div>

        <RadioGroup
          class="mt-6 sm:pl-6"
          :model-value="$i18n.locale"
          @update:model-value="settingsStore.setLocale">
          <RadioGroupLabel class="font-medium">
            {{ $t('user.profile.locale.label') }}
          </RadioGroupLabel>
          <div class="relative mt-1 -space-y-px rounded-md bg-white">
            <RadioGroupOption
              v-for="(locale, index) in SUPPORTED_LOCALES"
              :key="`locale-${locale}`"
              as="template"
              :value="locale"
              v-slot="{ checked, active }">
              <div
                :class="[
                  index === 0 ? 'rounded-t-md' : '',
                  index === SUPPORTED_LOCALES.length - 1 ? 'rounded-b-md' : '',
                  checked ? 'z-10 border-orange-200 bg-orange-50' : 'border-gray-200',
                  'relative flex cursor-pointer flex-col border p-4 focus:outline-none md:grid md:grid-cols-3 md:pl-4 md:pr-6',
                ]">
                <span class="flex items-center sm:text-sm">
                  <span
                    aria-hidden="true"
                    :class="[
                      checked ? 'border-transparent bg-orange-500' : 'border-gray-300 bg-white',
                      active ? 'ring-2 ring-gray-900 ring-offset-2' : '',
                      'flex h-4 w-4 items-center justify-center rounded-full border',
                    ]">
                    <span class="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  <RadioGroupLabel as="span" class="ml-3 font-medium text-gray-900">
                    {{ $t(`user.profile.locale.value.${locale}`) }}
                  </RadioGroupLabel>
                </span>
              </div>
            </RadioGroupOption>
          </div>
        </RadioGroup>

        <div class="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
          <AppButton
            class="border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500"
            @click="onLogout">
            {{ $t('action.logout') }}
          </AppButton>
        </div>
      </div>
    </section>
  </article>
</template>

<script lang="ts" setup>
import RollingTumbleweed from '@/assets/animations/tumbleweed-rolling.lottie';
import AppButton from '@/components/form/AppButton.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import { SUPPORTED_LOCALES } from '@/i18n';
import { useAuthStore } from '@/store/auth';
import { useSettingsStore } from '@/store/settings';
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue';
import { Head } from '@unhead/vue/components';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const settingsStore = useSettingsStore();

const onLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
