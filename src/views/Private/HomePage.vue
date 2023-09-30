<template>
  <h1>{{ $t('home.title', { name: authStore.user?.name }) }}</h1>
</template>

<script setup>
import { useAuthStore } from '@/store/auth.js';

const authStore = useAuthStore();
</script>
