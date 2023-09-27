<template>
  <span v-if="state.isLoading">{{ $t('loading') }}</span>
  <router-view v-else />
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const state = reactive({
  isLoading: true as boolean,
});

router.isReady().finally(() => {
  state.isLoading = false;
});
</script>
