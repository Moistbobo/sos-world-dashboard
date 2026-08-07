import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { toast } from 'sonner';
import { ListsProvider, MAX_LISTS } from '../contexts/ListsContext';
import { useListCapGuard } from './useListCapGuard';
import { LISTS_STORAGE_KEY } from '../utils/listsStorage';

function seedLists(count: number) {
  const lists = Array.from({ length: count }, (_, i) => ({
    id: `list-${i}`,
    name: `List ${i}`,
    icon: null,
    color: '#4f46e5',
    worldIds: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }));
  window.localStorage.setItem(
    LISTS_STORAGE_KEY,
    JSON.stringify({ version: 1, lists }),
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ListsProvider>{children}</ListsProvider>;
}

beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(toast.error).mockClear();
});

describe('useListCapGuard', () => {
  it('returns true below the list cap', () => {
    const { result } = renderHook(() => useListCapGuard(), {
      wrapper: Wrapper,
    });
    expect(result.current()).toBe(true);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('returns false at the list cap and shows a toast', () => {
    seedLists(MAX_LISTS);
    const { result } = renderHook(() => useListCapGuard(), {
      wrapper: Wrapper,
    });
    expect(result.current()).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining(String(MAX_LISTS)),
    );
  });
});
