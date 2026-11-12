import { Component, getCurrentInstance, h, onBeforeUnmount, render } from 'vue';

/**
 * Render a Vue component into a detached element, for third-party libraries
 * expecting an HTMLElement (like ECharts tooltip formatters).
 * The component keeps access to the app plugins (i18n, router, ...).
 *
 * Must be called during a component setup: the element is unmounted with it.
 */
export const useComponentRenderer = () => {
  const appContext = getCurrentInstance()?.appContext ?? null;
  const container = document.createElement('div');

  onBeforeUnmount(() => render(null, container));

  return <P extends Record<string, unknown>>(component: Component, props: P): HTMLElement => {
    const vnode = h(component, props);
    vnode.appContext = appContext;
    render(vnode, container);
    return container;
  };
};
