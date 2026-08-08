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

  it('encodes query strings already present in the original URL', () => {
    const url = worldImageUrl('https://example.com/image.png?token=abc&x=1', 320);
    expect(url).toBe(
      'https://wsrv.nl/?url=https%3A%2F%2Fexample.com%2Fimage.png%3Ftoken%3Dabc%26x%3D1&w=320&output=webp',
    );
  });

  it('normalizes protocol-relative URLs to https through the proxy', () => {
    const url = worldImageUrl('//api.vrchat.cloud/image.png', 320);
    expect(url).toBe(
      'https://wsrv.nl/?url=https%3A%2F%2Fapi.vrchat.cloud%2Fimage.png&w=320&output=webp',
    );
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
