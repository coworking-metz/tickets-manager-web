<template>
  <aside class="flex w-28 flex-col items-center overflow-y-auto bg-amber-500">
    <div class="mt-6 flex shrink-0 items-center max-sm:hidden">
      <img alt="Coworking Metz" class="h-16 w-auto" :src="monoLogo" />
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
          'group flex w-full flex-col items-center rounded-md p-3 text-xs font-medium no-underline transition-colors active:bg-amber-700',
        ]"
        :to="item.to">
        <SvgIcon
          aria-hidden="true"
          :class="[item.active ? 'text-white' : 'text-amber-100 group-hover:text-white', 'size-6']"
          :path="item.icon"
          type="mdi" />
        <span class="mt-2">{{ item.label }}</span>
      </router-link>

      <router-link
        :aria-current="doesRouteBelongsTo(route, ROUTE_NAMES.MISCELLANEOUS) ? 'page' : undefined"
        :class="[
          'group mt-auto flex w-full flex-col items-center rounded-md p-3 text-xs font-medium no-underline transition-colors active:bg-amber-700',
          doesRouteBelongsTo(route, ROUTE_NAMES.MISCELLANEOUS)
            ? 'bg-amber-600 text-white'
            : 'text-amber-100 hover:bg-amber-600 hover:text-white',
        ]"
        :to="{ name: ROUTE_NAMES.MISCELLANEOUS }">
        <SvgIcon
          aria-hidden="true"
          :class="[
            doesRouteBelongsTo(route, ROUTE_NAMES.MISCELLANEOUS)
              ? 'text-white'
              : 'text-amber-100 group-hover:text-white',
            'size-6',
          ]"
          :path="mdiViewGridPlusOutline"
          type="mdi" />
        <span class="mt-2">{{ $t('navigation.miscellaneous') }}</span>
      </router-link>

      <router-link
        :aria-current="doesRouteBelongsTo(route, ROUTE_NAMES.USER) ? 'page' : undefined"
        :class="[
          'group flex w-full flex-col items-center rounded-md p-3 text-xs font-medium no-underline transition-colors active:bg-amber-700',
          doesRouteBelongsTo(route, ROUTE_NAMES.USER)
            ? 'bg-amber-600 text-white'
            : 'text-amber-100 hover:bg-amber-600 hover:text-white',
        ]"
        :to="{ name: ROUTE_NAMES.USER.PROFILE }">
        <MembersThumbnail
          :email="authStore.user?.email"
          :name="authStore.user?.name"
          :thumbnail="authStore.user?.picture" />
        <span class="mt-2 text-center">{{ authStore.user?.name }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import monoLogo from '@/assets/logo-mono-inverted.svg';
import { doesRouteBelongsTo } from '@/router/helpers';
import { ROUTE_NAMES } from '@/router/names';
import { useAuthStore } from '@/store/auth';
import MembersThumbnail from '@/views/Private/Members/MembersThumbnail.vue';
import {
  mdiAccountGroup,
  mdiCalendarMultiselect,
  mdiCogOutline,
  mdiFinance,
  mdiHistory,
  mdiViewGridPlusOutline,
} from '@mdi/js';
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
  {
    label: i18n.t('navigation.history'),
    to: {
      name: ROUTE_NAMES.HISTORY,
    },
    icon: mdiHistory,
    active: doesRouteBelongsTo(route, ROUTE_NAMES.HISTORY),
  },
  {
    label: i18n.t('navigation.attendance'),
    to: {
      name: ROUTE_NAMES.ATTENDANCE,
    },
    icon: mdiCalendarMultiselect,
    active: doesRouteBelongsTo(route, ROUTE_NAMES.ATTENDANCE),
  },
  {
    label: i18n.t('navigation.settings'),
    to: {
      name: ROUTE_NAMES.SETTINGS,
    },
    icon: mdiCogOutline,
    active: doesRouteBelongsTo(route, ROUTE_NAMES.SETTINGS),
  },
]);
</script>
