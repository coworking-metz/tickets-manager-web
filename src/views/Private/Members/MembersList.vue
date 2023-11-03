<template>
  <section class="mx-auto flex w-full max-w-4xl grow flex-col sm:px-6 lg:px-8">
    <h1>{{ $t('members.list.title') }}</h1>
    <div
      v-bind="containerProps"
      class="min-h-[320px] grow basis-0 overflow-hidden bg-white shadow sm:rounded-md">
      <ul v-bind="wrapperProps" class="divide-y divide-gray-200" role="list">
        <li v-for="{ data: member } in list" :key="`member-${member.id}`">
          <RouterLink
            class="block hover:bg-gray-50"
            :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL, params: { id: member.id } }">
            <MembersListCard loading :member="member" />
          </RouterLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import MembersListCard from './MembersListCard.vue';
import { handleSilentError, parseErrorText } from '@/helpers/errors';
import { ROUTE_NAMES } from '@/router/names';
import { MemberListItem, getAllMembers } from '@/services/api/members';
import { useVirtualList } from '@vueuse/core';
import { computed, onMounted } from 'vue';
import { reactive } from 'vue';

const state = reactive({
  isFetching: false,
  members: [] as MemberListItem[],
  search: null as string | null,
  errorMessage: null as string | null,
});

const filteredList = computed(() => state.members);

const { list, containerProps, wrapperProps } = useVirtualList(filteredList, {
  // Keep `itemHeight` in sync with the item's row.
  itemHeight: 80,
});

const fetchMembers = () => {
  state.isFetching = true;
  getAllMembers()
    .then((members) => {
      state.members = members;
    })
    .catch(handleSilentError)
    .catch(async (error) => {
      state.errorMessage = await parseErrorText(error);
      return Promise.reject(error);
    })
    .finally(() => {
      state.isFetching = false;
    });
};

onMounted(fetchMembers);
</script>
