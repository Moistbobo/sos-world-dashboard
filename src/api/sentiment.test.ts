import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  fetchRatings,
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
