import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { ArrowLeft, Globe, Users, Calendar, ExternalLink, Hash, Star } from 'lucide-react';
import { useWorld } from '../../hooks/useApi';
import { TagBadge } from '../../components/tag-badge';
import { getPlatformLabel } from '../../utils/platformLabel';
import { getWorldAddDate } from '../../utils/worldAddDate';
import { ShareButton } from '../../components/share-button';
import { WorldAddDate } from '../../components/world-add-date';
import { useLists } from '../../contexts/ListsContext';
import { SaveToListDialog } from '../../components/save-to-list-dialog/SaveToListDialog';

export function WorldDetailPage({ worldId: worldIdProp }: { worldId?: string } = {}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { worldId: paramWorldId } = useParams<{ worldId: string }>();
  const worldId = worldIdProp ?? paramWorldId;
  const { isWorldInAnyList } = useLists();
  const [saveOpen, setSaveOpen] = useState(false);
  const { data, isPending, isError, error, isFetching } = useWorld(worldId);

  if (isPending && !data) {
    return (
      <div
        data-testid="world-detail-backdrop"
        className="-m-4 min-h-[calc(100vh-3.5rem)] cursor-pointer p-4 lg:-m-6 lg:p-6"
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            navigate(-1);
          }
        }}
      >
        <div className="mx-auto max-w-3xl space-y-5">
          <button
            type="button"
            disabled
            className="btn-ghost gap-1.5 text-sm opacity-50"
            aria-hidden="true"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </button>

          <div className="card overflow-hidden">
            <div className="relative h-56 animate-pulse bg-slate-200 sm:h-72 dark:bg-slate-800" />

            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="w-full max-w-md space-y-2">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="h-6 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>

              <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-200 pt-4 dark:border-slate-700/50">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Hash className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                  <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t('worldDetail.platforms')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-16 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t('worldDetail.tags')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError && !data) {
    return (
      <div
        data-testid="world-detail-backdrop"
        className="-m-4 min-h-[calc(100vh-3.5rem)] cursor-pointer p-4 lg:-m-6 lg:p-6"
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            navigate(-1);
          }
        }}
      >
        <div className="mx-auto max-w-3xl space-y-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-ghost gap-1.5 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </button>
          <div className="card p-8 text-center text-sm text-red-600 dark:text-red-300">
            {t('worldDetail.loadError', { message: error?.message || 'Not found' })}
          </div>
        </div>
      </div>
    );
  }

  const w = data;

  return (
    <div
      data-testid="world-detail-backdrop"
      className="-m-4 min-h-[calc(100vh-3.5rem)] cursor-pointer p-4 lg:-m-6 lg:p-6"
      onClick={(e) => {
        // Only navigate when the user clicks the empty background area, not the card.
        if (e.currentTarget === e.target) {
          navigate(-1);
        }
      }}
    >
      <div className="mx-auto max-w-3xl space-y-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-ghost gap-1.5 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>

        <div className="card overflow-hidden relative cursor-default">
          {isFetching && (
            <div
              data-testid="world-detail-loading-bar"
              className="absolute left-0 right-0 top-0 z-10 h-1 overflow-hidden bg-slate-200 dark:bg-slate-800"
            >
              <div className="h-full w-1/3 animate-[shimmer_1.5s_infinite] bg-indigo-500" />
            </div>
          )}
          {isError && (
            <div className="border-b border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-300">
              {t('worldDetail.refreshError', { message: error?.message })}
            </div>
          )}
          <div className="relative h-56 bg-slate-200 sm:h-72 dark:bg-slate-800">
            {w.imageUrl ? (
              <img
                src={w.imageUrl}
                alt={w.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-600">
                <Globe className="h-16 w-16" />
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">{w.name}</h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {t('worldDetail.byAuthor', { author: w.authorName || t('worldDetail.unknownAuthor') })}
                </p>
              </div>
              <div className="shrink-0">
                {w.quality === 'good' && (
                  <span className="rounded-lg bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400 ring-1 ring-green-500/30">
                    {t('worldDetail.qualityGood')}
                  </span>
                )}
                {w.quality === 'bad' && (
                  <span className="rounded-lg bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400 ring-1 ring-red-500/30">
                    {t('worldDetail.qualityBad')}
                  </span>
                )}
                {w.quality == null && (
                  <span className="rounded-lg bg-slate-200/40 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-300 dark:bg-slate-700/40 dark:text-slate-400 dark:ring-slate-600/30">
                    {t('worldDetail.noQuality')}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-200 pt-4 text-sm text-slate-700 dark:border-slate-700/50 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                {t('worldDetail.capacity', { capacity: w.capacity })}
              </div>
              <div className="flex items-center gap-1.5">
                <Hash className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                {t('worldDetail.id', { id: w.worldId })}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Trans
                  i18nKey={w.internalAddDate ? 'worldDetail.tagged' : 'worldDetail.added'}
                  values={{ date: new Date(getWorldAddDate(w)).toLocaleString() }}
                  components={{ date: <WorldAddDate world={w} variant="datetime" /> }}
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('worldDetail.platforms')}</p>
              <div className="flex flex-wrap gap-2">
                {w.platforms.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => navigate(`/worlds?platform=${encodeURIComponent(p)}`)}
                    className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 transition hover:brightness-110 dark:bg-slate-700 dark:text-slate-200"
                  >
                    {getPlatformLabel(p)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('worldDetail.tags')}</p>
              <div className="flex flex-wrap gap-2">
                {w.tags.map((t) => (
                  <TagBadge
                    key={t}
                    tag={t}
                    onClick={(tag) => navigate(`/worlds?tag=${encodeURIComponent(tag)}`)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={w.vrchatUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary gap-2 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                {t('worldDetail.openInVRChat')}
              </a>
              <ShareButton world={w} />
              <button
                type="button"
                onClick={() => setSaveOpen(true)}
                className={`btn-secondary gap-2 text-sm ${isWorldInAnyList(w.worldId) ? 'text-indigo-600 dark:text-indigo-300' : ''}`}
              >
                <Star className={`h-4 w-4 ${isWorldInAnyList(w.worldId) ? 'fill-current' : ''}`} />
                {isWorldInAnyList(w.worldId) ? t('worldDetail.savedToList') : t('worldDetail.saveToList')}
              </button>
              <SaveToListDialog worldId={w.worldId} open={saveOpen} onOpenChange={setSaveOpen} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
