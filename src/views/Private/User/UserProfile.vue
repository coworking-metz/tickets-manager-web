<template>
  <div>
    <h1>{{ $t('user.profile.title') }}</h1>
    <button @click="onLogout">
      {{ $t('action.logout') }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const onLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
