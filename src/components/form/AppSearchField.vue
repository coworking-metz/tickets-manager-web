<template>
  <AppTextField type="search" v-bind="$attrs">
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>

    <template #prepend="{ isInvalid }">
      <LoadingSpinner
        v-if="loading"
        class="absolute inset-y-0 left-0 z-[11] ml-3 min-h-10 w-5 text-gray-400" />
      <AppIcon
        v-else
        :class="[
          'pointer-events-none absolute inset-y-0 left-0 z-[11] ml-3 min-h-10 w-5 text-gray-400',
          isInvalid && 'text-red-500',
        ]"
        :icon="prependIcon" />
    </template>
  </AppTextField>
</template>

<script lang="ts" setup>
import AppTextField from './AppTextField.vue';
import AppIcon from '@/components/AppIcon.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { mdiMagnify } from '@mdi/js';

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  prependIcon: {
    type: String,
    default: mdiMagnify,
  },
});
</script>
