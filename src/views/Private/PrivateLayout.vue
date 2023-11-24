<template>
  <div class="flex min-h-full grow flex-row items-start max-sm:overflow-x-hidden">
    <header
      class="fixed top-0 z-10 flex h-16 w-full shrink-0 justify-between border-b border-gray-200 bg-white bg-opacity-75 shadow-sm backdrop-blur sm:hidden">
      <button
        class="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
        type="button"
        @click="state.isMenuOpen = !state.isMenuOpen">
        <span class="sr-only">
          {{ !state.isMenuOpen ? $t('navigation.open') : $t('navigation.close') }}
        </span>
        <SvgIcon aria-hidden="true" class="h-6 w-6" :path="mdiMenu" type="mdi" />
      </button>
      <img alt="Your Company" class="h-full w-auto py-2" :src="horizontalLogo" />
    </header>
    <NavigationDrawer
      :class="{
        ['sticky top-0 h-screen shrink-0 max-sm:max-w-0 max-sm:pt-16  max-sm:transition-[max-width]']: true,
        ['max-sm:max-w-[28rem]']: state.isMenuOpen,
      }" />
    <main
      :class="{
        ['flex w-full flex-col self-stretch max-sm:pt-16']: true,
        ['max-sm:min-w-[100vw]']: state.isMenuOpen,
      }">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import horizontalLogo from '@/assets/logo-lepoulailler-horizontal.png';
import NavigationDrawer from '@/components/layout/NavigationDrawer.vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiMenu } from '@mdi/js';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const state = reactive({
  isMenuOpen: false,
});

router.afterEach(() => {
  state.isMenuOpen = false;
});
</script>
