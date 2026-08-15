import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useCurrentUserId } from './useCurrentUser';

type AuthStateCallback = (event: string, session: { user: { id: string } } | null) => void;
type OnAuthStateChange = (callback: AuthStateCallback) => { data: { subscription: { unsubscribe: () => void } } };
type MockedOnAuthStateChange = OnAuthStateChange & {
  mockImplementation: (fn: OnAuthStateChange) => MockedOnAuthStateChange;
};

const defaultSubscription = { data: { subscription: { unsubscribe: vi.fn() } } };

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  unsubscribe: vi.fn(),
  onAuthStateChange: vi.fn(() => defaultSubscription) as unknown as MockedOnAuthStateChange,
}));

vi.mock('../lib/supabase', () => ({
  getSupabase: () =>
    Promise.resolve({
      auth: {
        getSession: mocks.getSession,
        onAuthStateChange: mocks.onAuthStateChange,
      },
    }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCurrentUserId', () => {
  it('returns the current user id from session', async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-123' } } },
      error: null,
    });
    const { result } = renderHook(() => useCurrentUserId());
    await waitFor(() => expect(result.current).toBe('user-123'));
  });

  it('returns null when there is no session', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    const { result } = renderHook(() => useCurrentUserId());
    await waitFor(() => expect(result.current).toBeNull());
  });

  it('updates the user id when auth state changes', async () => {
    let listener: AuthStateCallback | null = null;
    mocks.onAuthStateChange.mockImplementation((callback) => {
      listener = callback;
      return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
    });
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'initial-user' } } },
      error: null,
    });

    const { result } = renderHook(() => useCurrentUserId());
    await waitFor(() => expect(result.current).toBe('initial-user'));

    await act(async () => {
      listener?.('SIGNED_IN', { user: { id: 'changed-user' } });
    });

    await waitFor(() => expect(result.current).toBe('changed-user'));
    expect(mocks.unsubscribe).not.toHaveBeenCalled();
  });
});
