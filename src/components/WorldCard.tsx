import { Globe, Users, Calendar, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { World } from '../types';
import { TagBadge } from './TagBadge';

interface WorldCardProps {
  world: World;
  onTagClick?: (tag: string) => void;
  onSelect?: (worldId: string) => void;
}

export function WorldCard({ world, onTagClick, onSelect }: WorldCardProps) {
  const { t } = useTranslation();

  return (
    <div className="card overflow-hidden flex flex-col transition hover:border-slate-400 dark:hover:border-slate-600">
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
        <div className="absolute top-2 right-2 flex gap-1">
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
            {new Date(world.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {world.tags.slice(0, 4).map((t) => (
            <TagBadge key={t} tag={t} onClick={onTagClick} />
          ))}
          {world.tags.length > 4 && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {t('common.more', { count: world.tags.length - 4 })}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 flex items-center gap-2">
          {onSelect && (
            <button
              onClick={() => onSelect(world.worldId)}
              className="btn-primary flex-1 text-xs py-1.5"
            >
              {t('common.details')}
            </button>
          )}
          <a
            href={world.vrchatUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary px-2 py-1.5 text-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
