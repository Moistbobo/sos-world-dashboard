import { describe, expect, it } from 'vitest';
import { generateUsername } from './username';

describe('generateUsername', () => {
  it('returns "Anonymous"', () => {
    expect(generateUsername()).toBe('Anonymous');
  });
});
