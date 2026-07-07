import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchMeta, fetchWorlds } from './client';

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

  it('includes dayRange query param when provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ worlds: [], total: 0, limit: 20, offset: 0 }), { status: 200 })
    );
    await fetchWorlds({ dayRange: 7 });
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain('dayRange=7');
  });

  it('does not include dayRange query param when not provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ worlds: [], total: 0, limit: 20, offset: 0 }), { status: 200 })
    );
    await fetchWorlds({ limit: 10 });
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).not.toContain('dayRange');
  });
});

describe('fetchMeta', () => {
  it('fetches /api/meta with no query params', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          qualityGood: 123,
          qualityBad: 12,
          platformDesktop: 80,
          platformAndroid: 45,
          platformiOS: 6,
        }),
        { status: 200 }
      )
    );

    const result = await fetchMeta();

    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain('/api/meta');
    expect(url).not.toContain('?');
    expect(result).toEqual({
      qualityGood: 123,
      qualityBad: 12,
      platformDesktop: 80,
      platformAndroid: 45,
      platformiOS: 6,
    });
  });
});
