const PLATFORM_LABELS: Record<string, string> = {
  standalonewindows: 'Desktop',
  android: 'Android',
  ios: 'iOS',
  web: 'web',
};

/**
 * Common raw platform values to surface in the /worlds filter list.
 * The empty string represents worlds with no platform data and is
 * rendered as "Unknown" by getPlatformLabel.
 */
export const COMMON_PLATFORM_VALUES = [
  'standalonewindows',
  'android',
  'ios',
  'web',
  'unknownplatform',
  '',
];

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
