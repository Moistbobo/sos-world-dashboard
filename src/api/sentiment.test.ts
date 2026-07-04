import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchRatings, fetchComments, submitRating, submitComment } from './sentiment';

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  rpc: vi.fn(),
  signInAnonymously: vi.fn(),
  getSession: vi.fn(),
  from: vi.fn(() => ({
    select: mocks.select,
    insert: mocks.insert,
  })),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInAnonymously: mocks.signInAnonymously,
      getSession: mocks.getSession,
    },
    from: mocks.from,
    rpc: mocks.rpc,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  mocks.signInAnonymously.mockResolvedValue({
    data: { user: { id: 'user-1', is_anonymous: true } },
    error: null,
  });
});

describe('fetchRatings', () => {
  it('returns aggregate counts and null user rating when no session', async () => {
    mocks.select.mockReturnValueOnce({
      eq: vi.fn().mockReturnValue({
        data: [
          { value: 'good' },
          { value: 'good' },
          { value: 'bad' },
        ],
        error: null,
      }),
    });

    const result = await fetchRatings('wrld_123');
    expect(result).toEqual({ worldId: 'wrld_123', good: 2, bad: 1, userRating: null });
  });
});

describe('fetchComments', () => {
  it('returns comments ordered by created_at desc', async () => {
    mocks.select.mockReturnValueOnce({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          data: [{ id: 'c1', content: 'hi' }],
          error: null,
        }),
      }),
    });

    const result = await fetchComments('wrld_123');
    expect(result).toEqual([{ id: 'c1', content: 'hi' }]);
  });
});

describe('submitRating', () => {
  it('signs in anonymously and inserts rating', async () => {
    mocks.insert.mockReturnValueOnce({ data: null, error: null });
    await submitRating('wrld_123', 'good');
    expect(mocks.signInAnonymously).toHaveBeenCalled();
    expect(mocks.insert).toHaveBeenCalled();
  });
});

describe('submitComment', () => {
  it('signs in anonymously and inserts comment', async () => {
    mocks.insert.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockReturnValue({ data: { id: 'c1' }, error: null }),
      }),
    });
    const result = await submitComment('wrld_123', 'Nice world');
    expect(mocks.signInAnonymously).toHaveBeenCalled();
    expect(result).toEqual({ id: 'c1' });
  });
});
