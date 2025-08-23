<template>
  <div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
    <h3 class="text-lg font-medium leading-6 text-gray-900">
      {{ $t('members.detail.impersonation.title') }}
    </h3>
    <p class="mt-2 max-w-xl whitespace-pre-line text-sm text-gray-500">
      {{ $t('members.detail.impersonation.description') }}
    </p>
    <div class="mt-5 flex flex-row flex-wrap items-center gap-3">
      <AppButton
        class="border border-transparent bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        :icon="mdiDramaMasks"
        :loading="state.isImpersonating"
        @click="onImpersonate">
        {{ $t('members.detail.impersonation.impersonate') }}
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from '@/components/form/AppButton.vue';
import { Member, impersonateMember } from '@/services/api/members';
import { useAuthStore } from '@/store/auth';
import { useNotificationsStore } from '@/store/notifications';
import { mdiDramaMasks } from '@mdi/js';
import { PropType, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  member: {
    type: Object as PropType<Member>,
    required: true,
  },
});

const authStore = useAuthStore();
const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const state = reactive({
  isImpersonating: false,
});

const onImpersonate = () => {
  state.isImpersonating = true;
  impersonateMember(props.member._id, authStore.getRefreshToken() as string)
    .then(({ accessToken, refreshToken }) => {
      authStore.setRefreshToken(refreshToken);
      const url = new URL('/home', 'poulailler:///');
      url.searchParams.set('accessToken', accessToken);
      url.searchParams.set('refreshToken', refreshToken);
      window.open(url);
    })
    .catch((error) => {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.detail.impersonation.onImpersonate.fail', {
          name: [props.member.firstName, props.member.lastName].filter(Boolean).join(' '),
        }),
      );
      return Promise.reject(error);
    })
    .finally(() => {
      state.isImpersonating = false;
    });
};
</script>
