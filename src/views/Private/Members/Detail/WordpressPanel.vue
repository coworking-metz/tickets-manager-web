<template>
  <div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
    <h3 class="text-lg font-medium leading-6 text-gray-900">
      {{ $t('members.detail.wordpress.title') }}
    </h3>
    <p class="mt-2 max-w-xl whitespace-pre-line text-sm text-gray-500">
      {{ $t('members.detail.wordpress.description') }}
    </p>
    <div class="mt-5 flex flex-row items-center gap-6">
      <AppButton
        class="border border-transparent bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        :loading="state.isSyncing"
        @click="onSync">
        {{ $t('members.detail.wordpress.sync') }}
      </AppButton>
      <a
        class="group flex items-center gap-x-3 text-sm font-medium text-indigo-600 hover:text-indigo-900"
        :href="`https://www.coworking-metz.fr/wp-admin/user-edit.php?user_id=${member.wordpressId}`"
        target="_blank">
        <SvgIcon
          aria-hidden="true"
          class="h-5 w-5 text-indigo-500 group-hover:text-indigo-900"
          :path="mdiOpenInNew"
          type="mdi" />
        <span>{{ $t('members.detail.wordpress.check') }}</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppButton from '@/components/form/AppButton.vue';
import { Member, syncMember } from '@/services/api/members';
import { useNotificationsStore } from '@/store/notifications';
import { mdiOpenInNew } from '@mdi/js';
import { PropType, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['update:member']);
const props = defineProps({
  member: {
    type: Object as PropType<Member>,
    required: true,
  },
});

const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const state = reactive({
  isSyncing: false,
});

const onSync = () => {
  state.isSyncing = true;
  syncMember(props.member.id)
    .then((member) => {
      state.isSyncing = false;
      emit('update:member', member);
    })
    .catch((error) => {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('members.detail.wordpress.onSync.fail'),
      );
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSyncing = false;
    });
};
</script>
