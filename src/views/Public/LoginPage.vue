<template>
  <div>
    <h1>{{ $t('login.title') }}</h1>
    <a :href="HTTP.getUri({ url: '/auth/web/login', params: $route.query })">
      {{ $t('action.login') }}
    </a>
  </div>
</template>

<script setup>
import HTTP from '@/services/http.js';
</script>
