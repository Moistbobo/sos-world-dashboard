import { memo } from 'react';
import { List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { World } from '../../types';
import { TagBadge } from '../tag-badge';
import { getPlatformLabel } from '../../utils/platformLabel';

interface WorldListRowProps {
  world: World;
  onSelect: (worldId: string) => void;
}

export const WorldListRow = memo(function WorldListRow({ world, onSelect }: WorldListRowProps) {
  const { t } = useTranslation();

  return (
    <button
      onClick={() => onSelect(world.worldId)}
      className="card flex w-full items-center gap-4 p-3 text-left transition hover:border-slate-400 dark:hover:border-slate-600"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
        {world.imageUrl ? (
          <img src={world.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-600">
            <List className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{world.name}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {t('common.byAuthor', { author: world.authorName || t('common.unknown') })} · {world.capacity}{' '}
          capacity · {world.platforms.map(getPlatformLabel).join(', ')}
        </p>
      </div>
      <div className="hidden flex-wrap gap-1 sm:flex">
        {world.tags.slice(0, 3).map((t) => (
          <TagBadge key={t} tag={t} />
        ))}
        {world.tags.length > 3 && (
          <span className="text-xs text-slate-400 dark:text-slate-500">+{world.tags.length - 3}</span>
        )}
      </div>
      <div className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
        {world.quality === 'good' ? '✅' : world.quality === 'bad' ? '❌' : '—'}
      </div>
    </button>
  );
});