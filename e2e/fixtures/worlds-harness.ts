import type { Page } from '@playwright/test';
import { mockApi } from './mock-api';

export type ScrollMode = 'infinite' | 'pagination';
export type ViewMode = 'grid' | 'list';

export interface WorldsVisitOptions {
  scrollMode?: ScrollMode;
  viewMode?: ViewMode;
  theme?: 'light' | 'dark';
  queryString?: string;
}

export async function visitWorlds(page: Page, options: WorldsVisitOptions = {}) {
  const { scrollMode = 'infinite', viewMode = 'grid', theme = 'light', queryString = '' } = options;
  await page.addInitScript(
    ({ scrollMode, viewMode, theme }) => {
      window.localStorage.setItem('sos-worlds-scroll-mode', scrollMode);
      window.localStorage.setItem('sos-worlds-view-mode', viewMode);
      window.localStorage.setItem('sos-theme', theme);
    },
    { scrollMode, viewMode, theme },
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
