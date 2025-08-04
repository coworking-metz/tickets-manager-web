<template>
  <dotlottie-player ref="player" auto v-bind="$attrs" @ready="onReady" />
</template>

<script setup lang="ts">
import '@dotlottie/player-component';
import { ref } from 'vue';

const props = defineProps({
  autoplay: {
    type: Boolean,
    default: false,
  },
});

const player = ref();
defineExpose({
  player,
});

// https://github.com/dotlottie/player-component/issues/246
const onReady = () => {
  if (player.value && props.autoplay) {
    player.value.play();
  }
};
</script>
