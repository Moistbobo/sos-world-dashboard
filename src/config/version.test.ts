import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAppVersion } from './version';

describe('getAppVersion', () => {
  let originalVersion: string | undefined;
  let originalMode: string | undefined;

  beforeEach(() => {
    originalVersion = (globalThis as Record<string, unknown>).__APP_VERSION__ as string | undefined;
    originalMode = (globalThis as Record<string, unknown>).__APP_MODE__ as string | undefined;
  });

  afterEach(() => {
    (globalThis as Record<string, unknown>).__APP_VERSION__ = originalVersion;
    (globalThis as Record<string, unknown>).__APP_MODE__ = originalMode;
    vi.restoreAllMocks();
  });

  it('returns the plain version in production mode', () => {
    (globalThis as Record<string, unknown>).__APP_VERSION__ = '1.0.0';
    (globalThis as Record<string, unknown>).__APP_MODE__ = 'production';
    expect(getAppVersion()).toBe('1.0.0');
  });

  it('returns version with UTC timestamp in preview mode', () => {
    (globalThis as Record<string, unknown>).__APP_VERSION__ = '1.0.0';
    (globalThis as Record<string, unknown>).__APP_MODE__ = 'preview';
    const mockDate = new Date(Date.UTC(2026, 5, 24, 12, 0, 0));
    vi.setSystemTime(mockDate);

    const result = getAppVersion();

    expect(result).toMatch(/^1\.0\.0 — \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });
});
