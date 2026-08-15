import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInfiniteWorlds, useTags, useWorlds, useMeta } from './useApi';
import { MIN_CAPACITY, MAX_CAPACITY } from '../components/capacity-range';

type ScrollMode = 'infinite' | 'pagination';

/**
 * Owns the worlds page filter state, the filter toggle/remove/clear handlers,
 * URL <-> state synchronization, the debounced search input, and the
 * paginated + infinite worlds queries.
 *
 * Returns stable `onSelect` / `onTagClick` / `onPlatformClick` callbacks so that
 * memoized row components (WorldCard, WorldListRow) do not re-render when the
 * page re-renders on filter-state-only changes.
 */
export function useWorldsFilters(
  scrollMode: ScrollMode,
  options?: { suppressErrorToast?: boolean },
) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const suppressErrorToast = options?.suppressErrorToast;

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
  const [highPriority, setHighPriority] = useState<boolean>(
    () => searchParams.get('highPriority') === 'true',
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(() =>
    searchParams.getAll('platform')
  );
  const [dayRange, setDayRange] = useState<number | null>(() => {
    const raw = searchParams.get('dayRange');
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 && Number.isInteger(parsed) ? parsed : null;
  });
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
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') ?? '');

  const { data: tagsData } = useTags({ suppressErrorToast });
  const { data: metaData } = useMeta({ suppressErrorToast });

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

  const paginationQuery = useWorlds(
    {
      limit,
      offset,
      tag: selectedTags,
      quality: selectedQuality,
      highPriority,
      platform: selectedPlatforms,
      search: searchQuery,
      minCapacity: capacityRange.min,
      maxCapacity: capacityRange.max,
      dayRange: dayRange ?? undefined,
      enabled: scrollMode === 'pagination',
    },
    { suppressErrorToast },
  );

  const infiniteQuery = useInfiniteWorlds(
    {
      limit,
      tag: selectedTags,
      quality: selectedQuality,
      highPriority,
      platform: selectedPlatforms,
      search: searchQuery,
      minCapacity: capacityRange.min,
      maxCapacity: capacityRange.max,
      dayRange: dayRange ?? undefined,
      enabled: scrollMode === 'infinite',
    },
    { suppressErrorToast },
  );

  // Update URL when filters change
  const lastSearchRef = useRef(searchParams.toString());
  useEffect(() => {
    const next = new URLSearchParams();
    if (selectedTags.length > 0) next.set('tag', selectedTags[0]);
    if (selectedQuality.length > 0) next.set('quality', selectedQuality[0]);
    if (capacityRange.min > MIN_CAPACITY) next.set('minCapacity', String(capacityRange.min));
    if (capacityRange.max < MAX_CAPACITY) next.set('maxCapacity', String(capacityRange.max));
    for (const p of selectedPlatforms) {
      next.append('platform', p);
    }
    if (dayRange !== null) next.set('dayRange', String(dayRange));
    if (highPriority) next.set('highPriority', 'true');
    if (searchQuery) next.set('search', searchQuery);
    const nextSearch = next.toString();
    if (nextSearch === lastSearchRef.current) return;
    lastSearchRef.current = nextSearch;
    setSearchParams(next, { replace: true });
  }, [selectedTags, selectedQuality, highPriority, capacityRange, selectedPlatforms, dayRange, searchQuery, setSearchParams]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const resetToFirstPage = useCallback(() => {
    setOffset(0);
  }, []);

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

  const handleToggleHighPriority = () => {
    setHighPriority((prev) => !prev);
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

  const handleDayRangeChange = (next: number | null) => {
    setDayRange(next);
    resetToFirstPage();
  };

  const handleClear = () => {
    setSelectedTags([]);
    setSelectedQuality([]);
    setHighPriority(false);
    setSelectedPlatforms([]);
    setCapacityRange({ min: MIN_CAPACITY, max: MAX_CAPACITY });
    setDayRange(null);
    setSearchInput('');
    setSearchQuery('');
    resetToFirstPage();
  };

  const handleAuthorClick = useCallback((authorName: string) => {
    const trimmed = authorName.trim();
    setSearchInput(trimmed);
    setSearchQuery(trimmed);
    setOffset(0);
  }, []);

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

  // Keep the day range filter state in sync with the URL ?dayRange= param.
  const previousUrlDayRangeRef = useRef<string | null>(searchParams.get('dayRange'));
  useEffect(() => {
    const urlDayRange = searchParams.get('dayRange');
    if (urlDayRange === previousUrlDayRangeRef.current) return;

    previousUrlDayRangeRef.current = urlDayRange;
    const parsed = urlDayRange ? Number(urlDayRange) : null;
    const next =
      parsed !== null && Number.isFinite(parsed) && parsed > 0 && Number.isInteger(parsed)
        ? parsed
        : null;
    setDayRange((prev) => (prev === next ? prev : next));
    resetToFirstPage();
  }, [searchParams, resetToFirstPage]);

  // Keep the search input/query in sync with the URL ?search= param so
  // navigation from other pages (e.g. Dashboard -> /worlds?search=...) seeds
  // the search bar, and back/forward navigation updates it.
  const previousUrlSearchRef = useRef<string | null>(searchParams.get('search'));
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch === previousUrlSearchRef.current) return;

    previousUrlSearchRef.current = urlSearch;
    const next = urlSearch ?? '';
    setSearchInput((prev) => (prev === next ? prev : next));
    setSearchQuery((prev) => (prev === next ? prev : next));
    resetToFirstPage();
  }, [searchParams, resetToFirstPage]);

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

  // Stable callbacks for memoized row components.
  const onSelect = useCallback((id: string) => navigate(`/worlds/${id}`), [navigate]);
  const onTagClick = useCallback(
    (tag: string) => {
      setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
      resetToFirstPage();
    },
    [resetToFirstPage]
  );
  const onPlatformClick = useCallback(
    (platform: string) => {
      setSelectedPlatforms((prev) => (prev.includes(platform) ? prev : [...prev, platform]));
      resetToFirstPage();
    },
    [resetToFirstPage]
  );

  return {
    limit,
    offset,
    setOffset,
    selectedTags,
    handleToggleTag,
    handleRemoveTag,
    selectedQuality,
    handleToggleQuality,
    highPriority,
    handleToggleHighPriority,
    selectedPlatforms,
    handleTogglePlatform,
    handleRemovePlatform,
    capacityRange,
    handleCapacityChange,
    dayRange,
    handleDayRangeChange,
    searchInput,
    setSearchInput,
    searchQuery,
    handleAuthorClick,
    handleClear,
    availableTags: tagsData?.tags || [],
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
  };
}
