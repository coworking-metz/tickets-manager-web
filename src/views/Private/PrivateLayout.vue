<template>
  <div
    :class="{
      ['flex min-h-full grow flex-row items-start max-sm:overflow-x-hidden']: true,
      ['max-sm:overflow-y-hidden']: state.isMenuOpen,
    }">
    <header
      class="fixed top-0 z-30 flex h-16 w-full shrink-0 justify-between border-b border-gray-200 bg-white bg-opacity-[75%] shadow-sm backdrop-blur sm:hidden">
      <button
        class="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
        type="button"
        @click="state.isMenuOpen = !state.isMenuOpen">
        <span class="sr-only">
          {{ !state.isMenuOpen ? $t('navigation.open') : $t('navigation.close') }}
        </span>
        <SvgIcon
          aria-hidden="true"
          :class="{
            ['h-6 w-6 transition-transform duration-300']: true,
            ['!rotate-[540deg]']: !state.isMenuOpen,
          }"
          :path="state.isMenuOpen ? mdiMenuOpen : mdiMenu"
          type="mdi" />
      </button>
      <img alt="Le Poulailler - Coworking Metz" class="h-full w-auto p-3" :src="typoLePoulailler" />
    </header>
    <NavigationDrawer
      :class="{
        ['top-0 z-10 h-screen shrink-0 overflow-x-hidden max-sm:fixed max-sm:max-w-0 max-sm:pt-16 max-sm:transition-[max-width] sm:sticky']: true,
        ['max-sm:max-w-[7rem]']: state.isMenuOpen,
      }" />

    <div
      :class="{
        ['h-screen w-full max-w-0 shrink-0 grow-0 transition-[max-width] sm:hidden']: true,
        ['max-w-[7rem]']: state.isMenuOpen,
      }" />
    <main class="flex w-0 shrink grow basis-0 flex-col self-stretch max-sm:min-w-full max-sm:pt-16">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import typoLePoulailler from '@/assets/typo-lepoulailler.png';
import NavigationDrawer from '@/components/layout/NavigationDrawer.vue';
import { mdiMenu, mdiMenuOpen } from '@mdi/js';
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
