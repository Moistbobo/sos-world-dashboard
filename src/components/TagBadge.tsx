import { useMemo } from 'react';

interface TagBadgeProps {
  tag: string;
  onClick?: (tag: string) => void;
  active?: boolean;
  className?: string;
}

const tagColors = new Map<string, string>([
  ['quest', 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'],
  ['pc', 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'],
  ['good', 'bg-green-500/15 text-green-400 border-green-500/30'],
  ['bad', 'bg-red-500/15 text-red-400 border-red-500/30'],
  ['nsfw', 'bg-rose-500/15 text-rose-400 border-rose-500/30'],
  ['horror', 'bg-purple-500/15 text-purple-400 border-purple-500/30'],
  ['relaxing', 'bg-sky-500/15 text-sky-400 border-sky-500/30'],
  ['social', 'bg-amber-500/15 text-amber-400 border-amber-500/30'],
  ['game', 'bg-orange-500/15 text-orange-400 border-orange-500/30'],
  ['music', 'bg-pink-500/15 text-pink-400 border-pink-500/30'],
  ['meme', 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'],
  ['avatar', 'bg-teal-500/15 text-teal-400 border-teal-500/30'],
]);

function getColorForTag(tag: string): string {
  const lower = tag.toLowerCase();
  for (const [key, color] of tagColors) {
    if (lower.includes(key)) return color;
  }
  return 'bg-slate-700/40 text-slate-300 border-slate-600/30';
}

export function TagBadge({ tag, onClick, active, className = '' }: TagBadgeProps) {
  const colorClass = useMemo(() => getColorForTag(tag), [tag]);
  return (
    <button
      type="button"
      onClick={onClick ? () => onClick(tag) : undefined}
      className={`
        inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition
        ${active ? 'ring-1 ring-offset-0 ring-indigo-500' : ''}
        ${onClick ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}
        ${colorClass}
        ${className}
      `}
    >
      {tag}
    </button>
  );
}
