<template>
  <div class="">
    <span v-if="state.isLoading">{{ $t('loading') }}</span>
    <router-view v-else />
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const state = reactive({
  isLoading: true,
});

router.isReady().finally(() => {
  state.isLoading = false;
});
</script>
