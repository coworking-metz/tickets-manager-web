<template>
  <div class="relative flex grow flex-col bg-white">
    <div class="mx-auto flex w-full max-w-7xl grow flex-col">
      <div class="relative z-10 flex grow flex-col lg:w-full lg:max-w-2xl">
        <svg
          aria-hidden="true"
          class="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 fill-white lg:block"
          preserveAspectRatio="none"
          viewBox="0 0 100 100">
          <polygon points="0,0 90,0 50,100 0,100" />
        </svg>

        <div class="relative px-6 pt-6 lg:pl-8 lg:pr-0">
          <nav
            aria-label="Global"
            class="flex items-center justify-between sm:h-10 lg:justify-start">
            <a class="-m-1.5 p-1.5" href="#">
              <span class="sr-only">Your Company</span>

              <!-- TOGO: add logo -->
              <img
                alt="Your Company"
                class="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" />
            </a>
          </nav>
        </div>

        <div class="relative flex max-h-[960px] min-h-[480px] grow flex-col px-6 lg:px-8 lg:pr-0">
          <div class="m-auto max-w-2xl lg:mx-0 lg:max-w-xl">
            <div class="hidden sm:mb-10 sm:flex">
              <div
                class="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                {{ $t('login.headline.text') }}
                <a
                  class="whitespace-nowrap font-semibold text-indigo-600"
                  href="https://www.coworking-metz.fr/">
                  <span aria-hidden="true" class="absolute inset-0" />
                  {{ $t('login.headline.readMore') }}
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
            <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {{ $t('login.title') }}
            </h1>
            <p class="mt-6 whitespace-pre-line text-lg leading-8 text-gray-600">
              {{ $t('login.description') }}
            </p>
            <div class="mt-10 flex items-center gap-x-6">
              <a
                class="flex flex-row items-center gap-2 rounded-md bg-indigo-600 px-3.5 py-1.5 text-base font-semibold leading-7 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                :href="HTTP.getUri({ url: '/auth/login', params: $route.query })"
                @click="state.isLoggingIn = true">
                <LoadingSpinner v-if="state.isLoggingIn" class="h-5 w-5" />
                {{ $t('action.login') }}
              </a>
              <a
                class="text-base font-semibold leading-7 text-gray-900"
                href="https://www.coworking-metz.fr/">
                {{ $t('login.headline.readMore') }}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="relative min-h-[420px] overflow-hidden bg-gray-50 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
      <img
        :alt="$t('login.picture.background.alt')"
        class="aspect-[3/2] object-cover grayscale-[100%] lg:aspect-auto lg:h-full lg:w-full"
        :src="state.selectedPhoto" />
      <i
        class="pointer-events-none absolute inset-0 mix-blend-screen"
        style="background-color: rgb(243, 175, 16, 0.6)" />
      <img
        :alt="$t('login.picture.logo.alt')"
        class="absolute inset-0 m-auto h-full max-h-[320px] w-full max-w-[320px] object-contain"
        :src="verticalLogo" />
    </div>
  </div>
</template>

<script setup lang="ts">
import verticalLogo from '@/assets/logo-lepoulailler-vertical.png';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import HTTP from '@/services/http';
import { reactive } from 'vue';

const PHOTOS = [
  'https://www.coworking-metz.fr/wp-content/uploads/2020/05/20200524_120319.jpg',
  'https://www.coworking-metz.fr/wp-content/uploads/2023/05/signal-2022-06-23-213951_002-scaled-e1683722217483.jpeg',
];

const state = reactive({
  isLoggingIn: false,
  selectedPhoto: PHOTOS[Math.floor(Math.random() * PHOTOS.length)],
});
</script>
