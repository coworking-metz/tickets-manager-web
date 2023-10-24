<template>
  <div>
    <h1>{{ $t('login.title') }}</h1>
    <a :href="HTTP.getUri({ url: '/auth/login', params: $route.query })">
      {{ $t('action.login') }}
    </a>
  </div>
</template>

<script setup lang="ts">
import HTTP from '@/services/http';
</script>
