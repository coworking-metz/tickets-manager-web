<template>
  <div>
    <h1>{{ $t('login.title') }}</h1>
    <PButton
      :href="HTTP.getUri({ url: '/auth/login', params: $route.query })"
      :label="$t('action.login')" />
  </div>
</template>

<script setup lang="ts">
import HTTP from '@/services/http';
</script>
