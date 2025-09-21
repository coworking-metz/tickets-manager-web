<template>
  <Head>
    <html :lang="$i18n.locale.substring(0, 2)" />
    <meta :content="$t('head.meta.content')" name="description" />
  </Head>
  <LoadingProgressBar v-if="state.isLoading" class="fixed inset-x-0 top-0 z-50 h-0.5" />
  <LoadingSpinner v-if="!state.isReady" class="m-auto size-16" />
  <router-view v-else />
  <Teleport to="body">
    <Toaster
      :position="width <= 600 ? 'top-center' : 'bottom-left'"
      :toast-options="{
        unstyled: true,
      }"
      :visible-toasts="5" />
  </Teleport>

  <small
    v-if="ENVIRONMENT"
    class="fixed -right-6 top-3 z-50 flex h-5 w-24 rotate-45 items-center justify-center overflow-hidden truncate bg-indigo-700 text-xs lowercase text-white shadow sm:-left-6 sm:-rotate-45">
    {{ ENVIRONMENT }}
  </small>
</template>

<script lang="ts" setup>
import LoadingProgressBar from '@/components/LoadingProgressBar.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import NotificationToast from '@/components/NotificationToast.vue';
import { ENVIRONMENT } from '@/helpers/environment';
import { applyTheme, useTheme } from '@/services/theme';
import { useNotificationsStore } from '@/store/notifications';
import { useSettingsStore } from '@/store/settings';
import { useHead } from '@unhead/vue';
import { Head } from '@unhead/vue/components';
import { useMagicKeys, useWindowSize, whenever } from '@vueuse/core';
import { isNil } from 'lodash';
import { markRaw, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Toaster, toast } from 'vue-sonner';
import 'vue-sonner/style.css';

const { width } = useWindowSize();
const i18n = useI18n();
const router = useRouter();
const notificationsStore = useNotificationsStore();
const state = reactive({
  isReady: false as boolean,
  isLoading: false as boolean,
});

useHead({
  titleTemplate: (title?: string) => [title, i18n.t('head.title')].filter(Boolean).join(' - '),
});

router.isReady().finally(() => {
  state.isReady = true;
});

router.beforeEach((_to, _from, next) => {
  state.isLoading = true;
  next();
});

router.afterEach(() => {
  state.isLoading = false;
});

router.onError((error) => {
  state.isLoading = false;
  state.isReady = true;

  const actions = [
    {
      label: i18n.t('action.reload'),
      onClick: () => window.location.reload(),
    },
    {
      label: i18n.t('action.help'),
      onClick: () =>
        window.open(`mailto:contact@coworking-metz.fr?body=${encodeURIComponent(error.message)}`),
    },
  ];

  if (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed')
  ) {
    notificationsStore.addNotification({
      message: i18n.t('errors.onImport.message'),
      description: i18n.t('errors.onImport.description'),
      type: 'error',
      actions,
    });
  } else {
    notificationsStore.addErrorNotification(error, '', {
      actions,
    });
  }
});

watch(
  () => notificationsStore.history.length,
  (_historyLength) => {
    const history = notificationsStore.history;
    const allNotificationsNotDismissed = history.filter(({ dismissed }) => isNil(dismissed));
    const allNotificationsNotDismissedSorted = allNotificationsNotDismissed.sort(
      (first, second) => new Date(second.created).getTime() - new Date(first.created).getTime(),
    );
    const [notification] = allNotificationsNotDismissedSorted;
    if (notification) {
      toast.custom(markRaw(NotificationToast), {
        duration: Infinity,
        componentProps: {
          notificationId: notification.id,
        },
      });
    }
  },
  { immediate: true, deep: true },
);

const theme = useTheme();
watch(theme, applyTheme, { immediate: true });
const settingsStore = useSettingsStore();
const { meta_shift_a } = useMagicKeys();
whenever(meta_shift_a, () => {
  settingsStore.setTheme(theme.value === 'dark' ? 'light' : 'dark');
});
</script>
