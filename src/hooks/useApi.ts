import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchHealth, fetchTags, fetchWorld, fetchWorlds } from '../api/client';

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
  });
}

export function useWorlds(params?: {
  limit?: number;
  offset?: number;
  tag?: string[];
  quality?: ('good' | 'bad')[];
  search?: string;
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
  return useQuery({
    queryKey: ['world', worldId],
    queryFn: () => {
      if (!worldId) throw new Error('No worldId provided');
      return fetchWorld(worldId);
    },
    enabled: !!worldId,
  });
}
