<template>
  <h1>{{ $t('home.title', { name: authStore.user?.name }) }}</h1>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
</script>
