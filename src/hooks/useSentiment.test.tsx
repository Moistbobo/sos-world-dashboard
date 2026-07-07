import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useRatings,
  useInfiniteComments,
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
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
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

describe('useInfiniteComments', () => {
  it('fetches the first page of comments', async () => {
    vi.spyOn(sentimentApi, 'fetchComments').mockResolvedValue({
      comments: [
        { id: 'c1', world_id: 'wrld_123', user_id: 'u1', username: 'user1', content: 'hi', created_at: '2024-01-01T00:00:00Z' },
      ],
      total: 1,
    });
    const { result } = renderHook(() => useInfiniteComments('wrld_123'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages).toEqual([
      {
        comments: [
          { id: 'c1', world_id: 'wrld_123', user_id: 'u1', username: 'user1', content: 'hi', created_at: '2024-01-01T00:00:00Z' },
        ],
        total: 1,
      },
    ]);
  });

  it('has more pages when total exceeds loaded count', async () => {
    vi.spyOn(sentimentApi, 'fetchComments').mockResolvedValue({
      comments: Array.from({ length: 20 }, (_, i) => ({
        id: `c${i}`,
        world_id: 'wrld_123',
        user_id: 'u1',
        username: 'user1',
        content: `comment ${i}`,
        created_at: '2024-01-01T00:00:00Z',
      })),
      total: 42,
    });
    const { result } = renderHook(() => useInfiniteComments('wrld_123'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });
});

describe('useSubmitRating', () => {
  it('calls submitRating and invalidates rating query', async () => {
    vi.spyOn(sentimentApi, 'submitRating').mockResolvedValue(undefined);
    const { result } = renderHook(() => useSubmitRating(), { wrapper });
    await result.current.mutateAsync({ worldId: 'wrld_123', value: 'good' });
    expect(sentimentApi.submitRating).toHaveBeenCalledWith('wrld_123', 'good', undefined);
  });
});

describe('useUpdateRating', () => {
  it('calls updateRating', async () => {
    vi.spyOn(sentimentApi, 'updateRating').mockResolvedValue(undefined);
    const { result } = renderHook(() => useUpdateRating(), { wrapper });
    await result.current.mutateAsync({ worldId: 'wrld_123', value: 'bad' });
    expect(sentimentApi.updateRating).toHaveBeenCalledWith('wrld_123', 'bad', undefined);
  });
});

describe('useDeleteRating', () => {
  it('calls deleteRating', async () => {
    vi.spyOn(sentimentApi, 'deleteRating').mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteRating(), { wrapper });
    await result.current.mutateAsync({ worldId: 'wrld_123' });
    expect(sentimentApi.deleteRating).toHaveBeenCalledWith('wrld_123', undefined);
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
    expect(sentimentApi.submitComment).toHaveBeenCalledWith('wrld_123', 'hello', undefined);
  });

  it('optimistically inserts a comment into the first page marked as the current user', async () => {
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

    queryClient.setQueryData(['comments', 'wrld_123'], {
      pages: [
        {
          comments: [
            { id: 'c1', world_id: 'wrld_123', user_id: 'u1', username: 'user1', content: 'hi', created_at: '2024-01-01T00:00:00Z' },
          ],
          total: 1,
        },
      ],
      pageParams: [{ offset: 0, limit: 20 }],
    });

    await result.current.submit.mutateAsync({ worldId: 'wrld_123', content: 'hello' });

    const comments = queryClient.getQueryData(['comments', 'wrld_123']) as {
      pages: { comments: { user_id: string }[]; total: number }[];
    };
    expect(comments.pages[0].comments).toHaveLength(2);
    expect(comments.pages[0].comments[0].user_id).toBe('u-current');
    expect(comments.pages[0].total).toBe(2);
  });
});
