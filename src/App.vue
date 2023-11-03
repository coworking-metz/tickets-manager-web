<template>
  <Head>
    <title>{{ $t('head.title') }}</title>
    <meta :content="$t('head.meta.content')" :name="$t('head.meta.description')" />
    <link :href="`prime-vue-assets/soho-${state.theme}/theme.css`" rel="stylesheet" />
  </Head>
  <p-progress-spinner v-if="state.isLoading" class="m-auto" />
  <router-view v-else />
</template>

<script lang="ts" setup>
import { Head } from '@unhead/vue/components';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const state = reactive({
  isLoading: true as boolean,
  theme: 'light' as 'light' | 'dark',
});

router.isReady().finally(() => {
  state.isLoading = false;
});
</script>
