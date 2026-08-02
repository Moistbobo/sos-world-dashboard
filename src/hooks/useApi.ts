import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchHealth, fetchMeta, fetchTags, fetchWorld, fetchWorlds } from '../api/client';
import type { PaginatedWorlds } from '../types';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    staleTime: 30_000,
  });
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
    staleTime: 60_000,
  });
}

export function useMeta() {
  return useQuery({
    queryKey: ['meta'],
    queryFn: fetchMeta,
    staleTime: 60_000,
  });
}

export function useWorlds(params?: {
  limit?: number;
  offset?: number;
  tag?: string[];
  quality?: ('good' | 'bad')[];
  search?: string;
  minCapacity?: number;
  maxCapacity?: number;
  platform?: string[];
  dayRange?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['worlds', params],
    queryFn: () => fetchWorlds(params),
    enabled: params?.enabled,
  });
}

export function useInfiniteWorlds(params?: {
  limit?: number;
  tag?: string[];
  quality?: ('good' | 'bad')[];
  search?: string;
  minCapacity?: number;
  maxCapacity?: number;
  platform?: string[];
  dayRange?: number;
  enabled?: boolean;
}) {
  const limit = params?.limit ?? 20;
  return useInfiniteQuery({
    queryKey: ['worlds-infinite', { ...params, limit }],
    queryFn: ({ pageParam }) =>
      fetchWorlds({
        ...params,
        limit,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    enabled: params?.enabled,
  });
}

export function useWorld(worldId: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['world', worldId],
    queryFn: () => {
      if (!worldId) throw new Error('No worldId provided');
      return fetchWorld(worldId);
    },
    enabled: !!worldId,
    placeholderData: () => {
      if (!worldId) return undefined;

      const paginatedQueries = queryClient.getQueriesData<PaginatedWorlds>({
        queryKey: ['worlds'],
      });
      const fromPaginated = paginatedQueries
        .flatMap(([, data]) => data?.worlds ?? [])
        .find((w) => w.worldId === worldId);
      if (fromPaginated) return fromPaginated;

      const infiniteQueries = queryClient.getQueriesData<{ pages: PaginatedWorlds[] }>({
        queryKey: ['worlds-infinite'],
      });
      const fromInfinite = infiniteQueries
        .flatMap(([, data]) => data?.pages.flatMap((page) => page.worlds) ?? [])
        .find((w) => w.worldId === worldId);

      return fromInfinite;
    },
  });
}
