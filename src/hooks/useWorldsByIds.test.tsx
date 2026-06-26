import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWorldsByIds } from './useWorldsByIds';
import * as client from '../api/client';
import type { World } from '../types';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useWorldsByIds', () => {
  it('fetches worlds in a single batch call', async () => {
    const fetchSpy = vi.spyOn(client, 'fetchWorldsByIds').mockResolvedValue([
      { worldId: 'wrld_1', name: 'World One' } as World,
      { worldId: 'wrld_2', name: 'World Two' } as World,
    ]);

    const { result } = renderHook(() => useWorldsByIds(['wrld_1', 'wrld_2']), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(['wrld_1', 'wrld_2']);
    expect(result.current.worlds).toHaveLength(2);
    expect(result.current.worlds[0].data?.name).toBe('World One');
  });
});
