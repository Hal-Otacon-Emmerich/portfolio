import { useEffect, useState, type DependencyList } from 'react';

export interface ResourceState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

/**
 * Загружает данные через функцию из portfolioApi и отменяет запрос при размонтировании.
 * Если позже понадобится кеш, можно заменить на TanStack Query, не трогая API-слой.
 */
export function useResource<T>(
  load: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
): ResourceState<T> {
  const [state, setState] = useState<ResourceState<T>>({ data: null, error: null, loading: true });

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, error: null, loading: false });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, error, loading: false });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
