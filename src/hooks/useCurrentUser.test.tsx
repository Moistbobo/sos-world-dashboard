import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCurrentUserId } from './useCurrentUser';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  unsubscribe: vi.fn(),
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
});
