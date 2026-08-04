import { fetchHealth } from '../api/client';
import { useApiQuery } from './useApiToasts';

export function useHealth() {
  return useApiQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    staleTime: 30_000,
    suppressErrorToast: true,
  });
}
