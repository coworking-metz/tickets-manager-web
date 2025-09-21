<template>
  <AppPanel>
    <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
      {{ $t('members.detail.impersonation.title') }}
    </h3>
    <p class="mt-2 max-w-xl whitespace-pre-line text-sm text-gray-500 dark:text-gray-400">
      {{ $t('members.detail.impersonation.description') }}
    </p>
    <div class="mt-5 flex flex-row flex-wrap items-center gap-3">
      <AppButtonTonal
        class="dark:focus:ring-offset-neutral-800"
        color="indigo"
        :href="
          HTTP.getUri({
            url: `/api/auth/impersonate/${member._id}`,
            params: {
              refreshToken: authStore.refreshToken,
              accessToken: authStore.accessToken,
            },
          })
        "
        :icon="mdiDramaMasks"
        target="_blank">
        {{ $t('members.detail.impersonation.impersonate') }}
      </AppButtonTonal>
    </div>
  </AppPanel>
</template>

<script setup lang="ts">
import AppButtonTonal from '@/components/form/AppButtonTonal.vue';
import AppPanel from '@/components/layout/AppPanel.vue';
import { Member } from '@/services/api/members';
import HTTP from '@/services/http';
import { useAuthStore } from '@/store/auth';
import { mdiDramaMasks } from '@mdi/js';
import { PropType } from 'vue';

defineProps({
  member: {
    type: Object as PropType<Member>,
    required: true,
  },
});

const authStore = useAuthStore();
</script>
