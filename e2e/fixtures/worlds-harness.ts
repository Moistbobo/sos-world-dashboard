import type { Page } from '@playwright/test';
import { mockApi } from './mock-api';

export type ScrollMode = 'infinite' | 'pagination';
export type ViewMode = 'grid' | 'list';

export interface WorldsVisitOptions {
  scrollMode?: ScrollMode;
  viewMode?: ViewMode;
  theme?: 'light' | 'dark';
  queryString?: string;
  /**
   * Seed an entered API token (`sos-api-token`) so the curator filter section
   * and badges render. Without it, `WorldsPage` gates curator UI off, matching
   * a viewer token. The mock `/api/me` fixture returns a curator regardless.
   */
  curator?: boolean;
}

export async function visitWorlds(page: Page, options: WorldsVisitOptions = {}) {
  const { scrollMode = 'infinite', viewMode = 'grid', theme = 'light', queryString = '', curator = false } = options;
  await page.addInitScript(
    ({ scrollMode, viewMode, theme, curator }) => {
      window.localStorage.setItem('sos-worlds-scroll-mode', scrollMode);
      window.localStorage.setItem('sos-worlds-view-mode', viewMode);
      window.localStorage.setItem('sos-theme', theme);
      if (curator) {
        window.localStorage.setItem('sos-api-token', 'e2e-curator-token');
      }
    },
    { scrollMode, viewMode, theme, curator },
  );
  await mockApi(page);
  await page.goto(`/worlds${queryString}`);
  await page.getByRole('heading', { name: /worlds/i }).waitFor();
}

export async function expandFilters(page: Page) {
  await page.getByRole('button', { name: /filters/i }).click();
}

export async function waitForWorldsRequest(
  page: Page,
  predicate: (url: URL) => boolean,
): Promise<URL> {
  const request = await page.waitForRequest((req) => {
    if (!req.url().includes('/api/worlds')) return false;
    try {
      return predicate(new URL(req.url()));
    } catch {
      return false;
    }
  });
  return new URL(request.url());
}
