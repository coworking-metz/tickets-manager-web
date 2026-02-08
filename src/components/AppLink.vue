<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <component
    :is="tag ?? (!to ? 'a' : 'router-link')"
    :aria-disabled="disabled || null"
    :class="[
      'anchor-link text-left align-top transition-colors',
      (icon || loading) && 'inline-flex flex-row items-start gap-2',
      !disabled &&
        'text-indigo-500 outline-none hover:text-indigo-600 active:text-indigo-800 dark:hover:text-indigo-400 dark:active:text-indigo-300',
      disabled &&
        'pointer-events-none cursor-not-allowed text-gray-500/80 dark:text-neutral-400/80',
    ]"
    :target="target"
    :to="to">
    <slot name="prepend" />
    <div class="inline">
      <span :class="['link-decoration gap-x-1 whitespace-normal', linkIcon && 'inline', textClass]">
        <slot />
        <SvgIcon
          v-if="linkIcon"
          aria-hidden="true"
          :class="['ml-0.5 inline size-5 shrink-0 align-sub', iconClass]"
          :path="linkIcon"
          type="mdi" />
      </span>
    </div>
    <slot name="append" />
  </component>
</template>

<script setup lang="ts">
import { mdiOpenInNew } from '@mdi/js';
import { computed } from 'vue';

const props = defineProps({
  tag: {
    type: String,
    default: null,
  },
  to: {
    type: [String, Object],
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  textClass: {
    type: String,
    default: '',
  },
  iconClass: {
    type: String,
    default: '',
  },
  target: {
    type: String,
    default: null,
  },
});

const linkIcon = computed(() => props.icon ?? (props.target ? mdiOpenInNew : null));
</script>

<style scoped>
.link-decoration {
  background:
    linear-gradient(90deg, hsla(60, 2%, 74%, 0), hsla(60, 2%, 74%, 0)),
    linear-gradient(90deg, currentColor, currentColor);
  background-position:
    0 100%,
    100% 100%;
  background-repeat: no-repeat;
  background-size:
    100% 0.1em,
    0 0.1em;
  padding-bottom: 0.1em;
  margin-bottom: -0.1em;
  transition: background-size 400ms;
}

.anchor-link:not([aria-disabled]):hover .link-decoration,
.anchor-link:not([aria-disabled]):focus .link-decoration {
  background-size:
    0 0.1em,
    100% 0.1em;
  background-position:
    100% 100%,
    0 100%;
}
</style>
