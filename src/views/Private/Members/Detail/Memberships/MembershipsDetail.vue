<template>
  <div class="flex min-h-full flex-col bg-white shadow-xl">
    <div class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex items-center justify-between">
        <DialogTitle :class="['text-lg font-medium text-white', loading && 'animate-pulse']">
          <div v-if="loading" class="h-4 w-48 rounded-full bg-slate-300" />
          <template v-else-if="!selectedMembership">
            {{ $t('memberships.detail.empty.title') }}
          </template>
          <template v-else>
            {{
              $t('memberships.detail.title', {
                year: dayjs(selectedMembership.membershipStart).year(),
              })
            }}
          </template>
        </DialogTitle>
        <div class="ml-3 flex h-7 items-center">
          <RouterLink
            class="rounded-md bg-indigo-700 p-1 text-indigo-200 hover:bg-indigo-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX }">
            <span class="sr-only">{{ $t('action.close') }}</span>
            <SvgIcon aria-hidden="true" class="size-6" :path="mdiClose" type="mdi" />
          </RouterLink>
        </div>
      </div>
      <div v-if="loading" class="h-3 w-64 rounded-full bg-slate-400" />
      <p v-else-if="selectedMembership" class="text-indigo-300 sm:text-sm">
        {{
          $t('memberships.detail.description', {
            purchasedDate: dayjs(selectedMembership.purchased).format('LL'),
            purchasedTime: dayjs(selectedMembership.purchased).format('LT'),
          })
        }}
      </p>
    </div>
    <LoadingSpinner v-if="loading" class="m-auto size-16" />
    <EmptyState
      v-else-if="!selectedMembership"
      class="m-auto"
      :description="$t('memberships.detail.empty.description')"
      :title="$t('memberships.detail.empty.title')" />
    <form
      v-else-if="selectedMembership"
      class="flex h-full flex-col px-4 py-6 sm:px-6"
      @submit.prevent="onSubmit">
      <Head>
        <title>
          {{
            $t('memberships.detail.head.title', {
              year: dayjs(selectedMembership.membershipStart).year(),
            })
          }}
        </title>
      </Head>
      <AppTextField
        id="membership-started"
        v-model="state.started"
        :errors="vuelidate.started.$errors.map(({ $message }) => $message as string)"
        :label="$t('subscriptions.detail.started.label')"
        :prepend-icon="mdiCalendarStartOutline"
        required
        type="date" />
      <AppTextField
        id="membership-reference"
        disabled
        :label="$t('memberships.detail.reference.label')"
        :model-value="selectedMembership.orderReference"
        readonly />

      <AppTextareaField
        id="comment"
        v-model="state.comment"
        :errors="vuelidate.comment.$errors.map(({ $message }) => $message as string)"
        :label="$t('memberships.detail.comment.label')"
        :placeholder="$t('memberships.detail.comment.placeholder')"
        required />

      <div class="mt-1 flex flex-row justify-between gap-3">
        <AppButton
          class="border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500"
          :icon="mdiCheck"
          :loading="state.isSubmitting"
          type="submit">
          {{ $t('action.edit') }}
        </AppButton>

        <AppButton
          class="border border-red-300 bg-white text-red-500 shadow-sm hover:bg-red-50 focus:!ring-red-500"
          :icon="mdiDeleteOutline"
          @click.prevent="state.isDeleteDialogVisible = true">
          {{ $t('action.delete') }}
        </AppButton>
      </div>
    </form>

    <MembershipsDeleteDialog
      v-model="state.isDeleteDialogVisible"
      :member-id="props.memberId"
      :membership-id="props.id"
      @deleted="onChanged" />
  </div>
</template>

<script setup lang="ts">
import MembershipsDeleteDialog from './MembershipsDeleteDialog.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppButton from '@/components/form/AppButton.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppTextareaField from '@/components/form/AppTextareaField.vue';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import { Membership, updateMemberMembership } from '@/services/api/memberships';
import { useNotificationsStore } from '@/store/notifications';
import { DialogTitle } from '@headlessui/vue';
import { mdiCalendarStartOutline, mdiCheck, mdiClose, mdiDeleteOutline } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { Head } from '@unhead/vue/components';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import dayjs from 'dayjs';
import { nextTick, reactive } from 'vue';
import { PropType, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps({
  memberId: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  memberships: {
    type: Array as PropType<Membership[]>,
    default: () => [],
  },
  id: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const queryClient = useQueryClient();
const state = reactive({
  started: null as string | null,
  comment: null as string | null,
  isSubmitting: false as boolean,
  isDeleteDialogVisible: false as boolean,
});

const selectedMembership = computed<Membership | null>(() => {
  return props.memberships.find((membership) => `${membership._id}` === `${props.id}`) ?? null;
});

const rules = computed(() => ({
  started: { required: withAppI18nMessage(required) },
  comment: { required: withAppI18nMessage(required) },
}));

const vuelidate = useVuelidate(rules, state, { $scope: 'memberships-detail' });

const onChanged = async () => {
  await router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX });
  queryClient.invalidateQueries({
    queryKey: ['members', computed(() => props.memberId)],
  });
  queryClient.invalidateQueries({
    queryKey: ['members', computed(() => props.memberId), 'history'],
  });
  queryClient.invalidateQueries({
    queryKey: ['members', computed(() => props.memberId), 'memberships'],
  });
};

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }

  state.isSubmitting = true;
  updateMemberMembership(props.memberId, props.id, {
    membershipStart: state.started as string,
    comment: state.comment as string,
  })
    .then(async (updatedMembership) => {
      notificationsStore.addNotification({
        type: 'success',
        message: i18n.t('memberships.detail.onUpdate.success', {
          year: dayjs(updatedMembership.membershipStart).year(),
        }),
        timeout: 3_000,
      });
      onChanged();
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(error, i18n.t('memberships.detail.onUpdate.fail'));
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};

watch(
  () => selectedMembership.value,
  (membership) => {
    if (membership) {
      state.started = membership.membershipStart;
    }
  },
  { immediate: true },
);
</script>
