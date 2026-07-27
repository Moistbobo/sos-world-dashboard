import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp, LayoutGrid, List, Search } from 'lucide-react';
import { BeatLoader } from 'react-spinners';
import { useWorldsPreferences } from '../../hooks/useWorldsPreferences';
import { useWorldsFilters } from '../../hooks/useWorldsFilters';
import { FilterBar } from '../../components/filter-bar';
import { Pagination } from '../../components/pagination';
import { WorldCard } from '../../components/world-card';
import { WorldListRow } from '../../components/world-list-row';

export function WorldsPage() {
  const { t } = useTranslation();
  const { viewMode, setViewMode, scrollMode, setScrollMode } = useWorldsPreferences();

  const {
    limit,
    offset,
    setOffset,
    selectedTags,
    handleToggleTag,
    handleRemoveTag,
    selectedQuality,
    handleToggleQuality,
    selectedPlatforms,
    handleTogglePlatform,
    handleRemovePlatform,
    capacityRange,
    handleCapacityChange,
    dayRange,
    handleDayRangeChange,
    searchInput,
    setSearchInput,
    handleClear,
    availableTags,
    qualityCounts,
    platformCounts,
    worlds,
    isPending,
    isError,
    error,
    refetch,
    total,
    infiniteQuery,
    isPagination,
    onSelect,
    onTagClick,
    onPlatformClick,
  } = useWorldsFilters(scrollMode);

  const [showBackToTop, setShowBackToTop] = useState(false);

  // Back-to-top visibility
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleToggleMode = () => {
    setScrollMode(scrollMode === 'infinite' ? 'pagination' : 'infinite');
    setOffset(0);
  };

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPagination || !sentinelRef.current) return;
    if (!infiniteQuery.hasNextPage || infiniteQuery.isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          infiniteQuery.fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isPagination, infiniteQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('worlds.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('worlds.subtitle')}</p>
        </div>
        <button
          onClick={handleToggleMode}
          className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-xs"
        >
          {scrollMode === 'infinite' ? t('worlds.switchToPagination') : t('worlds.switchToInfinite')}
        </button>
      </div>

      <FilterBar
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
        onRemoveTag={handleRemoveTag}
        selectedQuality={selectedQuality}
        onToggleQuality={handleToggleQuality}
        onClear={handleClear}
        availableTags={availableTags}
        qualityCounts={qualityCounts}
        platformCounts={platformCounts}
        capacityRange={capacityRange}
        onCapacityChange={handleCapacityChange}
        selectedPlatforms={selectedPlatforms}
        onTogglePlatform={handleTogglePlatform}
        onRemovePlatform={handleRemovePlatform}
        dayRange={dayRange}
        onDayRangeChange={handleDayRangeChange}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('worlds.searchPlaceholder')}
            className="input w-full pl-9"
          />
        </div>
        {!isError && (
          <p className="hidden items-center gap-2 text-sm text-slate-600 dark:text-slate-400 sm:flex">
            <span>{t('worlds.numberOfResultsLabel')}</span>
            {isPending ? (
              <BeatLoader size={6} color="currentColor" aria-label={t('worlds.loadingResultCount')} />
            ) : (
              <span>{t('worlds.numberOfResultsCount', { count: total })}</span>
            )}
          </p>
        )}
        <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-100/50 p-0.5 dark:border-slate-700 dark:bg-slate-800/50">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-1.5 transition ${
              viewMode === 'grid'
                ? 'bg-slate-300 text-slate-900 dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-md p-1.5 transition ${
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
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
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

      {!isPending && !isError && worlds.length === 0 && (
        <div className="card p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {t('worlds.noWorlds')}{' '}
          <button onClick={() => refetch()} className="text-indigo-600 underline dark:text-indigo-400">
            {t('worlds.tryAgain')}
          </button>
          .
        </div>
      )}

      {!isPending && !isError && worlds.length > 0 && viewMode === 'grid' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {worlds.map((w) => (
            <WorldCard
              key={w.worldId}
              world={w}
              onSelect={onSelect}
              onTagClick={onTagClick}
              onPlatformClick={onPlatformClick}
            />
          ))}
        </div>
      )}

      {!isPending && !isError && worlds.length > 0 && viewMode === 'list' && (
        <div className="space-y-3">
          {worlds.map((w) => (
            <WorldListRow key={w.worldId} world={w} onSelect={onSelect} />
          ))}
        </div>
      )}

      {scrollMode === 'infinite' && !isError && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {infiniteQuery.isFetchingNextPage && (
            <span className="text-sm text-slate-500 dark:text-slate-400">{t('worlds.loadingMore')}</span>
          )}
        </div>
      )}

      {scrollMode === 'pagination' && total > 0 && (
        <div className="flex justify-center pt-2">
          <Pagination
            offset={offset}
            limit={limit}
            total={total}
            onChangeOffset={(o) => {
              setOffset(o);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {showBackToTop && scrollMode === 'infinite' && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          aria-label={t('worlds.backToTop')}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}