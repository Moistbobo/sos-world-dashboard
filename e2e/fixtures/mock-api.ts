import type { Page, Route } from '@playwright/test';
import { meResponse, metaResponse, paginate, tagsResponse, worlds } from './worlds-fixtures';
import type { World } from '../src/types';

function parseList(value: string | null): string[] {
  return value ? value.split(',').filter(Boolean) : [];
}

function filterWorlds(query: URLSearchParams): World[] {
  const search = query.get('search')?.trim().toLowerCase() ?? '';
  const tags = parseList(query.get('tag'));
  const qualities = parseList(query.get('quality')) as ('good' | 'bad')[];
  const platforms = parseList(query.get('platform'));
  const rawMinCapacity = query.get('minCapacity');
  const rawMaxCapacity = query.get('maxCapacity');
  const minCapacity = rawMinCapacity === null ? NaN : Number(rawMinCapacity);
  const maxCapacity = rawMaxCapacity === null ? NaN : Number(rawMaxCapacity);
  const dayRange = Number(query.get('dayRange'));
  const highPriorityOnly = query.get('highPriority') === 'true';

  return worlds.filter((w) => {
    if (highPriorityOnly && w.highPriority !== true) return false;
    if (search) {
      const haystack = `${w.name} ${w.authorName}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (tags.length && !tags.every((t) => w.tags.includes(t))) return false;
    if (qualities.length && (w.quality === null || !qualities.includes(w.quality))) {
      return false;
    }
    if (
      platforms.length &&
      !platforms.every((p) => w.platforms.includes(p))
    ) {
      return false;
    }
    if (Number.isFinite(minCapacity) && w.capacity < minCapacity) return false;
    if (Number.isFinite(maxCapacity) && w.capacity > maxCapacity) return false;
    if (Number.isFinite(dayRange) && dayRange > 0) {
      const cutoff = Date.now() - dayRange * 86_400_000;
      if (!w.internalAddDate) return false;
      const added = new Date(w.internalAddDate).getTime();
      if (!Number.isFinite(added) || added < cutoff) return false;
    }
    return true;
  });
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}

/**
 * Install a request interceptor that returns deterministic fixture data for
 * every /api/* endpoint the /worlds page calls. Mirrors the contract of the
 * real backend (`src/api/client.ts` → `fetchWorlds` / `fetchTags` / `fetchMeta`).
 *
 * The pattern deliberately targets root-anchored `/api/...` paths so it does
 * not intercept Vite's `src/api/...` module URLs in dev mode.
 */
export async function mockApi(page: Page) {
  await page.route(/\/api\/(tags|meta|me|worlds(?:\/[^/]+)?|health)(?:[?#].*)?$/, async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const query = url.searchParams;

    if (path === '/api/tags') {
      return json(route, tagsResponse);
    }
    if (path === '/api/meta') {
      return json(route, metaResponse);
    }
    if (path === '/api/me') {
      return json(route, meResponse);
    }
    if (path === '/api/worlds' || path.startsWith('/api/worlds?')) {
      const limit = Number(query.get('limit') ?? 20);
      const offset = Number(query.get('offset') ?? 0);
      return json(route, paginate(filterWorlds(query), limit, offset));
    }
    const worldIdMatch = path.match(/^\/api\/worlds\/([^/]+)$/);
    if (worldIdMatch) {
      const found = worlds.find((w) => w.worldId === worldIdMatch[1]);
      if (!found) return json(route, { error: 'not found' }, 404);
      return json(route, found);
    }
    return json(route, { error: 'unhandled' }, 404);
  });
}
