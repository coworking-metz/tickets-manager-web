<template>
  <div class="transition-wrapper">
    <router-view v-slot="{ Component }">
      <transition :name="state.transitionName">
        <component :is="Component" v-bind="$attrs" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { isRouteAfter } from '@/router/helpers';
import { reactive } from 'vue';
import { onBeforeRouteUpdate } from 'vue-router';

defineOptions({
  inheritAttrs: false,
});

const state = reactive({
  transitionName: 'none' as string,
});

onBeforeRouteUpdate((to, from, next) => {
  state.transitionName = isRouteAfter(to, from) ? 'slide-left' : 'slide-right';
  next();
});
</script>

<style scoped>
@import '@/styles/slide-view.css';
</style>
