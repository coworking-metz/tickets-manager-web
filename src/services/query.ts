import { isSilentError, parseErrorText } from '@/helpers/errors';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';
import { computedAsync } from '@vueuse/core';

export const useAppQuery = <TData = unknown>(options: UseQueryOptions<TData>) => {
  const query = useQuery(options);

  const errorText = computedAsync(() => {
    if (query.isError && query.error.value && !isSilentError(query.error.value)) {
      return parseErrorText(query.error.value);
    }
    return null;
  });

  return {
    ...query,
    errorText,
  };
};
