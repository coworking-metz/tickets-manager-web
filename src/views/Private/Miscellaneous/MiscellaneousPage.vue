<template>
  <article
    class="mx-auto flex w-full max-w-6xl grow flex-col items-stretch gap-6 overflow-hidden sm:px-6 lg:flex-row lg:px-8">
    <Head>
      <title>{{ $t('miscellaneous.head.title') }}</title>
    </Head>

    <div class="flex max-w-3xl shrink-0 grow flex-col gap-6 pb-6 pt-12 sm:pt-40">
      <header class="flex flex-col items-start max-sm:px-3">
        <h1
          class="text-2xl font-bold leading-7 text-gray-900 sm:mx-0 sm:truncate sm:text-3xl sm:tracking-tight dark:text-gray-100">
          {{ $t('miscellaneous.title') }}
        </h1>
        <p class="mt-1 truncate text-base text-slate-500 dark:text-slate-400">
          {{ $t('miscellaneous.description') }}
        </p>
      </header>

      <AppPanel>
        <h3
          class="flex flex-row items-center gap-2 text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
          <SvgIcon aria-hidden="true" class="size-5" :path="mdiBookOpenVariantOutline" type="mdi" />
          {{ $t('miscellaneous.guide.title') }}
        </h3>
        <p class="mt-2 max-w-prose whitespace-pre-line text-sm text-gray-500 dark:text-gray-400">
          {{ $t('miscellaneous.guide.description') }}
        </p>
        <div class="mt-5 flex flex-row flex-wrap items-center gap-3">
          <AppButtonTonal
            class="dark:focus:ring-offset-neutral-800"
            color="indigo"
            href="https://docs.google.com/document/d/1R4OQZbcFHjU2ORNHwoiRjtMUAj16mCX9"
            :icon="mdiOpenInNew"
            referrerpolicy="no-referrer"
            target="_blank">
            {{ $t('miscellaneous.guide.navigate') }}
          </AppButtonTonal>
        </div>
      </AppPanel>

      <AppPanel>
        <h3
          class="flex flex-row items-center gap-2 text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
          <SvgIcon aria-hidden="true" class="size-5" :path="mdiTelevisionGuide" type="mdi" />
          {{ $t('miscellaneous.digitalSignage.title') }}
        </h3>
        <p class="mt-2 max-w-prose whitespace-pre-line text-sm text-gray-500 dark:text-gray-400">
          {{ $t('miscellaneous.digitalSignage.description') }}
        </p>
        <div class="mt-5 flex flex-row flex-wrap items-center gap-3">
          <AppButtonTonal
            class="dark:focus:ring-offset-neutral-800"
            color="indigo"
            href="https://ecrans.coworking-metz.fr"
            :icon="mdiOpenInNew"
            target="_blank">
            {{ $t('miscellaneous.digitalSignage.navigate') }}
          </AppButtonTonal>
        </div>
      </AppPanel>

      <AppPanel>
        <h3
          class="flex flex-row items-center gap-2 text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
          <SvgIcon aria-hidden="true" class="size-5" :path="mdiCalendarMultiple" type="mdi" />
          {{ $t('miscellaneous.events.title') }}
        </h3>
        <p class="mt-2 max-w-prose whitespace-pre-line text-sm text-gray-500 dark:text-gray-400">
          {{ $t('miscellaneous.events.description') }}
        </p>
        <h4
          class="mt-5 max-w-prose text-base font-medium leading-6 text-gray-900 dark:text-gray-100">
          {{ $t('miscellaneous.events.features.label') }}
        </h4>
        <ul class="mt-2 max-w-prose pl-6">
          <li
            v-for="feature in $tm('miscellaneous.events.features.list')"
            :key="feature"
            class="list-disc text-sm text-gray-500 dark:text-gray-400">
            {{ feature }}
          </li>
        </ul>
        <div class="mt-5 flex flex-row flex-wrap items-center gap-3">
          <AppButtonTonal
            class="dark:focus:ring-offset-neutral-800"
            color="indigo"
            href="https://calendar.google.com/calendar/u/1/r?authuser=coworkingmetz@gmail.com"
            :icon="mdiOpenInNew"
            target="_blank">
            {{ $t('miscellaneous.events.navigate') }}
          </AppButtonTonal>
          <AppButtonText
            class="dark:focus:ring-offset-neutral-800"
            color="indigo"
            href="https://markdownlivepreview.com/"
            :icon="mdiOpenInNew"
            referrerpolicy="no-referrer"
            target="_blank">
            {{ $t('miscellaneous.events.writeMarkdown') }}
          </AppButtonText>
        </div>
      </AppPanel>
    </div>
  </article>
</template>

<script lang="ts" setup>
import AppButtonText from '@/components/form/AppButtonText.vue';
import AppButtonTonal from '@/components/form/AppButtonTonal.vue';
import AppPanel from '@/components/layout/AppPanel.vue';
import {
  mdiBookOpenVariantOutline,
  mdiCalendarMultiple,
  mdiOpenInNew,
  mdiTelevisionGuide,
} from '@mdi/js';
import { Head } from '@unhead/vue/components';
</script>
