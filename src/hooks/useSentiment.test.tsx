import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useRatings,
  useComments,
  useSubmitRating,
  useUpdateRating,
  useDeleteRating,
  useSubmitComment,
} from './useSentiment';
import { useCurrentUserId } from './useCurrentUser';
import * as sentimentApi from '../api/sentiment';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
    },
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
});

describe('useRatings', () => {
  it('fetches rating summary', async () => {
    vi.spyOn(sentimentApi, 'fetchRatings').mockResolvedValue({
      worldId: 'wrld_123',
      good: 5,
      bad: 1,
      userRating: null,
    });
    const { result } = renderHook(() => useRatings('wrld_123'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ worldId: 'wrld_123', good: 5, bad: 1, userRating: null });
  });
});

describe('useComments', () => {
  it('fetches comments', async () => {
    vi.spyOn(sentimentApi, 'fetchComments').mockResolvedValue([
      { id: 'c1', world_id: 'wrld_123', user_id: 'u1', username: 'user1', content: 'hi', created_at: '2024-01-01T00:00:00Z' },
    ]);
    const { result } = renderHook(() => useComments('wrld_123'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      { id: 'c1', world_id: 'wrld_123', user_id: 'u1', username: 'user1', content: 'hi', created_at: '2024-01-01T00:00:00Z' },
    ]);
  });
});

describe('useSubmitRating', () => {
  it('calls submitRating and invalidates rating query', async () => {
    vi.spyOn(sentimentApi, 'submitRating').mockResolvedValue(undefined);
    const { result } = renderHook(() => useSubmitRating(), { wrapper });
    await result.current.mutateAsync({ worldId: 'wrld_123', value: 'good' });
    expect(sentimentApi.submitRating).toHaveBeenCalledWith('wrld_123', 'good');
  });
});

describe('useUpdateRating', () => {
  it('calls updateRating', async () => {
    vi.spyOn(sentimentApi, 'updateRating').mockResolvedValue(undefined);
    const { result } = renderHook(() => useUpdateRating(), { wrapper });
    await result.current.mutateAsync({ worldId: 'wrld_123', value: 'bad' });
    expect(sentimentApi.updateRating).toHaveBeenCalledWith('wrld_123', 'bad');
  });
});

describe('useDeleteRating', () => {
  it('calls deleteRating', async () => {
    vi.spyOn(sentimentApi, 'deleteRating').mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteRating(), { wrapper });
    await result.current.mutateAsync({ worldId: 'wrld_123' });
    expect(sentimentApi.deleteRating).toHaveBeenCalledWith('wrld_123');
  });
});

describe('useSubmitComment', () => {
  it('calls submitComment and invalidates comments query', async () => {
    vi.spyOn(sentimentApi, 'submitComment').mockResolvedValue({
      id: 'c2',
      world_id: 'wrld_123',
      user_id: 'u2',
      username: 'user2',
      content: 'hello',
      created_at: '2024-01-01T00:00:00Z',
    });
    const { result } = renderHook(() => useSubmitComment(), { wrapper });
    await result.current.mutateAsync({ worldId: 'wrld_123', content: 'hello' });
    expect(sentimentApi.submitComment).toHaveBeenCalledWith('wrld_123', 'hello');
  });

  it('optimistically inserts a comment marked as the current user', async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u-current' } } },
      error: null,
    });
    vi.spyOn(sentimentApi, 'submitComment').mockResolvedValue({
      id: 'c2',
      world_id: 'wrld_123',
      user_id: 'u-current',
      username: 'Anonymous',
      content: 'hello',
      created_at: '2024-01-01T00:00:00Z',
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    function TestWrapper({ children }: { children: React.ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    const { result } = renderHook(
      () => {
        const userId = useCurrentUserId();
        const submit = useSubmitComment();
        return { userId, submit };
      },
      { wrapper: TestWrapper },
    );

    await waitFor(() => expect(result.current.userId).toBe('u-current'));
    await result.current.submit.mutateAsync({ worldId: 'wrld_123', content: 'hello' });

    const comments = queryClient.getQueryData(['comments', 'wrld_123']);
    expect(comments).toHaveLength(1);
    expect((comments as { user_id: string }[])[0].user_id).toBe('u-current');
  });
});
