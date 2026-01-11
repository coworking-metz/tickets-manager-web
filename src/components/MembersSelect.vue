<template>
  <AppTextField v-bind="$attrs">
    <ol class="flex flex-row items-center">
      <li v-for="member in selected" :key="member._id" class="size-6 rounded-full bg-red-300">
        <MembersThumbnail
          class="shrink-0"
          :email="member.email"
          :name="getMemberFullname(member)" />
      </li>
      <li>
        <AppIcon
          class="size-6 cursor-pointer text-gray-400 transition-colors hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          :icon="mdiMagnify"
          @click="isVisible = true" />
      </li>
    </ol>

    <template #after>
      <AppDialogConfirm
        v-model="isVisible"
        :title="$t('messages.new.recipients.dialog.title')"
        @confirm="applySelection">
        <AppTextField
          id="members-search-dialog"
          v-model="searchQuery"
          class="mb-4"
          clearable
          :placeholder="$t('messages.new.recipients.dialog.search')"
          :prepend-icon="mdiMagnify"
          type="search" />

        <div class="shrink grow basis-0 overflow-y-auto">
          <LoadingSpinner v-if="isPendingMembers" class="mx-auto my-8" />
          <EmptyState
            v-else-if="!filteredMembers.length"
            class="my-8"
            :title="$t('messages.new.recipients.dialog.empty')" />

          <ul
            v-else
            class="h-full divide-y divide-gray-200 rounded-md border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
            <RecycleScroller
              :buffer="1"
              :item-size="80"
              :items="filteredMembers"
              key-field="_id"
              page-mode>
              <template #default="{ item: member }">
                <li
                  class="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-neutral-900/50"
                  @click="toggleMember(member)">
                  <div class="flex items-center p-4 sm:px-6">
                    <div class="flex min-w-0 flex-1 items-start">
                      <div class="relative">
                        <!-- <MembersThumbnail
                          class="shrink-0"
                          :email="member.email"
                          :name="getMemberFullname(member)"
                          :thumbnail="member.thumbnail" /> -->
                        <div
                          v-if="isSelected(member._id)"
                          class="absolute inset-0 flex items-center justify-center rounded-full bg-indigo-600/90">
                          <AppIcon class="size-8 text-white" :icon="mdiCheck" />
                        </div>
                      </div>
                      <div
                        class="flex min-w-0 flex-1 flex-row flex-wrap justify-between gap-3 pl-4">
                        <div class="flex min-w-48 shrink grow basis-0 flex-col items-start">
                          <p
                            class="shrink-0 font-medium text-indigo-600 sm:text-sm dark:text-indigo-400">
                            {{ getMemberFullname(member) }}
                          </p>
                          <p
                            class="mt-1 flex w-full items-center text-sm text-gray-500 dark:text-gray-400">
                            <span class="truncate">{{ member.email }}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </template>
            </RecycleScroller>
          </ul>
        </div>
      </AppDialogConfirm>
    </template>

    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </AppTextField>
</template>

<script lang="ts" setup>
import AppIcon from '@/components/AppIcon.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppDialogConfirm from '@/components/layout/AppDialogConfirm.vue';
import { searchIn } from '@/helpers/text';
import { getAllMembers, MemberListItem } from '@/services/api/members';
import { membersQueryKeys, useAppQuery } from '@/services/query';
import MembersThumbnail from '@/views/Private/Members/MembersThumbnail.vue';
import { mdiCheck, mdiMagnify } from '@mdi/js';
import { computed, reactive, ref, watch } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/index.css';

const isVisible = defineModel({
  type: Boolean,
  default: false,
});

const selected = defineModel<MemberListItem[]>('selected', {
  default: () => [],
});

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
  return selected.value.some((recipient) => recipient._id === memberId);
};

const toggleMember = (member: MemberListItem) => {
  if (isSelected(member._id)) {
    selected.value = selected.value.filter((recipient) => recipient._id !== member._id);
  } else {
    selected.value = [...selected.value, member];
  }
};

const applySelection = () => {
  isVisible.value = false;
};

const getMemberFullname = (member: { firstName?: string; lastName?: string; email?: string }) => {
  return [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email || '';
};
</script>
