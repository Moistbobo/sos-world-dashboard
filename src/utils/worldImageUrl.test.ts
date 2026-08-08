import { describe, it, expect } from 'vitest';
import { worldImageUrl } from './worldImageUrl';

describe('worldImageUrl', () => {
  it('builds a wsrv.nl URL with width and webp output', () => {
    const url = worldImageUrl('https://api.vrchat.cloud/api/1/file/file_abc/1/file', 320);
    expect(url).toBe(
      'https://wsrv.nl/?url=https%3A%2F%2Fapi.vrchat.cloud%2Fapi%2F1%2Ffile%2Ffile_abc%2F1%2Ffile&w=320&output=webp',
    );
  });

  it('uses the given width', () => {
    const url = worldImageUrl('https://example.com/image.png', 128);
    expect(url).toContain('w=128');
  });

  it('falls back to the original URL when input is empty', () => {
    expect(worldImageUrl('', 320)).toBe('');
    expect(worldImageUrl('   ', 320)).toBe('   ');
  });

  it('falls back to the original URL for non-http protocols', () => {
    expect(worldImageUrl('data:image/png;base64,abc', 320)).toBe('data:image/png;base64,abc');
    expect(worldImageUrl('ftp://example.com/x.png', 320)).toBe('ftp://example.com/x.png');
  });
});
