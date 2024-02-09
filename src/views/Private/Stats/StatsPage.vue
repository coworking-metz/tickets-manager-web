<template>
  <main class="flex flex-1 overflow-hidden">
    <Head>
      <title>{{ $t('stats.head.title') }}</title>
    </Head>
    <div class="flex flex-1 flex-col overflow-y-auto xl:overflow-hidden">
      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" class="border-b border-gray-200 bg-white xl:hidden">
        <div class="mx-auto flex max-w-3xl items-start px-4 py-3 sm:px-6 lg:px-8">
          <a
            class="-ml-1 inline-flex items-center space-x-3 text-sm font-medium text-gray-900"
            href="#">
            <!-- <ChevronLeftIcon aria-hidden="true" class="h-5 w-5 text-gray-400" /> -->
            <span>{{ $t('stats.title') }}</span>
          </a>
        </div>
      </nav>

      <div class="flex flex-1 xl:overflow-hidden">
        <!-- Secondary sidebar -->
        <nav
          aria-label="Sections"
          class="hidden w-96 shrink-0 border-r border-gray-200 bg-white xl:flex xl:flex-col">
          <div class="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
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
                'flex border-b border-gray-200 p-6',
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
import { mdiCashMultiple } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const route = useRoute();
const i18n = useI18n();
const tabs = computed(() => [
  {
    label: i18n.t('stats.incomes.title'),
    description: i18n.t('stats.incomes.description'),
    to: {
      name: ROUTE_NAMES.STATS.INCOMES.INDEX,
    },
    icon: mdiCashMultiple,
    active: doesRouteBelongsTo(route, ROUTE_NAMES.STATS.INCOMES),
  },
]);
</script>
