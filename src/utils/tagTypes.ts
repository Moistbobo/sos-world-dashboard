/**
 * Single source of truth for tag metadata: emoji, color, and badge styling.
 */
export interface TagMeta {
  emoji: string;
  hexColor: string;

}

const tagRegistry: Record<string, TagMeta> = {
  // Dashboard main tags
  kino:       { emoji: '⛰️',  hexColor: '#8b5cf6' },
  chill:      { emoji: '😎',  hexColor: '#06b6d4' },
  comfy:      { emoji: '🛏️',  hexColor: '#d946ef' },
  adventure:  { emoji: '🗺️',  hexColor: '#f59e0b' },
  horror:     { emoji: '👻',  hexColor: '#c084fc' },
  game:       { emoji: '🎮',  hexColor: '#fb923c' },
  gallery:    { emoji: '🖼️',  hexColor: '#6366f1' },
  meme:       { emoji: '😂',  hexColor: '#facc15' },
  puzzle:     { emoji: '🧩',  hexColor: '#14b8a6' },
  driving:    { emoji: '🚗',  hexColor: '#ef4444' },
  tech:       { emoji: '💻',  hexColor: '#3b82f6' },
  nature:     { emoji: '🌿',  hexColor: '#84cc16' },
  gamerip:    { emoji: '🎬',  hexColor: '#a855f7' },
  portal:     { emoji: '🌀',  hexColor: '#06b6d4' },
  liminal:    { emoji: '🌫️',  hexColor: '#94a3b8' },

  // Existing app tags
  quest:      { emoji: '🥽',  hexColor: '#34d399' },
  pc:         { emoji: '💻',  hexColor: '#22d3ee' },
  good:       { emoji: '👍',  hexColor: '#4ade80' },
  bad:        { emoji: '👎',  hexColor: '#f87171' },
  nsfw:       { emoji: '🔞',  hexColor: '#fb7185' },
  relaxing:   { emoji: '🧘',  hexColor: '#38bdf8' },
  social:     { emoji: '💬',  hexColor: '#fbbf24' },
  music:      { emoji: '🎵',  hexColor: '#ec4899' },
  avatar:     { emoji: '👤',  hexColor: '#2dd4bf' },
};

/** Look up metadata for a tag (case-insensitive, supports substring match). */
export function getTagMeta(tag: string): TagMeta | undefined {
  const lower = tag.trim().toLowerCase();

  // Exact match
  if (tagRegistry[lower]) return tagRegistry[lower];

  // Special multi-word / variant tags
  if (lower === 'particle live' || lower.includes('vrmv')) {
    return {
      emoji: '🎭',
      hexColor: '#f43f5e',
    };
  }

  // Substring fallback for all other registered tags
  for (const [key, meta] of Object.entries(tagRegistry)) {
    if (lower.includes(key)) return meta;
  }

  return undefined;
}
