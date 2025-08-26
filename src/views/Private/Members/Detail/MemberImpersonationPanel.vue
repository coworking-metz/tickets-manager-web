<template>
  <div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
    <h3 class="text-lg font-medium leading-6 text-gray-900">
      {{ $t('members.detail.impersonation.title') }}
    </h3>
    <p class="mt-2 max-w-xl whitespace-pre-line text-sm text-gray-500">
      {{ $t('members.detail.impersonation.description') }}
    </p>
    <div class="mt-5 flex flex-row flex-wrap items-center gap-3">
      <a
        class="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-indigo-100 px-4 py-2 font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
        :href="
          HTTP.getUri({
            url: `/api/auth/impersonate/${member._id}`,
            params: {
              refreshToken: authStore.getRefreshToken(),
              accessToken: authStore.accessToken,
            },
          })
        "
        target="_blank">
        <SvgIcon aria-hidden="true" class="size-5" :path="mdiDramaMasks" type="mdi" />
        <span>{{ $t('members.detail.impersonation.impersonate') }}</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
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
