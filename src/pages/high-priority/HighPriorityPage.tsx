import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, List, Search } from 'lucide-react';
import { BeatLoader } from 'react-spinners';
import { fetchWorlds } from '../../api/client';
import { useMe } from '../../hooks/useApi';
import { useApiQuery } from '../../hooks/useApiToasts';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useWorldsPreferences } from '../../hooks/useWorldsPreferences';
import { Pagination } from '../../components/pagination';
import { WorldCard } from '../../components/world-card';
import { WorldListRow } from '../../components/world-list-row';

const WORLDS_PER_PAGE = 28;

export function HighPriorityPage() {
  const { t } = useTranslation();
  usePageTitle(t('highPriority.title'));
  const navigate = useNavigate();
  const { viewMode, setViewMode } = useWorldsPreferences();
  const { data: me } = useMe();
  const canManage = me?.permissions.includes('worlds:write') ?? false;

  const [offset, setOffset] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setOffset(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isPending, isError, error } = useApiQuery({
    queryKey: ['worlds', 'high-priority', { limit: WORLDS_PER_PAGE, offset, search: searchQuery }],
    queryFn: () =>
      fetchWorlds({ highPriority: true, limit: WORLDS_PER_PAGE, offset, search: searchQuery }),
    enabled: canManage,
    suppressErrorToast: true,
  });

  const worlds = data?.worlds ?? [];
  const total = data?.total ?? 0;

  if (!canManage) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('highPriority.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('highPriority.subtitle')}
          </p>
        </div>
        <div
          role="status"
          className="card p-8 text-center text-sm text-slate-500 dark:text-slate-400"
        >
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            {t('highPriority.forbidden')}
          </p>
          <p>{t('highPriority.forbiddenHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {t('highPriority.title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('highPriority.subtitle')}
        </p>
      </div>

      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
        {t('worlds.resultsSection')}
      </h2>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('highPriority.searchPlaceholder')}
            aria-label={t('highPriority.searchLabel')}
            className="input w-full pl-9"
          />
        </div>
        {!isError && (
          <p role="status" className="hidden items-center gap-2 text-sm text-slate-600 dark:text-slate-400 sm:flex">
            {isPending ? (
              <BeatLoader size={6} color="currentColor" aria-label={t('worlds.loadingResultCount')} />
            ) : (
              <span>{t('highPriority.resultsCount', { count: total })}</span>
            )}
          </p>
        )}
        <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-100/50 p-1 dark:border-slate-700 dark:bg-slate-800/50">
          <button
            onClick={() => setViewMode('grid')}
            aria-label={t('worlds.gridView')}
            aria-pressed={viewMode === 'grid'}
            className={`flex h-11 w-11 items-center justify-center rounded-md transition ${
              viewMode === 'grid'
                ? 'bg-slate-300 text-slate-900 dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-label={t('worlds.listView')}
            aria-pressed={viewMode === 'list'}
            className={`flex h-11 w-11 items-center justify-center rounded-md transition ${
              viewMode === 'list'
                ? 'bg-slate-300 text-slate-900 dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isError && (
        <div
          role="status"
          className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
        >
          {t('highPriority.loadError', { message: error?.message })}
        </div>
      )}

      {isPending && (
        <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4' : 'space-y-3'}>
          {Array.from({ length: WORLDS_PER_PAGE }).map((_, i) => (
            <div key={i} className="card animate-pulse bg-slate-200 dark:bg-slate-800 h-64" />
          ))}
        </div>
      )}

      {!isPending && !isError && worlds.length === 0 && (
        <div
          role="status"
          className="card p-8 text-center text-sm text-slate-500 dark:text-slate-400"
        >
          {t('highPriority.empty')}
        </div>
      )}

      {!isPending && !isError && worlds.length > 0 && viewMode === 'grid' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {worlds.map((w) => (
            <WorldCard key={w.worldId} world={w} onSelect={(id) => navigate(`/worlds/${id}`)} />
          ))}
        </div>
      )}

      {!isPending && !isError && worlds.length > 0 && viewMode === 'list' && (
        <div className="space-y-3">
          {worlds.map((w) => (
            <WorldListRow key={w.worldId} world={w} onSelect={(id) => navigate(`/worlds/${id}`)} />
          ))}
        </div>
      )}

      {total > 0 && (
        <div className="flex justify-center pt-2">
          <Pagination
            offset={offset}
            limit={WORLDS_PER_PAGE}
            total={total}
            onChangeOffset={(o) => {
              setOffset(o);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </div>
  );
}
