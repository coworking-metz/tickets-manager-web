<template>
  <nav class="flex flex-col items-center overflow-y-auto bg-amber-500 dark:bg-amber-900">
    <div class="mt-6 flex shrink-0 items-center max-sm:hidden">
      <LogoMono
        alt="Coworking Metz"
        background-color="#FFFFFF"
        class="h-16 w-auto text-amber-500 dark:text-amber-900" />
    </div>
    <ol class="mb-2 mt-6 flex w-full grow flex-col gap-1 px-2">
      <NavigationDrawerLink
        v-for="item in sidebarNavigation"
        :key="item.label"
        :active="item.active"
        :icon="item.icon"
        :label="item.label"
        :to="item.to" />

      <NavigationDrawerLink
        :active="doesRouteBelongsTo(route, ROUTE_NAMES.MISCELLANEOUS)"
        class="mt-auto"
        :icon="mdiViewGridPlusOutline"
        :label="$t('navigation.miscellaneous')"
        :to="{ name: ROUTE_NAMES.MISCELLANEOUS }" />

      <NavigationDrawerLink
        :active="doesRouteBelongsTo(route, ROUTE_NAMES.USER)"
        class="px-0.5"
        :to="{ name: ROUTE_NAMES.USER.PROFILE }">
        <MembersThumbnail
          :email="authStore.user?.email"
          :name="authStore.user?.name"
          :thumbnail="authStore.user?.picture" />
        <span class="mt-2 text-center">{{ authStore.user?.name }}</span>
      </NavigationDrawerLink>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import NavigationDrawerLink from './NavigationDrawerLink.vue';
import LogoMono from '../LogoMono.vue';
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
