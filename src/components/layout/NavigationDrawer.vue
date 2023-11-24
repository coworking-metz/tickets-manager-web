<template>
  <aside class="hidden w-28 flex-col items-center overflow-y-auto bg-amber-500 py-6 md:flex">
    <div class="flex shrink-0 items-center">
      <img
        alt="Your Company"
        class="h-8 w-auto"
        src="https://tailwindui.com/img/logos/mark.svg?color=white" />
    </div>
    <nav class="mt-6 flex w-full grow flex-col gap-1 px-2">
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
          alt=""
          class="inline-block h-9 w-9 rounded-full"
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
        <span class="mt-2 text-center">{{ authStore.user?.name }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { doesRouteBelongsTo } from '@/router/helpers';
import { ROUTE_NAMES } from '@/router/names';
import { useAuthStore } from '@/store/auth';
import SvgIcon from '@jamescoyle/vue-icon';
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
      name: ROUTE_NAMES.STATS,
    },
    icon: mdiFinance,
    active: doesRouteBelongsTo(route, ROUTE_NAMES.STATS),
  },
]);
</script>
