<template>
  <article
    class="mx-auto flex w-full max-w-6xl grow flex-col items-stretch gap-6 overflow-hidden sm:px-6 lg:flex-row lg:px-8">
    <Head>
      <title>{{ $t('miscellaneous.head.title') }}</title>
    </Head>

    <div class="flex max-w-3xl shrink-0 grow flex-col gap-6 pb-6 pt-12 sm:pt-40">
      <header class="flex flex-col items-start max-sm:px-3">
        <h1
          class="text-2xl font-bold leading-7 text-gray-900 sm:mx-0 sm:truncate sm:text-3xl sm:tracking-tight">
          {{ $t('miscellaneous.title') }}
        </h1>
        <p class="mt-1 truncate text-base text-slate-500">{{ $t('miscellaneous.description') }}</p>
      </header>

      <section class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <h3 class="flex flex-row items-center gap-2 text-lg font-medium leading-6 text-gray-900">
          <SvgIcon aria-hidden="true" class="size-5" :path="mdiBookOpenVariantOutline" type="mdi" />
          {{ $t('miscellaneous.guide.title') }}
        </h3>
        <p class="mt-2 max-w-prose whitespace-pre-line text-sm text-gray-500">
          {{ $t('miscellaneous.guide.description') }}
        </p>
        <div class="mt-5 flex flex-row flex-wrap items-center gap-3">
          <a
            class="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-indigo-100 px-4 py-2 font-medium text-indigo-700 transition-colors hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
            href="https://docs.google.com/document/d/1R4OQZbcFHjU2ORNHwoiRjtMUAj16mCX9"
            referrerpolicy="no-referrer"
            target="_blank">
            <SvgIcon aria-hidden="true" class="size-5" :path="mdiOpenInNew" type="mdi" />
            <span>{{ $t('miscellaneous.guide.navigate') }}</span>
          </a>
        </div>
      </section>

      <section class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <h3 class="flex flex-row items-center gap-2 text-lg font-medium leading-6 text-gray-900">
          <SvgIcon aria-hidden="true" class="size-5" :path="mdiTelevisionGuide" type="mdi" />
          {{ $t('miscellaneous.digitalSignage.title') }}
        </h3>
        <p class="mt-2 max-w-prose whitespace-pre-line text-sm text-gray-500">
          {{ $t('miscellaneous.digitalSignage.description') }}
        </p>
        <div class="mt-5 flex flex-row flex-wrap items-center gap-3">
          <a
            class="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-indigo-100 px-4 py-2 font-medium text-indigo-700 transition-colors hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
            href="https://ecrans.coworking-metz.fr"
            target="_blank">
            <SvgIcon aria-hidden="true" class="size-5" :path="mdiOpenInNew" type="mdi" />
            <span>{{ $t('miscellaneous.digitalSignage.navigate') }}</span>
          </a>
        </div>
      </section>

      <section class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <h3 class="flex flex-row items-center gap-2 text-lg font-medium leading-6 text-gray-900">
          <SvgIcon aria-hidden="true" class="size-5" :path="mdiCalendarMultiple" type="mdi" />
          {{ $t('miscellaneous.events.title') }}
        </h3>
        <p class="mt-2 max-w-prose whitespace-pre-line text-sm text-gray-500">
          {{ $t('miscellaneous.events.description') }}
        </p>
        <h4 class="mt-5 max-w-prose text-base font-medium leading-6 text-gray-900">
          {{ $t('miscellaneous.events.features.label') }}
        </h4>
        <ul class="mt-2 max-w-prose pl-6">
          <li
            v-for="feature in $tm('miscellaneous.events.features.list')"
            :key="feature"
            class="list-disc text-sm text-gray-500">
            {{ feature }}
          </li>
        </ul>
        <div class="mt-5 flex flex-row flex-wrap items-center gap-3">
          <a
            class="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-indigo-100 px-4 py-2 font-medium text-indigo-700 transition-colors hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
            href="https://calendar.google.com/calendar/u/1/r?authuser=coworkingmetz@gmail.com"
            target="_blank">
            <SvgIcon aria-hidden="true" class="size-5" :path="mdiOpenInNew" type="mdi" />
            <span>{{ $t('miscellaneous.events.navigate') }}</span>
          </a>
          <a
            class="group flex flex-row items-center gap-2 rounded-md border border-transparent px-4 py-2 font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
            href="https://markdownlivepreview.com/"
            referrerpolicy="no-referrer"
            target="_blank">
            <SvgIcon
              aria-hidden="true"
              class="size-5 text-indigo-500 group-hover:text-indigo-700"
              :path="mdiOpenInNew"
              type="mdi" />
            <span>{{ $t('miscellaneous.events.writeMarkdown') }}</span>
          </a>
        </div>
      </section>
    </div>
  </article>
</template>

<script lang="ts" setup>
import {
  mdiBookOpenVariantOutline,
  mdiCalendarMultiple,
  mdiOpenInNew,
  mdiTelevisionGuide,
} from '@mdi/js';
import { Head } from '@unhead/vue/components';
</script>
