<template>
  <aside class="flex w-28 flex-col items-center overflow-y-auto bg-amber-500">
    <div class="mt-6 flex shrink-0 items-center max-sm:hidden">
      <img alt="Your Company" class="h-16 w-auto" :src="monoLogo" />
    </div>
    <nav class="my-6 flex w-full grow flex-col gap-1 px-2">
      <router-link
        v-for="item in sidebarNavigation"
        :key="item.label"
        :aria-current="item.active ? 'page' : undefined"
        :class="[
          item.active
            ? 'bg-amber-600 text-white'
            : 'text-amber-100 hover:bg-amber-600 hover:text-white',
          'group flex w-full flex-col items-center rounded-md p-3 text-xs font-medium no-underline',
        ]"
        :to="item.to">
        <SvgIcon
          aria-hidden="true"
          :class="[item.active ? 'text-white' : 'text-amber-100 group-hover:text-white', 'h-6 w-6']"
          :path="item.icon"
          type="mdi" />
        <span class="mt-2">{{ item.label }}</span>
      </router-link>

      <router-link
        :aria-current="$route.name === ROUTE_NAMES.USER.PROFILE ? 'page' : undefined"
        :class="[
          $route.name === ROUTE_NAMES.USER.PROFILE
            ? 'bg-amber-600 text-white'
            : 'text-amber-100 hover:bg-amber-600 hover:text-white',
          'group mt-auto flex w-full flex-col items-center rounded-md p-3 text-xs font-medium no-underline',
        ]"
        :to="{ name: ROUTE_NAMES.USER.PROFILE }">
        <img
          v-if="authStore.user?.wpUserId"
          :alt="`${$t('members.detail.profile.picture.label')} - ${authStore.user?.name}`"
          class="inline-block h-12 w-12 rounded-full object-cover object-top"
          :src="buildMemberPictureUrl(authStore.user?.wpUserId)" />
        <span class="mt-2 whitespace-nowrap text-center">{{ authStore.user?.name }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import monoLogo from '@/assets/logo-mono-inverted.svg';
import { doesRouteBelongsTo } from '@/router/helpers';
import { ROUTE_NAMES } from '@/router/names';
import { buildMemberPictureUrl } from '@/services/api/members';
import { useAuthStore } from '@/store/auth';
import { mdiAccountGroup, mdiFinance } from '@mdi/js';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouteLocationRaw, useRoute } from 'vue-router';

type NavigationItem = {
  label: string;
  to: RouteLocationRaw;
  icon: string;
  active: boolean;
};

const route = useRoute();
const authStore = useAuthStore();
const i18n = useI18n();
const sidebarNavigation = computed<NavigationItem[]>(() => [
  {
    label: i18n.t('navigation.members'),
    to: {
      name: ROUTE_NAMES.MEMBERS.LIST,
    },
    icon: mdiAccountGroup,
    active: doesRouteBelongsTo(route, ROUTE_NAMES.MEMBERS),
  },
  {
    label: i18n.t('navigation.stats'),
    to: {
      name: ROUTE_NAMES.STATS.INDEX,
    },
    icon: mdiFinance,
    active: doesRouteBelongsTo(route, ROUTE_NAMES.STATS),
  },
]);
</script>
