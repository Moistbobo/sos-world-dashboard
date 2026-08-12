import { describe, it, expect } from 'vitest';
import { getPlatformLabel } from './platformLabel';

describe('getPlatformLabel', () => {
  it('maps known platform values to readable labels', () => {
    expect(getPlatformLabel('standalonewindows')).toBe('Desktop');
    expect(getPlatformLabel('android')).toBe('Android');
    expect(getPlatformLabel('ios')).toBe('iOS');
    expect(getPlatformLabel('web')).toBe('web');
  });

  it('renders empty string as Unknown', () => {
    expect(getPlatformLabel('')).toBe('Unknown');
  });

  it('falls back to the raw value for unexpected inputs', () => {
    expect(getPlatformLabel('unknownplatform')).toBe('unknownplatform');
    expect(getPlatformLabel('2019.2.4-801-Release')).toBe('2019.2.4-801-Release');
  });

});
