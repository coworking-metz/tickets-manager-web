<template>
  <AppPanel>
    <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
      {{ $t('members.detail.wordpress.title') }}
    </h3>
    <p class="mt-2 max-w-xl whitespace-pre-line text-sm text-gray-500 dark:text-gray-400">
      {{ $t('members.detail.wordpress.description') }}
    </p>
    <div class="mt-5 flex flex-row flex-wrap items-center gap-3">
      <AppButtonTonal
        class="dark:focus:ring-offset-neutral-800"
        color="indigo"
        :loading="state.isSyncing"
        @click="onSync">
        {{ $t('members.detail.wordpress.sync') }}
      </AppButtonTonal>
      <AppButtonText
        v-if="!isNil(member?.wpUserId)"
        class="dark:focus:ring-offset-neutral-800"
        color="indigo"
        :href="buildMemberWordpressProfileUrl(member.wpUserId)"
        :icon="mdiOpenInNew"
        :loading="isFetchingMember"
        target="_blank">
        {{ $t('members.detail.wordpress.navigate') }}
      </AppButtonText>
    </div>
  </AppPanel>
</template>

<script setup lang="ts">
import AppButtonText from '@/components/form/AppButtonText.vue';
import AppButtonTonal from '@/components/form/AppButtonTonal.vue';
import AppPanel from '@/components/layout/AppPanel.vue';
import { buildMemberWordpressProfileUrl, getMember, syncMember } from '@/services/api/members';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import { useNotificationsStore } from '@/store/notifications';
import { mdiOpenInNew } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { compact, isNil } from 'lodash';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
});

const queryClient = useQueryClient();
const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const state = reactive({
  isSyncing: false,
});

const { isFetching: isFetchingMember, data: member } = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.byId(props.memberId),
    queryFn: () => getMember(props.memberId),
  })),
);

const onSync = () => {
  state.isSyncing = true;
  syncMember(props.memberId)
    .then(() => {
      notificationsStore.addNotification({
        message: i18n.t('members.detail.wordpress.onSync.success', {
          name: compact([member.value?.firstName, member.value?.lastName]).join(' '),
        }),
        type: 'success',
        timeout: 3_000,
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.byId(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.ticketsById(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.subscriptionsById(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.membershipsById(props.memberId),
      });
    })
    .catch((error) => {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.detail.wordpress.onSync.fail', {
          name: compact([member.value?.firstName, member.value?.lastName]).join(' '),
        }),
      );
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSyncing = false;
    });
};
</script>
