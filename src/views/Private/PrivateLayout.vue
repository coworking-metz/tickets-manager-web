<template>
  <div class="flex min-h-full grow flex-row items-start">
    <NavigationDrawer class="sticky top-0 min-h-[100vh]" />
    <main class="flex w-full flex-col self-stretch">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import NavigationDrawer from '@/components/layout/NavigationDrawer.vue';
</script>
