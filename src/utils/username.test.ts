import { describe, expect, it } from 'vitest';
import { generateUsername } from './username';

const uuidA = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const uuidB = '8f410ce4-3b37-4cbe-8f21-b171f2f3890b';

describe('generateUsername', () => {
  it('returns a string from uuid', () => {
    const result = generateUsername(uuidA);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('is deterministic for the same uuid', () => {
    expect(generateUsername(uuidA)).toBe(generateUsername(uuidA));
  });

  it('produces different names for different uuids', () => {
    expect(generateUsername(uuidA)).not.toBe(generateUsername(uuidB));
  });

  it('is url-safe and contains no spaces', () => {
    const result = generateUsername(uuidA);
    expect(result).not.toContain(' ');
    expect(result).toMatch(/^[A-Za-z0-9-]+$/);
  });
});
