const WSRV_BASE = 'https://wsrv.nl/';

/**
 * Rewrites a world image URL through the wsrv.nl image proxy so the browser
 * downloads a resized WebP instead of the full-size original. Falls back to
 * the original URL when the input is empty or not an http(s) URL.
 */
export function worldImageUrl(imageUrl: string, width: number): string {
  const trimmed = imageUrl.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
    return imageUrl;
  }
  const params = new URLSearchParams({ url: trimmed, w: String(width), output: 'webp' });
  return `${WSRV_BASE}?${params.toString()}`;
}
