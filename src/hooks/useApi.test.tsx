import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWorld } from './useApi';
import * as client from '../api/client';
import type { World } from '../types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const createWorld = (overrides: Partial<World> = {}): World => ({
  worldId: 'wrld_123',
  name: 'Test World',
  authorName: 'Test Author',
  imageUrl: 'https://example.com/image.png',
  tags: [],
  platforms: ['pc'],
  capacity: 42,
  quality: 'good',
  createdAt: '2024-01-01T00:00:00Z',
  internalAddDate: '2024-02-01T00:00:00Z',
  vrchatUrl: 'https://vrchat.com/home/world/wrld_123',
  ...overrides,
});

describe('useWorld', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('returns placeholder data from paginated worlds cache and fetches in background', async () => {
    const cachedWorld = createWorld({ worldId: 'wrld_cached', name: 'Cached World' });
    const fetchedWorld = createWorld({ worldId: 'wrld_cached', name: 'Fetched World' });

    queryClient.setQueryData(['worlds', {}], {
      worlds: [cachedWorld],
      total: 1,
      limit: 20,
      offset: 0,
    });

    vi.spyOn(client, 'fetchWorld').mockResolvedValue(fetchedWorld);

    const { result } = renderHook(() => useWorld('wrld_cached'), { wrapper: Wrapper });

    expect(result.current.data?.name).toBe('Cached World');
    expect(result.current.isPending).toBe(false);
    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.data?.name).toBe('Fetched World'));
    expect(result.current.isFetching).toBe(false);
    expect(client.fetchWorld).toHaveBeenCalledWith('wrld_cached');
  });

  it('returns placeholder data from infinite worlds cache', () => {
    const cachedWorld = createWorld({ worldId: 'wrld_infinite', name: 'Infinite World' });

    queryClient.setQueryData(['worlds-infinite', {}], {
      pages: [{ worlds: [cachedWorld], total: 1, limit: 20, offset: 0 }],
      pageParams: [0],
    });

    vi.spyOn(client, 'fetchWorld').mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useWorld('wrld_infinite'), { wrapper: Wrapper });

    expect(result.current.data?.name).toBe('Infinite World');
    expect(result.current.isPending).toBe(false);
  });

  it('prefers paginated cache over infinite cache when both are present', async () => {
    const paginatedWorld = createWorld({
      worldId: 'wrld_both',
      name: 'Paginated World',
    });
    const infiniteWorld = createWorld({
      worldId: 'wrld_both',
      name: 'Infinite World',
    });
    const fetchedWorld = createWorld({ worldId: 'wrld_both', name: 'Fetched World' });

    queryClient.setQueryData(['worlds', {}], {
      worlds: [paginatedWorld],
      total: 1,
      limit: 20,
      offset: 0,
    });
    queryClient.setQueryData(['worlds-infinite', {}], {
      pages: [{ worlds: [infiniteWorld], total: 1, limit: 20, offset: 0 }],
      pageParams: [0],
    });

    vi.spyOn(client, 'fetchWorld').mockResolvedValue(fetchedWorld);

    const { result } = renderHook(() => useWorld('wrld_both'), { wrapper: Wrapper });

    expect(result.current.data?.name).toBe('Paginated World');
    await waitFor(() => expect(result.current.data?.name).toBe('Fetched World'));
  });

  it('returns undefined when worldId is undefined', () => {
    const { result } = renderHook(() => useWorld(undefined), { wrapper: Wrapper });
    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(true);
  });
});
