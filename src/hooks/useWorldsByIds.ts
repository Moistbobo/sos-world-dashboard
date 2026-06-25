import { useQueries } from '@tanstack/react-query';
import { fetchWorld } from '../api/client';
import type { World } from '../types';

interface WorldQueryResult {
  worldId: string;
  data: World | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

export function useWorldsByIds(worldIds: string[]) {
  const uniqueIds = worldIds.filter(Boolean);
  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ['world', id] as const,
      queryFn: () => fetchWorld(id),
      enabled: !!id,
    })),
  });

  const worlds: WorldQueryResult[] = uniqueIds.map((worldId, index) => ({
    worldId,
    data: queries[index]?.data,
    isPending: queries[index]?.isPending ?? false,
    isError: queries[index]?.isError ?? false,
    error: (queries[index]?.error as Error | null) ?? null,
  }));

  return {
    worlds,
    isPending: queries.some((q) => q.isPending),
    isError: queries.some((q) => q.isError),
  };
}
