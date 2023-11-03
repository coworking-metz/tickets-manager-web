<template>
  <div class="">
    <h1 class="text-3xl font-bold underline">{{ $t('login.title') }}</h1>
    <a :href="HTTP.getUri({ url: '/auth/login', params: $route.query })">
      {{ $t('action.login') }}
    </a>
  </div>
</template>

<script setup lang="ts">
import HTTP from '@/services/http';
import { reactive } from 'vue';

const state = reactive({
  isLoggingIn: false,
});
</script>
