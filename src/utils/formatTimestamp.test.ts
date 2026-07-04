import { describe, expect, it } from 'vitest';
import { formatTimestamp } from './formatTimestamp';

describe('formatTimestamp', () => {
  it('formats an ISO date as MM/DD/YY(ddd)HH:mm:ss', () => {
    const result = formatTimestamp('2024-01-15T09:05:03Z');
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{2}\([A-Za-z]{3}\)\d{2}:\d{2}:\d{2}$/);
  });

  it('zero-pads single-digit values', () => {
    // Construct a local date so component values are deterministic.
    const localDate = new Date(2024, 2, 5, 4, 3, 2);
    const result = formatTimestamp(localDate.toISOString());
    expect(result).toContain('03/05/24');
    expect(result).toContain('04:03:02');
  });

  it('uses a two-digit year', () => {
    const localDate = new Date(2024, 11, 31, 23, 59, 59);
    const result = formatTimestamp(localDate.toISOString());
    expect(result).toContain('/24(');
  });
});
