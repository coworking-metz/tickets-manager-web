<template>
  <div class="flex h-full flex-col">
    <div class="flex flex-col gap-1 bg-indigo-700 px-4 py-6 sm:px-6">
      <div class="flex flex-row items-center justify-between">
        <DialogTitle
          :class="['shrink truncate text-lg font-medium text-white', loading && 'animate-pulse']">
          {{ $t('activity.new.title') }}
        </DialogTitle>
        <div class="flex h-7 shrink-0 items-center">
          <RouterLink
            class="rounded-md bg-indigo-700 p-1 text-indigo-200 hover:bg-indigo-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            replace
            :to="{ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX }">
            <span class="sr-only">{{ $t('action.close') }}</span>
            <SvgIcon aria-hidden="true" class="size-6" :path="mdiClose" type="mdi" />
          </RouterLink>
        </div>
      </div>
    </div>
    <LoadingSpinner v-if="loading" class="m-auto size-16" />
    <div v-else class="flex flex-col px-4 py-6 sm:px-6">
      <form class="flex h-full flex-col" @submit.prevent="onSubmit">
        <AppTextField
          id="date"
          v-model="state.date"
          :errors="vuelidate.date.$errors.map(({ $message }) => $message as string)"
          :label="$t('activity.new.date.label')"
          :prepend-icon="mdiCalendar"
          required
          type="date" />

        <AppToggleField
          v-model="state.duration"
          :errors="vuelidate.duration.$errors.map(({ $message }) => $message as string)"
          :format="
            (option) =>
              option === ActivityDuration.HALF
                ? $t('activity.detail.duration.half')
                : $t('activity.detail.duration.count', {
                    count: option,
                  })
          "
          :label="$t('activity.detail.duration.label')"
          :options="[ActivityDuration.HALF, ActivityDuration.FULL]"
          :other-placeholder="$t('activity.detail.duration.other')" />

        <AppTextareaField
          id="comment"
          v-model="state.comment"
          :errors="vuelidate.comment.$errors.map(({ $message }) => $message as string)"
          :label="$t('activity.detail.comment.label')"
          :placeholder="$t('activity.detail.comment.placeholder')"
          required />

        <AppButtonPlain
          class="mt-1 self-start dark:focus:ring-offset-neutral-800"
          color="indigo"
          :icon="mdiPlus"
          :loading="state.isSubmitting"
          type="submit">
          {{ $t('action.add') }}
        </AppButtonPlain>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import AppTextField from '@/components/form/AppTextField.vue';
import AppTextareaField from '@/components/form/AppTextareaField.vue';
import AppToggleField from '@/components/form/AppToggleField.vue';
import { ActivityDuration } from '@/helpers/activity';
import { handleSilentError, scrollToFirstError } from '@/helpers/errors';
import { withAppI18nMessage } from '@/i18n';
import { ROUTE_NAMES } from '@/router/names';
import { addMemberActivity } from '@/services/api/members';
import { membersQueryKeys, statsQueryKeys } from '@/services/query';
import { useNotificationsStore } from '@/store/notifications';
import { DialogTitle } from '@headlessui/vue';
import { mdiCalendar, mdiClose, mdiPlus } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import dayjs from 'dayjs';
import { computed, nextTick, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const router = useRouter();
const i18n = useI18n();
const notificationsStore = useNotificationsStore();
const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  memberId: {
    type: String,
    required: true,
  },
});

const queryClient = useQueryClient();
const state = reactive({
  date: dayjs().format('YYYY-MM-DD') as string | null,
  duration: ActivityDuration.FULL as ActivityDuration,
  comment: null as string | null,
  isSubmitting: false as boolean,
});

const rules = computed(() => ({
  date: { required: withAppI18nMessage(required) },
  duration: { required: withAppI18nMessage(required) },
  comment: { required: withAppI18nMessage(required) },
}));

const vuelidate = useVuelidate(rules, state);

const onSubmit = async () => {
  const isValid = await vuelidate.value.$validate();
  if (!isValid) {
    nextTick(scrollToFirstError);
    return;
  }
  vuelidate.value.$reset();

  state.isSubmitting = true;
  addMemberActivity(props.memberId, {
    value: state.duration,
    date: dayjs(state.date).format('YYYY-MM-DD'),
    comment: state.comment as string,
  })
    .then(async () => {
      notificationsStore.addSuccessNotification(
        i18n.t('activity.detail.onAdd.success', {
          date: dayjs(state.date).format('dddd LL'),
        }),
      );
      await router.replace({ name: ROUTE_NAMES.MEMBERS.DETAIL.INDEX });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.profileById(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.historyById(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.activityById(props.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: statsQueryKeys.allUsagePeriods(),
      });
      queryClient.invalidateQueries({
        queryKey: statsQueryKeys.allActivityPeriods(),
      });
      queryClient.invalidateQueries({
        queryKey: statsQueryKeys.allAttendancePeriods(),
      });
    })
    .catch(handleSilentError)
    .catch((error) => {
      notificationsStore.addErrorNotification(
        error,
        i18n.t('activity.new.onAdd.fail', {
          date: dayjs(state.date).format('dddd LL'),
        }),
      );
      return Promise.reject(error);
    })
    .finally(() => {
      state.isSubmitting = false;
    });
};
</script>
