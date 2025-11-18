<template>
  <main class="flex grow flex-col">
    <Menu
      as="nav"
      class="relative z-20 mb-6 mt-3 inline-block text-left max-sm:mx-3 sm:mt-6 xl:hidden">
      <MenuButton
        class="group w-full rounded-xl border border-gray-200 bg-white px-4 py-5 text-gray-700 hover:bg-gray-200 sm:px-6 dark:border-stone-700 dark:bg-neutral-800 dark:hover:bg-neutral-700/50 dark:active:bg-neutral-800">
        <span class="flex w-full flex-row items-start justify-between">
          <SvgIcon
            aria-hidden="true"
            class="size-6 shrink-0 text-indigo-400"
            :path="activeTab?.icon"
            type="mdi" />
          <div class="mx-3 text-left text-sm">
            <p class="text-base font-medium text-gray-900 dark:text-gray-100">
              {{ activeTab?.label }}
            </p>
            <p class="mt-1 text-gray-500 dark:text-gray-400">{{ activeTab?.description }}</p>
          </div>

          <SvgIcon
            aria-hidden="true"
            class="ml-auto size-6 shrink-0 self-center text-gray-400 group-hover:text-gray-500 dark:text-gray-400"
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
          class="absolute inset-x-0 z-10 mt-1 origin-top divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-[5%] focus:outline-none dark:divide-stone-700 dark:bg-neutral-800">
          <div class="py-1">
            <MenuItem
              v-for="tab in tabs.filter(({ active }) => !active)"
              :key="tab.label"
              v-slot="{ close }">
              <router-link
                :aria-current="tab.active ? 'page' : undefined"
                :class="[
                  tab.active ? 'bg-gray-100 text-gray-900 dark:text-gray-100' : 'text-gray-700',
                  'flex px-3 py-2 sm:px-6',
                ]"
                :to="tab.to"
                @click.capture="close">
                <SvgIcon
                  aria-hidden="true"
                  class="size-6 shrink-0 text-indigo-400"
                  :path="tab.icon"
                  type="mdi" />
                <div class="ml-3 overflow-hidden text-left text-sm">
                  <p class="font-medium text-gray-900 dark:text-gray-100">{{ tab.label }}</p>
                  <p class="mt-1 truncate text-gray-500 dark:text-gray-400">
                    {{ tab.description }}
                  </p>
                </div>
              </router-link>
            </MenuItem>
          </div>
        </MenuItems>
      </transition>
    </Menu>

    <div class="flex shrink grow basis-0 flex-row">
      <aside class="flex h-screen max-h-[1440px] w-96 shrink-0 flex-col py-3 pr-6 max-xl:hidden">
        <nav
          aria-label="Sections"
          class="my-auto h-full max-h-[840px] rounded-xl border bg-white xl:flex xl:flex-col dark:border-stone-700 dark:bg-neutral-800">
          <div
            class="flex h-24 shrink-0 items-center border-b border-gray-200 px-3 sm:px-6 dark:border-stone-700">
            <h1
              class="text-2xl font-bold leading-7 text-gray-900 sm:mx-0 sm:truncate sm:text-3xl sm:tracking-tight dark:text-gray-100">
              {{ $t('stats.title') }}
            </h1>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto">
            <router-link
              v-for="tab in tabs"
              :key="tab.label"
              :aria-current="tab.active ? 'page' : undefined"
              :class="[
                tab.active && 'bg-indigo-50/50 dark:bg-neutral-900/50',
                'group flex border-b border-gray-200 p-6 pr-3 hover:bg-indigo-50/50 active:bg-indigo-50/70 dark:border-stone-700 dark:hover:bg-neutral-900/50 dark:active:bg-neutral-900/70',
              ]"
              :to="tab.to">
              <SvgIcon
                aria-hidden="true"
                class="-mt-0.5 size-6 shrink-0 text-indigo-400"
                :path="tab.icon"
                type="mdi" />
              <div class="ml-3 text-sm">
                <p class="font-medium text-gray-900 dark:text-gray-100">{{ tab.label }}</p>
                <p class="mt-1 text-gray-500 dark:text-gray-400">{{ tab.description }}</p>
              </div>
              <SvgIcon
                aria-hidden="true"
                :class="[
                  'size-6 shrink-0 self-center text-gray-500 group-hover:text-gray-600 group-hover:!opacity-100 dark:text-gray-400',
                  tab.active ? 'opacity-80' : 'opacity-0',
                ]"
                :path="mdiChevronRight"
                type="mdi" />
            </router-link>
          </div>
        </nav>
      </aside>

      <!-- Main content -->
      <div class="flex shrink grow basis-0 flex-col max-sm:overflow-hidden">
        <RouterView />
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
  mdiChevronRight,
  mdiCurrencyEur,
  mdiHandCoinOutline,
  mdiUnfoldMoreHorizontal,
} from '@mdi/js';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const route = useRoute();
const i18n = useI18n();

const tabs = computed(() => [
  {
    label: i18n.t('stats.usage.title'),
    description: i18n.t('stats.usage.description'),
    to: {
      name: ROUTE_NAMES.STATS.USAGE,
      query: route.query,
    },
    icon: mdiHandCoinOutline,
    active: doesRouteBelongsTo(route, ROUTE_NAMES.STATS.USAGE),
  },
  {
    label: i18n.t('stats.incomes.title'),
    description: i18n.t('stats.incomes.description'),
    to: {
      name: ROUTE_NAMES.STATS.INCOME,
      query: route.query,
    },
    icon: mdiCurrencyEur,
    active: doesRouteBelongsTo(route, ROUTE_NAMES.STATS.INCOME),
  },
  {
    label: i18n.t('stats.activity.title'),
    description: i18n.t('stats.activity.description'),
    to: {
      name: ROUTE_NAMES.STATS.ACTIVITY,
      query: route.query,
    },
    icon: mdiAccountClockOutline,
    active: doesRouteBelongsTo(route, ROUTE_NAMES.STATS.ACTIVITY),
  },
]);

const activeTab = computed(() => tabs.value.find((tab) => tab.active));
</script>
