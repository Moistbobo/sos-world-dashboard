import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useInfiniteWorlds, useWorlds } from './useApi';
import { fetchWorlds } from '../api/client';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

vi.mock('../api/client', () => ({
  fetchWorlds: vi.fn(() => Promise.resolve({ worlds: [], total: 0, limit: 20, offset: 0 })),
  fetchHealth: vi.fn(),
  fetchTags: vi.fn(),
  fetchWorld: vi.fn(),
}));

describe('useWorlds', () => {
  it('passes minCapacity and maxCapacity to fetchWorlds', async () => {
    renderHook(() => useWorlds({ minCapacity: 10, maxCapacity: 40 }), { wrapper: Wrapper });
    await waitFor(() => expect(vi.mocked(fetchWorlds)).toHaveBeenCalled());
    expect(vi.mocked(fetchWorlds)).toHaveBeenCalledWith(
      expect.objectContaining({ minCapacity: 10, maxCapacity: 40 })
    );
  });
});

describe('useInfiniteWorlds', () => {
  it('passes minCapacity and maxCapacity to fetchWorlds', async () => {
    renderHook(() => useInfiniteWorlds({ minCapacity: 10, maxCapacity: 40, enabled: true }), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(vi.mocked(fetchWorlds)).toHaveBeenCalled());
    expect(vi.mocked(fetchWorlds)).toHaveBeenCalledWith(
      expect.objectContaining({ minCapacity: 10, maxCapacity: 40 })
    );
  });
});
