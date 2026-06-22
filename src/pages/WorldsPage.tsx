import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, Search } from 'lucide-react';
import { useTags, useWorlds } from '../hooks/useApi';
import { FilterBar } from '../components/FilterBar';
import { Pagination } from '../components/Pagination';
import { WorldCard } from '../components/WorldCard';
import { TagBadge } from '../components/TagBadge';

export function WorldsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tag = searchParams.get('tag');
    return tag ? [tag] : [];
  });
  const [selectedQuality, setSelectedQuality] = useState<('good' | 'bad')[]>(() => {
    const quality = searchParams.get('quality');
    return quality === 'good' || quality === 'bad' ? [quality] : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: tagsData } = useTags();
  const { data, isPending, isError, error, refetch } = useWorlds({
    limit,
    offset,
    tag: selectedTags,
    quality: selectedQuality,
  });

  // Update URL when filters change
  useEffect(() => {
    const next = new URLSearchParams();
    if (selectedTags.length > 0) next.set('tag', selectedTags[0]);
    if (selectedQuality.length > 0) next.set('quality', selectedQuality[0]);
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [selectedTags, selectedQuality, setSearchParams, searchParams]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setOffset(0);
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
    setOffset(0);
  };

  const handleToggleQuality = (quality: 'good' | 'bad') => {
    setSelectedQuality((prev) =>
      prev.includes(quality) ? prev.filter((q) => q !== quality) : [...prev, quality]
    );
    setOffset(0);
  };

  const handleClear = () => {
    setSelectedTags([]);
    setSelectedQuality([]);
    setOffset(0);
  };

  const filteredWorlds = useMemo(() => {
    if (!data?.worlds) return [];
    if (!searchQuery.trim()) return data.worlds;
    const q = searchQuery.toLowerCase();
    return data.worlds.filter(
      (w) =>
        w.name?.toLowerCase().includes(q) ||
        w.authorName?.toLowerCase().includes(q) ||
        w.worldId.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('worlds.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('worlds.subtitle')}</p>
        </div>
      </div>

      <FilterBar
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
        onRemoveTag={handleRemoveTag}
        selectedQuality={selectedQuality}
        onToggleQuality={handleToggleQuality}
        onClear={handleClear}
        availableTags={tagsData?.tags || []}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('worlds.searchPlaceholder')}
            className="input w-full pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-100/50 p-0.5 dark:border-slate-700 dark:bg-slate-800/50">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-1.5 transition ${
              viewMode === 'grid' ? 'bg-slate-300 text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-md p-1.5 transition ${
              viewMode === 'list' ? 'bg-slate-300 text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
          {t('worlds.loadError', { message: error?.message })}
        </div>
      )}

      {isPending && (
        <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4' : 'space-y-3'}>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="card animate-pulse bg-slate-200 dark:bg-slate-800 h-64" />
          ))}
        </div>
      )}

      {!isPending && !isError && filteredWorlds.length === 0 && (
        <div className="card p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {t('worlds.noWorlds')}{' '}
          <button onClick={() => refetch()} className="text-indigo-600 underline dark:text-indigo-400">
            {t('worlds.tryAgain')}
          </button>.
        </div>
      )}

      {!isPending && !isError && filteredWorlds.length > 0 && viewMode === 'grid' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredWorlds.map((w) => (
            <WorldCard
              key={w.worldId}
              world={w}
              onSelect={(id) => navigate(`/worlds/${id}`)}
              onTagClick={(tag) => {
                if (!selectedTags.includes(tag)) {
                  setSelectedTags((prev) => [...prev, tag]);
                  setOffset(0);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            />
          ))}
        </div>
      )}

      {!isPending && !isError && filteredWorlds.length > 0 && viewMode === 'list' && (
        <div className="space-y-3">
          {filteredWorlds.map((w) => (
            <button
              key={w.worldId}
              onClick={() => navigate(`/worlds/${w.worldId}`)}
              className="card flex w-full items-center gap-4 p-3 text-left transition hover:border-slate-400 dark:hover:border-slate-600"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
                {w.imageUrl ? (
                  <img src={w.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-600">
                    ...
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{w.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {t('common.byAuthor', { author: w.authorName || t('common.unknown') })} · {w.capacity} capacity · {w.platforms.join(', ')}
                </p>
              </div>
              <div className="hidden flex-wrap gap-1 sm:flex">
                {w.tags.slice(0, 3).map((t) => (
                  <TagBadge key={t} tag={t} />
                ))}
                {w.tags.length > 3 && <span className="text-xs text-slate-400 dark:text-slate-500">+{w.tags.length - 3}</span>}
              </div>
              <div className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                {w.quality === 'good' ? '✅' : w.quality === 'bad' ? '❌' : '—'}
              </div>
            </button>
          ))}
        </div>
      )}

      {data && (
        <div className="flex justify-center pt-2">
          <Pagination
            offset={offset}
            limit={limit}
            total={data.total}
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
