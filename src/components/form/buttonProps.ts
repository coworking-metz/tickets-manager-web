import { PropType } from 'vue';
import { RouteLocationRaw } from 'vue-router';

export const buttonProps = {
  loading: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: 'button',
  },
  to: {
    type: Object as PropType<RouteLocationRaw>,
    default: null,
  },
  href: {
    type: String,
    default: null,
  },
  target: {
    type: String,
    default: null,
  },
};

export type ButtonProps = typeof buttonProps;
