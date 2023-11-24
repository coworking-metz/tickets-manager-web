<template>
  <article class="mx-auto flex max-h-[840px] grow flex-col px-6 py-12 lg:px-8">
    <section class="my-auto flex flex-col items-start sm:flex-row">
      <div class="mb-6">
        <dotlottie-player autoplay="true" class="h-[92px]" loop :src="RollingTumbleweed" />
      </div>
      <div class="flex flex-col sm:ml-6">
        <div class="sm:border-l sm:border-gray-200 sm:pl-6">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {{ $t('user.profile.title') }}
          </h1>
          <p class="mt-1 text-base text-gray-500">
            {{ $t('user.profile.description') }}
          </p>
        </div>
        <div class="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
          <button
            class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            type="button"
            @click="onLogout">
            {{ $t('action.logout') }}
          </button>
        </div>
      </div>
    </section>
  </article>
</template>

<script lang="ts" setup>
import RollingTumbleweed from '@/assets/animations/tumbleweed-rolling.lottie';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const onLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
