<template>
  <AppDialogConfirm
    v-model="isVisible"
    :title="$t('messages.new.recipients.dialog.title')"
    type="info"
    @confirm="applySelection">
    <AppSearchField
      id="members-search-dialog"
      v-model="searchQuery"
      class="mb-4"
      clearable
      :placeholder="$t('messages.new.recipients.dialog.search')" />

    <div class="max-h-96 overflow-y-auto">
      <LoadingSpinner v-if="isPendingMembers" class="mx-auto my-8" />
      <EmptyState
        v-else-if="!filteredMembers.length"
        class="my-8"
        :title="$t('messages.new.recipients.dialog.empty')" />
      <ul
        v-else
        class="divide-y divide-gray-200 rounded-md border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
        <li
          v-for="member in filteredMembers"
          :key="member._id"
          class="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-neutral-900/50"
          @click="toggleMember(member._id)">
          <div class="flex items-center p-4 sm:px-6">
            <div class="flex min-w-0 flex-1 items-start">
              <div class="relative">
                <MembersThumbnail
                  class="shrink-0"
                  :email="member.email"
                  :name="getMemberFullname(member)"
                  :thumbnail="member.thumbnail" />
                <!-- Icône de sélection sur la photo de profil -->
                <div
                  v-if="isSelected(member._id)"
                  class="absolute inset-0 flex items-center justify-center rounded-full bg-indigo-600/90">
                  <AppIcon class="size-8 text-white" :icon="mdiCheck" />
                </div>
              </div>
              <div class="flex min-w-0 flex-1 flex-row flex-wrap justify-between gap-3 pl-4">
                <div class="flex min-w-48 shrink grow basis-0 flex-col items-start">
                  <p class="shrink-0 font-medium text-indigo-600 sm:text-sm dark:text-indigo-400">
                    {{ getMemberFullname(member) }}
                  </p>
                  <p class="mt-1 flex w-full items-center text-sm text-gray-500 dark:text-gray-400">
                    <span class="truncate">{{ member.email }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </AppDialogConfirm>
</template>

<script setup lang="ts">
import MembersThumbnail from '../Members/MembersThumbnail.vue';
import AppIcon from '@/components/AppIcon.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppSearchField from '@/components/form/AppSearchField.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppDialogConfirm from '@/components/layout/AppDialogConfirm.vue';
import { searchIn } from '@/helpers/text';
import { getAllMembers } from '@/services/api/members';
import { ApiMessageAcknowledgement } from '@/services/api/messages';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import { mdiCheck, mdiMagnify } from '@mdi/js';
import { computed, ref, watch } from 'vue';

const isVisible = defineModel({
  type: Boolean,
  default: false,
});

const selectedRecipients = defineModel<ApiMessageAcknowledgement[]>('recipients', {
  required: true,
});

const pendingRecipients = ref<ApiMessageAcknowledgement[]>([]);

const searchQuery = ref<string | null>(null);

const { isPending: isPendingMembers, data: members } = useAppQuery(
  computed(() => ({
    queryKey: membersQueryKeys.all(),
    queryFn: () => getAllMembers(),
  })),
);

const filteredMembers = computed(() => {
  if (!members.value) return [];
  return members.value.filter((member) =>
    searchIn(searchQuery.value, member.firstName, member.lastName, member.email, member.badgeId),
  );
});

const isSelected = (memberId: string) => {
  return pendingRecipients.value.some((recipient) => recipient.memberId === memberId);
};

const toggleMember = (memberId: string) => {
  if (isSelected(memberId)) {
    pendingRecipients.value = pendingRecipients.value.filter(
      (recipient) => recipient.memberId !== memberId,
    );
  } else {
    pendingRecipients.value = [
      ...pendingRecipients.value,
      {
        memberId,
        delivered: null,
        read: null,
      },
    ];
  }
};

const applySelection = () => {
  selectedRecipients.value = pendingRecipients.value;
  isVisible.value = false;
};

watch(
  () => isVisible.value,
  (visible) => {
    if (visible) {
      pendingRecipients.value = [...selectedRecipients.value];
    }
  },
);

const getMemberFullname = (member: { firstName?: string; lastName?: string; email?: string }) => {
  return [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email || '';
};
</script>
