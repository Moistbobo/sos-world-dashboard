import { useEffect, useState, useCallback } from 'react';
import { fetchHealth, fetchTags, fetchWorld, fetchWorlds } from '../api/client';

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList
): State<T> & { refetch: () => void } {
  const [state, setState] = useState<State<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(() => {
    setState({ data: null, loading: true, error: null });
    fetcher()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => setState({ data: null, loading: false, error: err instanceof Error ? err.message : String(err) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

export function useHealth() {
  return useAsync(fetchHealth, []);
}

export function useTags() {
  return useAsync(fetchTags, []);
}

export function useWorlds(params?: {
  limit?: number;
  offset?: number;
  tag?: string[];
  quality?: ('good' | 'bad')[];
}) {
  return useAsync(
    () => fetchWorlds(params),
    [params?.limit, params?.offset, JSON.stringify(params?.tag), JSON.stringify(params?.quality)]
  );
}

export function useWorld(worldId: string | undefined) {
  return useAsync(
    () => {
      if (!worldId) throw new Error('No worldId provided');
      return fetchWorld(worldId);
    },
    [worldId]
  );
}
