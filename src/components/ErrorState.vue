<template>
  <EmptyState v-bind="$attrs" :animation="ErrorCat">
    <template v-if="isJSON($attrs.description)" #description>
      <pre class="mt-6 p-3">{{ $attrs.description }}</pre>
    </template>

    <slot name="action">
      <AppButton
        class="mt-6 border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-500"
        :icon="mdiRefresh"
        :loading="state.isReloading"
        @click="onReload">
        {{ $t('action.reload') }}
      </AppButton>
    </slot>
  </EmptyState>
</template>

<script setup lang="ts">
import EmptyState from './EmptyState.vue';
import AppButton from './form/AppButton.vue';
import ErrorCat from '@/assets/animations/error-cat.lottie';
import { mdiRefresh } from '@mdi/js';
import { isObjectLike } from 'lodash';
import { reactive } from 'vue';

const state = reactive({
  isReloading: false as boolean,
});

const onReload = (event: MouseEvent, hasAction: boolean): void => {
  if (!hasAction) {
    event.preventDefault();
    state.isReloading = true;
    // to start the animation before the page freezes completely
    setTimeout(() => window.location.reload(), 150);
  }
};

const isJSON = (str: unknown): boolean => {
  try {
    const json = JSON.parse(str as string);
    return isObjectLike(json);
  } catch (e) {
    return false;
  }
};
</script>
