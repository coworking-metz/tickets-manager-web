<template>
  <div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
    <h3 class="text-lg font-medium leading-6 text-gray-900">
      {{ $t('members.detail.wordpress.title') }}
    </h3>
    <p class="mt-2 max-w-xl whitespace-pre-line text-sm text-gray-500">
      {{ $t('members.detail.wordpress.description') }}
    </p>
    <div class="mt-5 flex flex-row flex-wrap items-center gap-3">
      <AppButton
        class="border border-transparent bg-indigo-100 text-indigo-700 transition-colors hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        :loading="state.isSyncing"
        @click="onSync">
        {{ $t('members.detail.wordpress.sync') }}
      </AppButton>
      <a
        v-if="!isNil(props.member.wpUserId)"
        class="group flex flex-row items-center gap-x-3 rounded-md border border-transparent px-4 py-2 font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
        :href="buildMemberWordpressProfileUrl(props.member.wpUserId)"
        target="_blank">
        <SvgIcon
          aria-hidden="true"
          class="size-5 text-indigo-500 group-hover:text-indigo-700"
          :path="mdiOpenInNew"
          type="mdi" />
        <span>{{ $t('members.detail.wordpress.navigate') }}</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from '@/components/form/AppButton.vue';
import { Member, buildMemberWordpressProfileUrl, syncMember } from '@/services/api/members';
import { useNotificationsStore } from '@/store/notifications';
import { mdiOpenInNew } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { isNil } from 'lodash';
import { PropType, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  member: {
    type: Object as PropType<Member>,
    required: true,
  },
});

const queryClient = useQueryClient();
const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const state = reactive({
  isSyncing: false,
});

const onSync = () => {
  state.isSyncing = true;
  syncMember(props.member._id)
    .then(() => {
      notificationsStore.addNotification({
        message: i18n.t('members.detail.wordpress.onSync.success', {
          name: [props.member.firstName, props.member.lastName].filter(Boolean).join(' '),
        }),
        type: 'success',
        timeout: 3_000,
      });
      queryClient.invalidateQueries({
        queryKey: ['members', computed(() => props.member._id)],
      });
    })
    .catch((error) => {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.detail.wordpress.onSync.fail', {
          name: [props.member.firstName, props.member.lastName].filter(Boolean).join(' '),
        }),
      );
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSyncing = false;
    });
};
</script>
