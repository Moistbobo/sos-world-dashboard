/**
 * Returns an emoji representing a VRChat world tag.
 * Falls back to ❓ for unknown tags.
 */
import { getTagMeta } from './tagTypes';

export function getEmojiForTag(tag: string): string {
  return getTagMeta(tag)?.emoji ?? '❓';
}
