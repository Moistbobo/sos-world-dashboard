export const API_TOKEN_STORAGE_KEY = 'sos-api-token';

export function getStoredApiToken(): string {
  const saved = window.localStorage.getItem(API_TOKEN_STORAGE_KEY);
  return saved?.trim() ?? '';
}

export function setStoredApiToken(token: string): void {
  const trimmed = token.trim();
  if (trimmed) {
    window.localStorage.setItem(API_TOKEN_STORAGE_KEY, trimmed);
  } else {
    window.localStorage.removeItem(API_TOKEN_STORAGE_KEY);
  }
}

export function clearStoredApiToken(): void {
  window.localStorage.removeItem(API_TOKEN_STORAGE_KEY);
}
