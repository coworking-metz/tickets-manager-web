<template>
  <Head>
    <meta :content="$t('head.meta.content')" :name="$t('head.meta.description')" />
    <html :lang="$i18n.locale.substring(0, 2)" />
  </Head>
  <LoadingSpinner v-if="state.isLoading" class="m-auto h-16 w-16" />
  <router-view v-else />
  <NotificationToast />
</template>

<script lang="ts" setup>
import NotificationToast from './components/NotificationToast.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useHead } from '@unhead/vue';
import { Head } from '@unhead/vue/components';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const i18n = useI18n();
const router = useRouter();
const state = reactive({
  isLoading: true as boolean,
});

useHead({
  titleTemplate: (title?: string) => [title, i18n.t('head.title')].filter(Boolean).join(' - '),
});

router.isReady().finally(() => {
  state.isLoading = false;
});
</script>
