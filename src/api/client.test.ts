import { describe, it, expect, vi } from 'vitest';
import { fetchWorlds } from './client';

global.fetch = vi.fn();

describe('fetchWorlds', () => {
  it('includes minCapacity and maxCapacity query params', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ worlds: [], total: 0, limit: 20, offset: 0 }), { status: 200 })
    );
    await fetchWorlds({ minCapacity: 10, maxCapacity: 40 });
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('minCapacity=10');
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('maxCapacity=40');
  });
});
