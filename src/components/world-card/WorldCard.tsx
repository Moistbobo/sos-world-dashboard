import { useState } from 'react';
import { Globe, Users, Calendar, ExternalLink, Star, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { World } from '../../types';
import { TagBadge } from '../tag-badge';
import { getPlatformLabel } from '../../utils/platformLabel';
import { ShareButton } from '../share-button';
import { WorldAddDate } from '../world-add-date';
import { useLists } from '../../contexts/ListsContext';
import { SaveToListDialog } from '../save-to-list-dialog/SaveToListDialog';

interface WorldCardProps {
  world: World;
  onTagClick?: (tag: string) => void;
  onPlatformClick?: (platform: string) => void;
  onSelect?: (worldId: string) => void;
  onRemove?: () => void;
}

export function WorldCard({ world, onTagClick, onPlatformClick, onSelect, onRemove }: WorldCardProps) {
  const { t } = useTranslation();
  const { isWorldInAnyList } = useLists();
  const [saveOpen, setSaveOpen] = useState(false);
  const isSaved = isWorldInAnyList(world.worldId);

  return (
    <div className="card group relative overflow-hidden flex flex-col transition hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer">
      {onSelect && (
        <button
          type="button"
          onClick={() => onSelect(world.worldId)}
          className="absolute inset-0 z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-xl"
          aria-label={`${t('common.details')} - ${world.name}`}
        />
      )}
      <div className="relative h-40 bg-slate-200 dark:bg-slate-800">
        {world.imageUrl ? (
          <img
            src={world.imageUrl}
            alt={world.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-600">
            <Globe className="h-10 w-10" />
          </div>
        )}
        <div className="absolute top-2 left-2 z-10 flex gap-1">
          {world.quality === 'good' && (
            <span className="rounded-md bg-green-500/80 px-2 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur-sm">
              {t('common.good')}
            </span>
          )}
          {world.quality === 'bad' && (
            <span className="rounded-md bg-red-500/80 px-2 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur-sm">
              {t('common.bad')}
            </span>
          )}
        </div>
        {!onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSaveOpen(true);
            }}
            className="absolute top-2 right-2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition hover:bg-white hover:text-indigo-600 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:text-indigo-300"
            aria-label={isSaved ? t('worldCard.savedToList') : t('worldCard.saveToList')}
            title={isSaved ? t('worldCard.savedToList') : t('worldCard.saveToList')}
          >
            <Star className={`h-4 w-4 ${isSaved ? 'fill-current text-indigo-500' : ''}`} />
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-2 right-2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm transition hover:bg-white hover:text-red-700 dark:bg-slate-800/90 dark:text-red-400 dark:hover:text-red-300"
            aria-label={t('lists.removeWorld')}
            title={t('lists.removeWorld')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 dark:text-white" title={world.name}>
          {world.name}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {t('common.byAuthor', { author: world.authorName || t('common.unknown') })}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            {world.capacity}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <WorldAddDate world={world} />
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {world.platforms.map((p) => {
            const label = getPlatformLabel(p);
            return onPlatformClick ? (
              <button
                key={p}
                type="button"
                onClick={() => onPlatformClick(p)}
                title={label}
                className="relative z-30 rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 transition hover:brightness-110 dark:bg-slate-700 dark:text-slate-200"
              >
                {label}
              </button>
            ) : (
              <span
                key={p}
                className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200"
              >
                {label}
              </span>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {world.tags.slice(0, 4).map((t) => (
            <TagBadge key={t} tag={t} onClick={onTagClick} className="relative z-30" />
          ))}
          {world.tags.length > 4 && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {t('common.more', { count: world.tags.length - 4 })}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 flex items-center justify-center gap-2">
          <a
            href={world.vrchatUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary gap-2 text-sm relative z-30"
          >
            <ExternalLink className="h-4 w-4" />
            {t('worldDetail.openInVRChat')}
          </a>
          <ShareButton world={world} iconOnly />
        </div>
      </div>
      <SaveToListDialog worldId={world.worldId} open={saveOpen} onOpenChange={setSaveOpen} />
    </div>
  );
}
