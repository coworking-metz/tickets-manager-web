<template>
  <vue-number-animation :duration="duration" :format="format" :from="from" :tag="tag" :to="to" />
</template>

<script setup lang="ts">
import { formatNumber } from '@/helpers/numeric';
import { PropType } from 'vue';
import VueNumberAnimation from 'vue-number-animation';

// @see https://github.com/nkoik/vue-animated-number
defineProps({
  tag: {
    type: String,
    default: 'span',
  },
  from: {
    type: Number,
    default: 0,
  },
  to: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    default: 0.3,
  },
  format: {
    type: Function as PropType<(number: number) => string>,
    default: (number: number) => formatNumber(number),
  },
});
</script>
