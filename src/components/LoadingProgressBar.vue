<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div class="flex overflow-hidden bg-transparent">
    <!-- https://github.com/tailwindlabs/tailwindcss/discussions/3921#discussioncomment-5258971 -->
    <progress
      class="progress left-right size-full [&::-moz-progress-bar]:bg-indigo-500 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-indigo-500 [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-indigo-500" />
  </div>
</template>

<style scoped>
@keyframes indeterminateAnimation {
  0% {
    transform: translateX(0) scaleX(0);
  }
  40% {
    transform: translateX(0) scaleX(0.4);
  }
  100% {
    transform: translateX(100%) scaleX(0.5);
  }
}

.progress {
  animation: indeterminateAnimation 1s infinite linear;
  transform-origin: 0% 50%;
}
</style>
