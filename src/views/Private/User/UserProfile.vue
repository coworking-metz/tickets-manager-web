<template>
  <article class="mx-auto flex w-full max-w-7xl grow flex-col px-3 py-12 sm:pt-40">
    <Head>
      <title>{{ $t('user.profile.head.title') }}</title>
    </Head>
    <section class="flex w-full max-w-3xl flex-col items-start md:flex-row">
      <div class="mb-6 shrink grow basis-0">
        <RouterLink
          v-if="authStore.user?.id"
          class="group relative block shrink-0 self-start overflow-hidden rounded-lg"
          :to="{
            name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX,
            params: { memberId: authStore.user.id },
          }">
          <MembersThumbnail
            class="size-32 rounded-none text-5xl"
            :email="authStore.user.email"
            :name="authStore.user.name"
            :thumbnail="authStore.user.picture">
            <div
              class="absolute inset-0 flex bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-60">
              <SvgIcon aria-hidden="true" class="m-auto size-16" :path="mdiAccountEye" type="mdi" />
            </div>
          </MembersThumbnail>
        </RouterLink>
        <MembersThumbnail
          v-else
          class="size-32 overflow-hidden rounded-lg text-5xl"
          :email="authStore.user?.email"
          :name="authStore.user?.name"
          :thumbnail="authStore.user?.picture" />
      </div>
      <div class="flex w-full flex-col md:ml-6">
        <div class="md:border-l md:border-gray-200 md:pl-6 dark:border-stone-700">
          <h1
            class="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl dark:text-gray-100">
            {{ $t('user.profile.title') }}
          </h1>
          <p class="mt-1 text-base text-gray-500 dark:text-gray-400">
            {{ $t('user.profile.description') }}
          </p>
        </div>

        <div class="mt-6 flex flex-col gap-6 md:ml-6">
          <AppTextField
            id="name"
            class="min-w-48 shrink grow basis-0"
            disabled
            hide-details
            :label="$t('user.profile.name.label')"
            :model-value="authStore.user?.name"
            name="name"
            type="text" />
          <AppTextField
            id="email"
            class="min-w-48 shrink grow basis-0"
            disabled
            hide-details
            :label="$t('user.profile.email.label')"
            :model-value="authStore.user?.email"
            name="email"
            type="email" />

          <div class="flex flex-col gap-1">
            <p class="block font-medium text-gray-900 sm:text-sm dark:text-gray-100">
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

        <AppRadioGroup
          id="locale"
          class="mt-6 md:ml-6"
          :format="(locale) => $t(`user.profile.locale.value.${locale}`)"
          hide-details
          :label="$t('user.profile.locale.label')"
          :model-value="$i18n.locale"
          name="locale"
          :options="SUPPORTED_LOCALES"
          @update:model-value="settingsStore.setLocale" />

        <AppRadioGroup
          id="theme"
          class="mt-6 md:ml-6"
          :format="(theme) => $t(`user.profile.theme.value.${theme}`)"
          hide-details
          :label="$t('user.profile.theme.label')"
          :model-value="settingsStore.theme"
          name="theme"
          :options="SUPPORTED_THEMES"
          @update:model-value="settingsStore.setTheme" />

        <div class="mt-8 flex space-x-3 sm:border-l sm:border-transparent md:ml-6">
          <AppButtonPlain
            class="dark:focus:ring-offset-stone-900"
            color="indigo"
            :icon="mdiLockOutline"
            :loading="state.isLoggingOut"
            @click="onLogout">
            {{ $t('action.logout') }}
          </AppButtonPlain>
        </div>
      </div>
    </section>
  </article>
</template>

<script lang="ts" setup>
import MembersThumbnail from '../Members/MembersThumbnail.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppRadioGroup from '@/components/form/AppRadioGroup.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import { SUPPORTED_LOCALES } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import HTTP from '@/services/http';
import { SUPPORTED_THEMES } from '@/services/theme';
import { useAuthStore } from '@/store/auth';
import { useSettingsStore } from '@/store/settings';
import { mdiAccountEye, mdiLockOutline } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const router = useRouter();
const state = reactive({
  isLoggingOut: false,
});

const onLogout = async () => {
  state.isLoggingOut = true;
  authStore.logout();
  const route = router.resolve({ name: ROUTE_NAMES.HOME });
  const absoluteURL = new URL(route.href, window.location.origin).href;
  window.location.href = HTTP.getUri({
    url: '/api/auth/logout',
    params: {
      follow: absoluteURL,
      loggedOut: true,
    },
  });
};
</script>
