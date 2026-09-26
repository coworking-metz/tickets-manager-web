import { useWindowSize } from '@vueuse/core';
import { computed } from 'vue';

export const MOBILE_MAX_WIDTH = 640;
export const useMobileWidth = () => {
  const { width } = useWindowSize();

  return computed(() => width.value < MOBILE_MAX_WIDTH);
};
