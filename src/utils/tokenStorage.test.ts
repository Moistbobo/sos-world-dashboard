import { describe, it, expect, beforeEach } from 'vitest';
import {
  API_TOKEN_STORAGE_KEY,
  clearStoredApiToken,
  getStoredApiToken,
  setStoredApiToken,
} from './tokenStorage';

describe('tokenStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns an empty string when nothing is stored', () => {
    expect(getStoredApiToken()).toBe('');
  });

  it('round-trips a stored token', () => {
    setStoredApiToken('abc123');
    expect(window.localStorage.getItem(API_TOKEN_STORAGE_KEY)).toBe('abc123');
    expect(getStoredApiToken()).toBe('abc123');
  });

  it('trims the token on write and read', () => {
    setStoredApiToken('  abc123  ');
    expect(window.localStorage.getItem(API_TOKEN_STORAGE_KEY)).toBe('abc123');
    expect(getStoredApiToken()).toBe('abc123');
  });

  it('removes the key when set to an empty or whitespace value', () => {
    setStoredApiToken('');
    expect(window.localStorage.getItem(API_TOKEN_STORAGE_KEY)).toBeNull();

    setStoredApiToken('   ');
    expect(window.localStorage.getItem(API_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('clears the stored token', () => {
    setStoredApiToken('abc123');
    clearStoredApiToken();
    expect(window.localStorage.getItem(API_TOKEN_STORAGE_KEY)).toBeNull();
    expect(getStoredApiToken()).toBe('');
  });
});
