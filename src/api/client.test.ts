import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchFilterCounts, fetchWorlds } from './client';

globalThis.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchWorlds', () => {
  it('includes minCapacity and maxCapacity query params', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ worlds: [], total: 0, limit: 20, offset: 0 }), { status: 200 })
    );
    await fetchWorlds({ minCapacity: 10, maxCapacity: 40 });
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('minCapacity=10');
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('maxCapacity=40');
  });

  it('does not include capacity params when not provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ worlds: [], total: 0, limit: 20, offset: 0 }), { status: 200 })
    );
    await fetchWorlds({ limit: 10 });
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).not.toContain('minCapacity');
    expect(url).not.toContain('maxCapacity');
  });

  it('includes platform query params', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ worlds: [], total: 0, limit: 20, offset: 0 }), { status: 200 })
    );
    await fetchWorlds({ platform: ['android', 'ios'] });
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain('platform=android');
    expect(url).toContain('platform=ios');
  });
});

describe('fetchFilterCounts', () => {
  it('includes all filter query params', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ qualityCounts: [], platformCounts: [] }),
        { status: 200 }
      )
    );

    await fetchFilterCounts({
      search: 'test',
      minCapacity: 10,
      maxCapacity: 40,
      tag: ['chill'],
      quality: ['good'],
      platform: ['android'],
    });

    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain('/api/filter-counts?');
    expect(url).toContain('search=test');
    expect(url).toContain('minCapacity=10');
    expect(url).toContain('maxCapacity=40');
    expect(url).toContain('tag=chill');
    expect(url).toContain('quality=good');
    expect(url).toContain('platform=android');
  });

  it('omits unset filter params', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ qualityCounts: [], platformCounts: [] }),
        { status: 200 }
      )
    );

    await fetchFilterCounts({});

    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toBe('http://localhost:3000/api/filter-counts');
  });
});
