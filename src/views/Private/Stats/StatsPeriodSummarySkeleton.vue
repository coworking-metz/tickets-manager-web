<template>
  <!-- Same layout as StatsPeriodSummary, while its data is loading -->
  <div aria-hidden="true" class="flex flex-col gap-1">
    <div
      v-for="index in rows"
      :key="`summary-skeleton-row-${index}`"
      class="flex flex-row items-center justify-between gap-6 py-0.5">
      <div class="flex flex-row items-center gap-1.5">
        <LoadingSkeleton class="size-3 shrink-0 rounded-full" />
        <LoadingSkeleton class="h-4 w-40" />
      </div>
      <LoadingSkeleton class="h-4 w-16" />
    </div>

    <LoadingSkeleton class="mt-1 ml-auto h-9 w-32 rounded-lg" />

    <div class="flex flex-row items-center justify-between gap-6 py-0.5">
      <div class="flex flex-row items-center gap-1.5">
        <LoadingSkeleton class="size-3 shrink-0 rounded-full" />
        <LoadingSkeleton class="h-4 w-28" />
      </div>
      <LoadingSkeleton class="h-4 w-16" />
    </div>

    <LoadingSkeleton class="mt-2 -mr-2.5 h-6 w-24 self-end rounded-full" />
  </div>
</template>

<script setup lang="ts">
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';

defineProps({
  /** Number of category rows */
  rows: {
    type: Number,
    default: 3,
  },
});
</script>
