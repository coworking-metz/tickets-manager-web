<template>
  <article class="mx-auto flex max-h-[840px] w-full max-w-3xl grow flex-col px-6 py-12 lg:px-8">
    <Head>
      <title>{{ $t('stats.head.title') }}</title>
    </Head>
    <section class="my-auto flex w-full flex-col items-start sm:flex-row">
      <div class="mb-6">
        <dotlottie-player autoplay="true" class="h-[92px]" loop :src="RollingTumbleweed" />
      </div>
      <div class="flex w-full flex-col sm:ml-6">
        <div class="sm:border-l sm:border-gray-200 sm:pl-6">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {{ $t('stats.title') }}
          </h1>
          <p class="mt-1 text-base text-gray-500">
            {{ $t('stats.description') }}
          </p>
        </div>
        <div class="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
          <RouterLink
            class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
            to="/">
            {{ $t('action.backToHome') }}
          </RouterLink>
          <a
            class="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
            href="mailto:contact@coworking-metz.fr">
            {{ $t('action.contact') }}
          </a>
        </div>
      </div>
    </section>
  </article>
</template>

<script lang="ts" setup>
import RollingTumbleweed from '@/assets/animations/tumbleweed-rolling.lottie';
import { Head } from '@unhead/vue/components';
</script>
