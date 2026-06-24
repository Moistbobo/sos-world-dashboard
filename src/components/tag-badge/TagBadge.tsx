import { useMemo } from 'react';
import { getTagMeta } from '../../utils/tagTypes';
import { getEmojiForTag } from '../../utils/tagEmoji';

interface TagBadgeProps {
  tag: string;
  onClick?: (tag: string) => void;
  active?: boolean;
  className?: string;
  /** Show only the emoji when space is tight */
  emojiOnly?: boolean;
}

function getColorForTag(tag: string): string {
  return (
    getTagMeta(tag)?.tailwindClass ??
    'bg-slate-200/40 text-slate-700 border-slate-300 dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-600/30'
  );
}

export function TagBadge({
  tag,
  onClick,
  active,
  className = '',
  emojiOnly = false,
}: TagBadgeProps) {
  const colorClass = useMemo(() => getColorForTag(tag), [tag]);
  const emoji = useMemo(() => getEmojiForTag(tag), [tag]);

  return (
    <button
      type="button"
      onClick={onClick ? () => onClick(tag) : undefined}
      title={tag}
      className={`
        inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition
        ${active ? 'ring-1 ring-offset-0 ring-indigo-500' : ''}
        ${onClick ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}
        ${colorClass}
        ${className}
      `}
    >
      <span className="mr-1 leading-none">{emoji}</span>
      {!emojiOnly && <span className="max-w-[8rem] truncate">{tag}</span>}
    </button>
  );
}
