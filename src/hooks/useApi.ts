import { useQuery } from '@tanstack/react-query';
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
}) {
  return useQuery({
    queryKey: ['worlds', params],
    queryFn: () => fetchWorlds(params),
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
