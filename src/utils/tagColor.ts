/**
 * Returns a hex color for a tag, matching the semantic palette
 * defined in the single source of truth.
 */
import { getTagMeta } from './tagTypes';

export function getTagColorHex(tag: string): string {
  return getTagMeta(tag)?.hexColor ?? '#94a3b8';
}
