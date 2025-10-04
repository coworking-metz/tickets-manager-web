<template>
  <div
    :class="{
      ['relative mx-auto flex min-h-full w-full grow flex-row items-start']: true,
      ['max-sm:overflow-y-hidden']: state.isMenuOpen,
    }">
    <header
      class="fixed top-0 z-30 flex h-16 w-full shrink-0 justify-between border-b border-gray-200 bg-white/75 shadow-sm backdrop-blur sm:hidden dark:border-stone-700 dark:bg-neutral-800/75">
      <button
        class="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden dark:text-gray-400"
        type="button"
        @click="state.isMenuOpen = !state.isMenuOpen">
        <span class="sr-only">
          {{ !state.isMenuOpen ? $t('navigation.open') : $t('navigation.close') }}
        </span>
        <SvgIcon
          aria-hidden="true"
          :class="{
            ['size-6 transition-transform duration-300']: true,
            ['!rotate-[540deg]']: !state.isMenuOpen,
          }"
          :path="state.isMenuOpen ? mdiMenuOpen : mdiMenu"
          type="mdi" />
      </button>
      <img
        alt="Le Poulailler - Coworking Metz"
        class="h-full w-auto p-3 dark:invert"
        :src="typoLePoulailler" />
    </header>

    <aside
      :class="[
        `fixed inset-y-0 z-[1] flex
        shrink-0 flex-col max-sm:h-full max-sm:max-w-0 max-sm:overflow-x-hidden max-sm:transition-[max-width]
        sm:h-screen sm:max-h-[1440px] sm:py-3 sm:pl-3`,
        state.isMenuOpen && 'max-sm:max-w-28',
      ]">
      <NavigationDrawer
        class="w-28 grow overflow-y-auto overflow-x-hidden max-sm:pt-16 sm:my-auto sm:max-h-[840px] sm:rounded-3xl sm:shadow-xl sm:[corner-shape:squircle]" />
    </aside>

    <div
      :class="{
        ['h-full w-screen max-w-0 shrink-0 grow-0 transition-[max-width] sm:hidden']: true,
        ['max-w-28']: state.isMenuOpen,
      }" />
    <main
      :class="[
        'flex w-0 shrink grow basis-0 flex-col self-stretch max-sm:min-w-full max-sm:pt-16',
        state.isMenuOpen && 'z-[2] shadow-2xl',
      ]">
      <RouterView class="sm:pl-36 sm:pr-4" />
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
