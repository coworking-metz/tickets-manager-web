<template>
  <SvgIcon aria-hidden="true" :path="icon" type="mdi" />
</template>

<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon';
defineProps({
  icon: {
    type: String,
    required: true,
  },
});
</script>
