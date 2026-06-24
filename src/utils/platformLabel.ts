const PLATFORM_LABELS: Record<string, string> = {
  standalonewindows: 'Desktop',
  android: 'Android',
  ios: 'iOS',
  web: 'web',
};

/**
 * Map a raw platform value from the API to a readable display label.
 * - Empty string -> "Unknown"
 * - Known values -> fixed readable labels
 * - Everything else -> raw value (preserves info like Unity build strings)
 */
export function getPlatformLabel(platform: string): string {
  if (platform === '') {
    return 'Unknown';
  }
  return PLATFORM_LABELS[platform] ?? platform;
}
