<template>
  <div class="flex min-h-full flex-row items-start">
    <NavigationDrawer class="sticky top-0 min-h-[100vh]" />
    <main class="flex w-full flex-col self-stretch py-6">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import NavigationDrawer from '@/components/layout/NavigationDrawer.vue';
</script>
