import { useElementVisibility } from '@vueuse/core';
import { computed, MaybeRefOrGetter, Ref, ref, toValue, watch, WatchSource } from 'vue';

/**
 * Render a long list progressively: only the first items are rendered,
 * and the next ones are added each time the end of the list becomes visible.
 *
 * @param list The whole list.
 * @param endOfList Element right after the rendered items (rendered while `hasMore`).
 * @param options.step Number of items added each time, enough to fill the scroll container.
 * @param options.resetOn Sources which reset the list to its first items when they change
 * (filters, search, sort...), as the list then gets a different meaning.
 * @param options.onReset Called after a reset (e.g. to scroll back to the top).
 * @param options.count Where to store the number of rendered items, when it must outlive the
 * component (e.g. in the route query to restore the scroll position on back navigation).
 */
export const useIncrementalList = <T>(
  list: MaybeRefOrGetter<T[]>,
  endOfList: MaybeRefOrGetter<HTMLElement | null | undefined>,
  {
    step = 16,
    resetOn = [],
    onReset,
    count = ref(step),
  }: { step?: number; resetOn?: WatchSource[]; onReset?: () => void; count?: Ref<number> } = {},
) => {
  const isEndOfListVisible = useElementVisibility(endOfList);

  const slicedList = computed(() => toValue(list).slice(0, count.value));
  const hasMore = computed(() => count.value < toValue(list).length);

  // Only react to visibility changes: watching the list too would grow it again before
  // the DOM (and so the visibility) is updated, rendering everything at once.
  // Thus `step` items must be enough to push the end of the list out of view.
  watch(isEndOfListVisible, (isVisible) => {
    if (isVisible && hasMore.value) {
      count.value += step;
    }
  });

  if (resetOn.length) {
    watch(resetOn, () => {
      count.value = step;
      onReset?.();
    });
  }

  return { slicedList, hasMore, count };
};
