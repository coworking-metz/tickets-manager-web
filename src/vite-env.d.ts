/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '@jamescoyle/vue-icon';
declare module '*.lottie';
declare module 'vue-number-animation';

// CSS-only package, imported for its side effect (font faces)
declare module 'typeface-inter';
