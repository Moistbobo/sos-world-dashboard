import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  fetchRatings,
  fetchRatingsForWorldIds,
  fetchComments,
  submitRating,
  updateRating,
  deleteRating,
  submitComment,
} from './sentiment';

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  rpc: vi.fn(),
  signInAnonymously: vi.fn(),
  getSession: vi.fn(),
  from: vi.fn(() => ({
    select: mocks.select,
    insert: mocks.insert,
    update: mocks.update,
    delete: mocks.delete,
  })),
}));

vi.mock('../lib/supabase', () => ({
  getSupabase: () =>
    Promise.resolve({
      auth: {
        signInAnonymously: mocks.signInAnonymously,
        getSession: mocks.getSession,
      },
      from: mocks.from,
      rpc: mocks.rpc,
    }),
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
        maybeSingle: vi.fn().mockReturnValue({
          data: { world_id: 'wrld_123', good: 2, bad: 1, user_rating: null },
          error: null,
        }),
      }),
    });

    const result = await fetchRatings('wrld_123');
    expect(result).toEqual({ worldId: 'wrld_123', good: 2, bad: 1, userRating: null });
  });

  it('returns zeros when the world has no ratings', async () => {
    mocks.select.mockReturnValueOnce({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockReturnValue({
          data: null,
          error: null,
        }),
      }),
    });

    const result = await fetchRatings('wrld_new');
    expect(result).toEqual({ worldId: 'wrld_new', good: 0, bad: 0, userRating: null });
  });
});

describe('fetchRatingsForWorldIds', () => {
  it('returns an empty map without issuing a Supabase query for an empty input', async () => {
    const result = await fetchRatingsForWorldIds([]);
    expect(result.size).toBe(0);
    expect(mocks.select).not.toHaveBeenCalled();
  });

  it('issues a single .in("world_id", [...]) query for the provided ids', async () => {
    const inMock = vi.fn().mockReturnValue({
      data: [
        { world_id: 'wrld_a', good: 5, bad: 1, user_rating: null },
        { world_id: 'wrld_b', good: 0, bad: 3, user_rating: 'bad' },
      ],
      error: null,
    });
    mocks.select.mockReturnValueOnce({ in: inMock });

    const result = await fetchRatingsForWorldIds(['wrld_a', 'wrld_b']);

    expect(mocks.select).toHaveBeenCalledTimes(1);
    expect(inMock).toHaveBeenCalledWith('world_id', ['wrld_a', 'wrld_b']);
    expect(result.get('wrld_a')).toEqual({
      worldId: 'wrld_a',
      good: 5,
      bad: 1,
      userRating: null,
    });
    expect(result.get('wrld_b')).toEqual({
      worldId: 'wrld_b',
      good: 0,
      bad: 3,
      userRating: 'bad',
    });
  });

  it('deduplicates ids before querying', async () => {
    const inMock = vi.fn().mockReturnValue({ data: [], error: null });
    mocks.select.mockReturnValueOnce({ in: inMock });

    await fetchRatingsForWorldIds(['wrld_a', 'wrld_a', 'wrld_b']);

    expect(inMock).toHaveBeenCalledWith('world_id', ['wrld_a', 'wrld_b']);
  });

  it('returns an empty map (not an error) for worlds with no summary rows', async () => {
    mocks.select.mockReturnValueOnce({ in: vi.fn().mockReturnValue({ data: [], error: null }) });

    const result = await fetchRatingsForWorldIds(['wrld_x', 'wrld_y']);
    expect(result.size).toBe(0);
  });

  it('throws on a Supabase error', async () => {
    mocks.select.mockReturnValueOnce({
      in: vi.fn().mockReturnValue({ data: null, error: { message: 'batch failed' } }),
    });

    await expect(fetchRatingsForWorldIds(['wrld_a'])).rejects.toThrow('batch failed');
  });
});

describe('fetchComments', () => {
  it('returns a paginated result with comments and total count', async () => {
    mocks.select
      .mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockReturnValue({
              data: [{ id: 'c1', content: 'hi' }],
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        eq: vi.fn().mockReturnValue({
          count: 42,
          error: null,
        }),
      });

    const result = await fetchComments('wrld_123', { limit: 20, offset: 0 });
    expect(result).toEqual({ comments: [{ id: 'c1', content: 'hi' }], total: 42 });
  });
});

describe('ensureAnonymousUser (via submitRating)', () => {
  it('reuses an existing anonymous session user', async () => {
    mocks.getSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-existing', is_anonymous: true } } },
      error: null,
    });
    mocks.insert.mockReturnValueOnce({ data: null, error: null });
    await submitRating('wrld_123', 'good');
    expect(mocks.signInAnonymously).not.toHaveBeenCalled();
    expect(mocks.insert).toHaveBeenCalled();
  });

  it('signs in anonymously when the existing user is not anonymous', async () => {
    mocks.getSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'user-existing', is_anonymous: false } } },
      error: null,
    });
    mocks.insert.mockReturnValueOnce({ data: null, error: null });
    await submitRating('wrld_123', 'good');
    expect(mocks.signInAnonymously).toHaveBeenCalled();
    expect(mocks.insert).toHaveBeenCalled();
  });

  it('throws if anonymous sign-in does not return an anonymous user', async () => {
    mocks.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    mocks.signInAnonymously.mockResolvedValueOnce({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    await expect(submitRating('wrld_123', 'good')).rejects.toThrow('Anonymous sign-in failed');
  });
});

describe('submitRating', () => {
  it('signs in anonymously and inserts rating', async () => {
    mocks.insert.mockReturnValueOnce({ data: null, error: null });
    await submitRating('wrld_123', 'good');
    expect(mocks.signInAnonymously).toHaveBeenCalled();
    expect(mocks.insert).toHaveBeenCalled();
  });

  it('passes the captcha token to anonymous sign-in when provided', async () => {
    mocks.insert.mockReturnValueOnce({ data: null, error: null });
    await submitRating('wrld_123', 'good', 'turnstile-token');
    expect(mocks.signInAnonymously).toHaveBeenCalledWith({
      options: { captchaToken: 'turnstile-token' },
    });
    expect(mocks.insert).toHaveBeenCalled();
  });
});

describe('updateRating', () => {
  it('updates the current user rating for the world', async () => {
    mocks.update.mockReturnValueOnce({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ error: null }),
      }),
    });
    await updateRating('wrld_123', 'bad');
    expect(mocks.update).toHaveBeenCalledWith({ value: 'bad' });
    expect(mocks.signInAnonymously).toHaveBeenCalled();
  });

  it('throws on update error', async () => {
    mocks.update.mockReturnValueOnce({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ error: { message: 'update failed' } }),
      }),
    });
    await expect(updateRating('wrld_123', 'good')).rejects.toThrow('update failed');
  });
});

describe('deleteRating', () => {
  it('deletes the current user rating for the world', async () => {
    mocks.delete.mockReturnValueOnce({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ error: null }),
      }),
    });
    await deleteRating('wrld_123');
    expect(mocks.delete).toHaveBeenCalled();
    expect(mocks.signInAnonymously).toHaveBeenCalled();
  });

  it('throws on delete error', async () => {
    mocks.delete.mockReturnValueOnce({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ error: { message: 'delete failed' } }),
      }),
    });
    await expect(deleteRating('wrld_123')).rejects.toThrow('delete failed');
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
