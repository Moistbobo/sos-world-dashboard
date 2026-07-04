import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUp, LayoutGrid, List, Search } from 'lucide-react';
import { useInfiniteWorlds, useTags, useWorlds, useMeta } from '../../hooks/useApi';
import { useWorldsPreferences } from '../../hooks/useWorldsPreferences';
import { FilterBar } from '../../components/filter-bar';
import { Pagination } from '../../components/pagination';
import { WorldCard } from '../../components/world-card';
import { TagBadge } from '../../components/tag-badge';
import { getPlatformLabel } from '../../utils/platformLabel';
import { MIN_CAPACITY, MAX_CAPACITY } from '../../components/capacity-range';

export function WorldsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { viewMode, setViewMode, scrollMode, setScrollMode } = useWorldsPreferences();

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
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(() =>
    searchParams.getAll('platform')
  );
  const [capacityRange, setCapacityRange] = useState(() => {
    const minRaw = searchParams.get('minCapacity');
    const maxRaw = searchParams.get('maxCapacity');
    const min = Number(minRaw);
    const max = Number(maxRaw);
    const nextMin = minRaw && !Number.isNaN(min) ? Math.max(MIN_CAPACITY, min) : MIN_CAPACITY;
    const nextMax = maxRaw && !Number.isNaN(max) ? Math.min(MAX_CAPACITY, max) : MAX_CAPACITY;
    return {
      min: Math.min(nextMin, nextMax),
      max: Math.max(nextMin, nextMax),
    };
  });
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { data: tagsData } = useTags();

  const { data: metaData } = useMeta();

  const qualityCounts = useMemo(
    () => [
      { quality: 'good' as const, count: metaData?.qualityGood ?? 0 },
      { quality: 'bad' as const, count: metaData?.qualityBad ?? 0 },
    ],
    [metaData]
  );

  const platformCounts = useMemo(
    () => [
      { platform: 'standalonewindows', count: metaData?.platformDesktop ?? 0 },
      { platform: 'android', count: metaData?.platformAndroid ?? 0 },
      { platform: 'ios', count: metaData?.platformiOS ?? 0 },
    ],
    [metaData]
  );

  const paginationQuery = useWorlds({
    limit,
    offset,
    tag: selectedTags,
    quality: selectedQuality,
    platform: selectedPlatforms,
    search: searchQuery,
    minCapacity: capacityRange.min,
    maxCapacity: capacityRange.max,
    enabled: scrollMode === 'pagination',
  });

  const infiniteQuery = useInfiniteWorlds({
    limit,
    tag: selectedTags,
    quality: selectedQuality,
    platform: selectedPlatforms,
    search: searchQuery,
    minCapacity: capacityRange.min,
    maxCapacity: capacityRange.max,
    enabled: scrollMode === 'infinite',
  });

  // Update URL when filters change
  const lastSearchRef = useRef('');
  useEffect(() => {
    const next = new URLSearchParams();
    if (selectedTags.length > 0) next.set('tag', selectedTags[0]);
    if (selectedQuality.length > 0) next.set('quality', selectedQuality[0]);
    if (capacityRange.min > MIN_CAPACITY) next.set('minCapacity', String(capacityRange.min));
    if (capacityRange.max < MAX_CAPACITY) next.set('maxCapacity', String(capacityRange.max));
    for (const p of selectedPlatforms) {
      next.append('platform', p);
    }
    const nextSearch = next.toString();
    if (nextSearch === lastSearchRef.current) return;
    lastSearchRef.current = nextSearch;
    setSearchParams(next, { replace: true });
  }, [selectedTags, selectedQuality, capacityRange, selectedPlatforms, setSearchParams]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset infinite query cache when switching back to infinite mode
  // ... existing logic can be restored if needed; not used here.

  // Back-to-top visibility
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const allInfiniteWorlds = useMemo(
    () => infiniteQuery.data?.pages.flatMap((page) => page.worlds) ?? [],
    [infiniteQuery.data]
  );

  const isPagination = scrollMode === 'pagination';
  const worlds = isPagination ? paginationQuery.data?.worlds ?? [] : allInfiniteWorlds;
  const isPending = isPagination ? paginationQuery.isPending : infiniteQuery.isPending;
  const isError = isPagination ? paginationQuery.isError : infiniteQuery.isError;
  const error = isPagination ? paginationQuery.error : infiniteQuery.error;
  const refetch = isPagination ? paginationQuery.refetch : infiniteQuery.refetch;
  const total = isPagination
    ? paginationQuery.data?.total ?? 0
    : infiniteQuery.data?.pages[0]?.total ?? 0;

  const handleToggleMode = () => {
    setScrollMode(scrollMode === 'infinite' ? 'pagination' : 'infinite');
    setOffset(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetToFirstPage = useCallback(() => {
    setOffset(0);
    if (scrollMode === 'infinite') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [scrollMode]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    resetToFirstPage();
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
    resetToFirstPage();
  };

  const handleToggleQuality = (quality: 'good' | 'bad') => {
    setSelectedQuality((prev) =>
      prev.includes(quality) ? prev.filter((q) => q !== quality) : [...prev, quality]
    );
    resetToFirstPage();
  };

  const handleTogglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
    resetToFirstPage();
  };

  const handleRemovePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => prev.filter((p) => p !== platform));
    resetToFirstPage();
  };

  const handleCapacityChange = (range: { min: number; max: number }) => {
    setCapacityRange(range);
    resetToFirstPage();
  };

  const handleClear = () => {
    setSelectedTags([]);
    setSelectedQuality([]);
    setSelectedPlatforms([]);
    setCapacityRange({ min: MIN_CAPACITY, max: MAX_CAPACITY });
    setSearchInput('');
    resetToFirstPage();
  };

  // Keep the tag filter state in sync with the URL ?tag= param.
  const previousUrlTagRef = useRef<string | null>(searchParams.get('tag'));
  useEffect(() => {
    const urlTag = searchParams.get('tag');
    if (urlTag === previousUrlTagRef.current) return;

    previousUrlTagRef.current = urlTag;
    const nextTags = urlTag ? [urlTag] : [];
    setSelectedTags((prev) => {
      if (prev.length === nextTags.length && prev[0] === nextTags[0]) {
        return prev;
      }
      return nextTags;
    });
    resetToFirstPage();
  }, [searchParams, resetToFirstPage]);

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
        availableTags={tagsData?.tags || []}
        qualityCounts={qualityCounts}
        platformCounts={platformCounts}
        capacityRange={capacityRange}
        onCapacityChange={handleCapacityChange}
        selectedPlatforms={selectedPlatforms}
        onTogglePlatform={handleTogglePlatform}
        onRemovePlatform={handleRemovePlatform}
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
        {!isPending && !isError && (
          <p className="hidden text-sm text-slate-600 dark:text-slate-400 sm:block">
            {t('worlds.numberOfResults', { count: total })}
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
              onSelect={(id) => navigate(`/worlds/${id}`)}
              onTagClick={(tag) => {
                if (!selectedTags.includes(tag)) {
                  setSelectedTags((prev) => [...prev, tag]);
                  resetToFirstPage();
                }
              }}
              onPlatformClick={(platform) => {
                if (!selectedPlatforms.includes(platform)) {
                  setSelectedPlatforms((prev) => [...prev, platform]);
                  resetToFirstPage();
                }
              }}
            />
          ))}
        </div>
      )}

      {!isPending && !isError && worlds.length > 0 && viewMode === 'list' && (
        <div className="space-y-3">
          {worlds.map((w) => (
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
                    <List className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{w.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {t('common.byAuthor', { author: w.authorName || t('common.unknown') })} · {w.capacity}{' '}
                  capacity · {w.platforms.map(getPlatformLabel).join(', ')}
                </p>
              </div>
              <div className="hidden flex-wrap gap-1 sm:flex">
                {w.tags.slice(0, 3).map((t) => (
                  <TagBadge key={t} tag={t} />
                ))}
                {w.tags.length > 3 && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">+{w.tags.length - 3}</span>
                )}
              </div>
              <div className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                {w.quality === 'good' ? '✅' : w.quality === 'bad' ? '❌' : '—'}
              </div>
            </button>
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
