<template>
  <main class="flex flex-1 overflow-hidden">
    <div class="flex flex-1 flex-col overflow-y-auto xl:overflow-hidden">
      <!-- Mobile navigation -->
      <Menu as="nav" class="relative inline-block text-left xl:hidden">
        <MenuButton
          class="group w-full border-b border-gray-200 bg-white px-3 py-4 text-gray-700 hover:bg-gray-200 sm:px-6">
          <span class="flex w-full flex-row items-start justify-between">
            <SvgIcon
              aria-hidden="true"
              class="h-6 w-6 shrink-0 text-indigo-400"
              :path="activeTab?.icon"
              type="mdi" />
            <div class="mx-3 text-left text-sm">
              <p class="text-base font-medium text-gray-900">{{ activeTab?.label }}</p>
              <p class="mt-1 text-gray-500">{{ activeTab?.description }}</p>
            </div>

            <SvgIcon
              aria-hidden="true"
              class="ml-auto h-6 w-6 shrink-0 self-center text-gray-400 group-hover:text-gray-500"
              :path="mdiUnfoldMoreHorizontal"
              type="mdi" />
          </span>
        </MenuButton>
        <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95">
          <MenuItems
            class="absolute inset-x-0 z-10 mt-1 origin-top divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-[5%] focus:outline-none">
            <div class="py-1">
              <MenuItem
                v-for="tab in tabs.filter(({ active }) => !active)"
                :key="tab.label"
                v-slot="{ close }">
                <router-link
                  :aria-current="tab.active ? 'page' : undefined"
                  :class="[
                    tab.active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'flex px-3 py-2 sm:px-6',
                  ]"
                  :to="tab.to"
                  @click.capture="close">
                  <SvgIcon
                    aria-hidden="true"
                    class="h-6 w-6 shrink-0 text-indigo-400"
                    :path="tab.icon"
                    type="mdi" />
                  <div class="ml-3 overflow-hidden text-left text-sm">
                    <p class="font-medium text-gray-900">{{ tab.label }}</p>
                    <p class="mt-1 truncate text-gray-500">
                      {{ tab.description }}
                    </p>
                  </div>
                </router-link>
              </MenuItem>
            </div>
          </MenuItems>
        </transition>
      </Menu>

      <!-- Sidebar -->
      <div class="flex flex-1 xl:overflow-hidden">
        <nav
          aria-label="Sections"
          class="hidden w-96 shrink-0 border-r border-gray-200 bg-white xl:flex xl:flex-col">
          <div class="flex h-16 shrink-0 items-center border-b border-gray-200 px-3 sm:px-6">
            <p class="text-lg font-medium text-gray-900">{{ $t('stats.title') }}</p>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto">
            <router-link
              v-for="tab in tabs"
              :key="tab.label"
              :aria-current="tab.active ? 'page' : undefined"
              :class="[
                tab.active
                  ? 'bg-indigo-50 bg-opacity-[50%]'
                  : 'hover:bg-indigo-50 hover:bg-opacity-[50%]',
                'group flex border-b border-gray-200 p-6 pr-3',
              ]"
              :to="tab.to">
              <SvgIcon
                aria-hidden="true"
                class="-mt-0.5 h-6 w-6 shrink-0 text-indigo-400"
                :path="tab.icon"
                type="mdi" />
              <div class="ml-3 text-sm">
                <p class="font-medium text-gray-900">{{ tab.label }}</p>
                <p class="mt-1 text-gray-500">{{ tab.description }}</p>
              </div>
              <SvgIcon
                aria-hidden="true"
                :class="[
                  'h-6 w-6 shrink-0 self-center text-gray-500 group-hover:text-gray-600 group-hover:!opacity-100',
                  tab.active ? 'opacity-80' : 'opacity-0',
                ]"
                :path="mdiChevronRight"
                type="mdi" />
            </router-link>
          </div>
        </nav>

        <!-- Main content -->
        <div class="flex flex-1 flex-col xl:overflow-y-auto">
          <RouterView />
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { doesRouteBelongsTo } from '@/router/helpers';
import { ROUTE_NAMES } from '@/router/names';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {
  mdiAccountClockOutline,
  mdiCashMultiple,
  mdiChevronRight,
  mdiUnfoldMoreHorizontal,
} from '@mdi/js';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouteRecordName, useRoute } from 'vue-router';

const route = useRoute();
const i18n = useI18n();

const getIncomesRouteFromActivity = (activityRouteName?: RouteRecordName | null) => {
  switch (activityRouteName) {
    case ROUTE_NAMES.STATS.ACTIVITY.DAILY:
      return ROUTE_NAMES.STATS.INCOMES.DAILY;
    case ROUTE_NAMES.STATS.ACTIVITY.WEEKLY:
      return ROUTE_NAMES.STATS.INCOMES.WEEKLY;
    case ROUTE_NAMES.STATS.ACTIVITY.MONTHLY:
      return ROUTE_NAMES.STATS.INCOMES.MONTHLY;
    case ROUTE_NAMES.STATS.ACTIVITY.YEARLY:
      return ROUTE_NAMES.STATS.INCOMES.YEARLY;
    default:
      return ROUTE_NAMES.STATS.INCOMES.INDEX;
  }
};

const getActivityRouteFromIncomes = (incomesRouteName?: RouteRecordName | null) => {
  switch (incomesRouteName) {
    case ROUTE_NAMES.STATS.INCOMES.DAILY:
      return ROUTE_NAMES.STATS.ACTIVITY.DAILY;
    case ROUTE_NAMES.STATS.INCOMES.WEEKLY:
      return ROUTE_NAMES.STATS.ACTIVITY.WEEKLY;
    case ROUTE_NAMES.STATS.INCOMES.MONTHLY:
      return ROUTE_NAMES.STATS.ACTIVITY.MONTHLY;
    case ROUTE_NAMES.STATS.INCOMES.YEARLY:
      return ROUTE_NAMES.STATS.ACTIVITY.YEARLY;
    default:
      return ROUTE_NAMES.STATS.ACTIVITY.INDEX;
  }
};

const tabs = computed(() => [
  {
    label: i18n.t('stats.incomes.title'),
    description: i18n.t('stats.incomes.description'),
    to: {
      name: getIncomesRouteFromActivity(route.name),
      query: route.query,
    },
    icon: mdiCashMultiple,
    active: doesRouteBelongsTo(route, ROUTE_NAMES.STATS.INCOMES),
  },
  {
    label: i18n.t('stats.activity.title'),
    description: i18n.t('stats.activity.description'),
    to: {
      name: getActivityRouteFromIncomes(route.name),
      query: route.query,
    },
    icon: mdiAccountClockOutline,
    active: doesRouteBelongsTo(route, ROUTE_NAMES.STATS.ACTIVITY),
  },
]);

const activeTab = computed(() => tabs.value.find((tab) => tab.active));
</script>
