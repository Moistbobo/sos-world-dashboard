const WSRV_BASE = 'https://wsrv.nl/';

/**
 * Rewrites a world image URL through the wsrv.nl image proxy so the browser
 * downloads a resized WebP instead of the full-size original. Falls back to
 * the original URL when the input is empty or not an http(s) URL.
 */
export function createWSRVUrl(imageUrl: string, width: number, quality: number = 80): string {
  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return imageUrl;
  }
  // Protocol-relative URLs are valid in the browser; the proxy needs an absolute https URL.
  const absolute = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
  if (!/^https?:\/\//i.test(absolute)) {
    return imageUrl;
  }
  const params = new URLSearchParams({ url: absolute, w: String(width), output: 'webp', q: `${quality}` });
  return `${WSRV_BASE}?${params.toString()}`;
}
