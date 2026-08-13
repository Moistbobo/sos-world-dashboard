import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAppVersion } from './version';

describe('getAppVersion', () => {
  let originalVersion: string | undefined;
  let originalMode: string | undefined;
  let originalSha: string | undefined;

  beforeEach(() => {
    originalVersion = (globalThis as Record<string, unknown>).__APP_VERSION__ as string | undefined;
    originalMode = (globalThis as Record<string, unknown>).__APP_MODE__ as string | undefined;
    originalSha = (globalThis as Record<string, unknown>).__APP_GIT_SHA__ as string | undefined;
  });

  afterEach(() => {
    (globalThis as Record<string, unknown>).__APP_VERSION__ = originalVersion;
    (globalThis as Record<string, unknown>).__APP_MODE__ = originalMode;
    (globalThis as Record<string, unknown>).__APP_GIT_SHA__ = originalSha;
  });

  it('returns the version with git short SHA in production mode', () => {
    (globalThis as Record<string, unknown>).__APP_VERSION__ = '1.0.0';
    (globalThis as Record<string, unknown>).__APP_MODE__ = 'production';
    (globalThis as Record<string, unknown>).__APP_GIT_SHA__ = 'abc1234';
    expect(getAppVersion()).toBe('1.0.0 — abc1234');
  });

});
