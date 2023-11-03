<template>
  <Head>
    <title>{{ $t('head.title') }}</title>
    <meta :content="$t('head.meta.content')" :name="$t('head.meta.description')" />
  </Head>
  <LoadingSpinner v-if="state.isLoading" class="m-auto h-24 w-24" />
  <router-view v-else />
</template>

<script lang="ts" setup>
import LoadingSpinner from './components/LoadingSpinner.vue';
import { Head } from '@unhead/vue/components';
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
