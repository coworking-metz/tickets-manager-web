/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '@jamescoyle/vue-icon';
declare module '*.lottie';
declare module 'vue-number-animation';
