import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp, LayoutGrid, List, Search } from 'lucide-react';
import { BeatLoader } from 'react-spinners';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useWorldsPreferences } from '../../hooks/useWorldsPreferences';
import { useMe } from '../../hooks/useApi';
import { getStoredApiToken } from '../../utils/tokenStorage';
import { useWorldsFilters } from '../../hooks/useWorldsFilters';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useRatingsForWorldIds } from '../../hooks/useSentiment';
import { FilterBar } from '../../components/filter-bar';
import { Pagination } from '../../components/pagination';
import { WorldCard } from '../../components/world-card';
import { WorldListRow } from '../../components/world-list-row';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

const SENTIMENT_ENABLED = import.meta.env.VITE_ENABLE_COMMUNITY_SENTIMENT === 'true';

const GRID_GAP = 16;
const LIST_GAP = 12;
const GRID_ROW_ESTIMATE = 420;
const GRID_ROW_ESTIMATE_DESKTOP = 380;
const LIST_ROW_ESTIMATE = 88;
// Number of virtualized rows from the end of the loaded data at which to
// start prefetching the next page. The IntersectionObserver sentinel
// (200px rootMargin) still runs as a safety net; this trigger fires earlier
// so the fetch usually completes before the user reaches the end of the list.
const PREFETCH_AHEAD_ROWS = 4;

function getColumnCount(windowWidth: number) {
  return windowWidth >= 1280 ? 4 : windowWidth >= 640 ? 2 : 1;
}

function getGridRowHeight(columnCount: number) {
  // Desktop cards fit two rows of content; the mobile card layout is taller.
  return columnCount === 4 ? GRID_ROW_ESTIMATE_DESKTOP : GRID_ROW_ESTIMATE;
}

export function WorldsPage() {
  const { t } = useTranslation();
  usePageTitle(t('worlds.title'));
  const { viewMode, setViewMode, scrollMode, setScrollMode } = useWorldsPreferences();

  const { data: me, isError: meError } = useMe();
  const hasEnteredToken = Boolean(getStoredApiToken());
  const canManageCurator =
    hasEnteredToken && !meError && (me?.permissions.includes('worlds:write') ?? false);

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
    highPriority,
    handleToggleHighPriority,
    searchInput,
    setSearchInput,
    handleAuthorClick,
    handleClear,
    availableTags,
    qualityCounts,
    highPriorityCount,
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
  } = useWorldsFilters(scrollMode, { suppressErrorToast: true });

  const visibleWorldIds = useMemo(() => worlds.map((w) => w.worldId), [worlds]);
  const { data: ratingSummaries } = useRatingsForWorldIds(
    SENTIMENT_ENABLED ? visibleWorldIds : [],
  );

  const [showBackToTop, setShowBackToTop] = useState(false);

  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window === 'undefined' ? 0 : window.innerWidth
  );
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Back-to-top visibility
  useEffect(() => {
    let frame: number | null = null;
    const onScroll = () => {
      if (frame !== null) return;
      setShowBackToTop(window.scrollY > window.innerHeight);
      frame = requestAnimationFrame(() => {
        frame = null;
      });
    };
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  const handleToggleMode = () => {
    setScrollMode(scrollMode === 'infinite' ? 'pagination' : 'infinite');
    setOffset(0);
  };

  const sentinelRef = useRef<HTMLDivElement>(null);

  const [scrollMargin, setScrollMargin] = useState(0);

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

  // Measure the page chrome above the grid/list (header, filters, search bar,
  // results row, view toggle) so virtual items align with the real scroll
  // offset. A layout pass on `worlds`/`viewMode`/`scrollMode` keeps the cached
  // value fresh; it is stable between passes so the state update is skipped.
  const gridRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const gridSizeRef = useRef(0);
  const listSizeRef = useRef(0);
  useEffect(() => {
    if (isPending || worlds.length === 0) return;
    const node = viewMode === 'grid' ? gridRef.current : listRef.current;
    if (!node) return;
    const prev = viewMode === 'grid' ? gridSizeRef.current : listSizeRef.current;
    const next = Math.max(node.offsetTop, prev);
    if (viewMode === 'grid') {
      gridSizeRef.current = next;
    } else {
      listSizeRef.current = next;
    }
    const nextMargin = Math.max(gridSizeRef.current, listSizeRef.current);
    if (nextMargin !== scrollMargin) {
      setScrollMargin(nextMargin);
    }
  }, [worlds, isPending, viewMode, scrollMode, scrollMargin]);

  const columnCount = getColumnCount(windowWidth);
  const gridVirtualizer = useWindowVirtualizer({
    count: Math.ceil(worlds.length / columnCount),
    getScrollElement: () => window,
    estimateSize: () => getGridRowHeight(columnCount),
    measureElement: (el) => (el as HTMLElement).offsetHeight || getGridRowHeight(columnCount),
    // This page owns scroll position (filters/mode changes must not touch the
    // window scroll), so the virtualizer only reads the scroll offset and
    // never writes it. scrollToIndex/scrollToEnd are unused here.
    scrollToFn: () => undefined,
    overscan: 6,
    scrollMargin,
    gap: GRID_GAP,
  });
  const listVirtualizer = useWindowVirtualizer({
    count: worlds.length,
    getScrollElement: () => window,
    estimateSize: () => LIST_ROW_ESTIMATE,
    measureElement: (el) => (el as HTMLElement).offsetHeight || LIST_ROW_ESTIMATE,
    scrollToFn: () => undefined,
    overscan: 8,
    scrollMargin,
    gap: LIST_GAP,
  });

  const gridVirtualItems = gridVirtualizer.getVirtualItems();
  const listVirtualItems = listVirtualizer.getVirtualItems();
  const gridRows = gridVirtualItems.map((row) => ({
    row,
    items: worlds.slice(row.index * columnCount, row.index * columnCount + columnCount),
  }));
  const listRows = listVirtualItems;

  // Index of the last virtualized row currently rendered. The window
  // virtualizer triggers a re-render whenever the range changes, so this
  // value updates as the user scrolls and can be used as an effect dep to
  // decide when to prefetch the next page.
  const activeVirtualItems = viewMode === 'grid' ? gridVirtualItems : listVirtualItems;
  const lastVirtualRowIndex =
    activeVirtualItems.length > 0 ? activeVirtualItems[activeVirtualItems.length - 1].index : -1;

  // Prefetch the next page when the virtualized range is within a few rows
  // of the end of the loaded data, so the fetch can finish before the user
  // reaches the bottom of the list. The sentinel IntersectionObserver
  // above remains as a safety net; the guards below prevent duplicate
  // fetches when both triggers fire while a page is in flight.
  useEffect(() => {
    if (isPagination) return;
    if (!infiniteQuery.hasNextPage || infiniteQuery.isFetchingNextPage) return;
    if (lastVirtualRowIndex < 0) return;

    const totalRows =
      viewMode === 'grid'
        ? Math.max(0, Math.ceil(worlds.length / columnCount) - 1)
        : Math.max(0, worlds.length - 1);

    if (lastVirtualRowIndex >= totalRows - PREFETCH_AHEAD_ROWS) {
      infiniteQuery.fetchNextPage();
    }
  }, [infiniteQuery, isPagination, viewMode, worlds.length, columnCount, lastVirtualRowIndex]);

  return (
    <div className={stylex.props(styles.stack4).className}>
      <div className={stylex.props(styles.czrugxf).className}>
        <div>
          <h1 className={stylex.props(styles.c1ygyk63).className}>{t('worlds.title')}</h1>
          <p className={stylex.props(styles.c1xmut6z).className}>{t('worlds.subtitle')}</p>
        </div>
        <button
          onClick={handleToggleMode}
          className={stylex.props(shared.btnSecondary, styles.cbczsox).className}
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
        highPriorityCount={highPriorityCount}
        platformCounts={platformCounts}
        capacityRange={capacityRange}
        onCapacityChange={handleCapacityChange}
        selectedPlatforms={selectedPlatforms}
        onTogglePlatform={handleTogglePlatform}
        onRemovePlatform={handleRemovePlatform}
        dayRange={dayRange}
        onDayRangeChange={handleDayRangeChange}
        showCurator={canManageCurator}
        highPriority={highPriority}
        onToggleHighPriority={handleToggleHighPriority}
      />

      <h2 className={stylex.props(styles.c1gy9eiv).className}>{t('worlds.resultsSection')}</h2>

      <div className={stylex.props(styles.c1g4q79s).className}>
        <div className={stylex.props(styles.clk02tk).className}>
          <Search className={stylex.props(styles.c1uln0k6).className} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('worlds.searchPlaceholder')}
            aria-label={t('worlds.searchLabel')}
            className={stylex.props(shared.input, styles.cnvqn3h).className}
          />
        </div>
        {!isError && (
          <p role="status" className={stylex.props(styles.ccf2zaq).className}>
            <span>{t('worlds.numberOfResultsLabel')}</span>
            {isPending ? (
              <BeatLoader size={6} color="currentColor" aria-label={t('worlds.loadingResultCount')} />
            ) : (
              <span>{t('worlds.numberOfResultsCount', { count: total })}</span>
            )}
          </p>
        )}
        <div className={stylex.props(styles.c1x4r5ox).className}>
          <button
            onClick={() => setViewMode('grid')}
            aria-label={t('worlds.gridView')}
            aria-pressed={viewMode === 'grid'}
            className={stylex.props(
              styles.viewBtn,
              viewMode === 'grid' ? styles.viewActive : styles.viewInactive,
            ).className}
          >
            <LayoutGrid className={stylex.props(styles.c1ky5l8t).className} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-label={t('worlds.listView')}
            aria-pressed={viewMode === 'list'}
            className={stylex.props(
              styles.viewBtn,
              viewMode === 'list' ? styles.viewActive : styles.viewInactive,
            ).className}
          >
            <List className={stylex.props(styles.c1ky5l8t).className} />
          </button>
        </div>
      </div>

      {isError && (
        <div
          role="status"
          className={stylex.props(styles.c1sn20ea).className}
        >
          {t('worlds.loadError', { message: error?.message })}
        </div>
      )}

      {isPending && (
        <div className={viewMode === 'grid' ? stylex.props(styles.skeletonGrid).className : stylex.props(styles.stack3).className}>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className={stylex.props(shared.card, styles.cn0q47e).className} />
          ))}
        </div>
      )}

      {!isPending && !isError && worlds.length === 0 && (
        <div
          role="status"
          className={stylex.props(shared.card, styles.cgj8p3f).className}
        >
          {t('worlds.noWorlds')}{' '}
          <button onClick={() => refetch()} className={stylex.props(styles.co0qexa).className}>
            {t('worlds.tryAgain')}
          </button>
          .
        </div>
      )}

      {!isPending && !isError && worlds.length > 0 && viewMode === 'grid' && (
        <div
          ref={gridRef}
          style={{ height: gridVirtualizer.getTotalSize() }}
          className={stylex.props(styles.c1pv0ki4).className}
        >
          {gridRows.map(({ row, items }) => (
            <div
              key={row.key}
              data-index={row.index}
              ref={gridVirtualizer.measureElement}
              className={stylex.props(styles.ccwef6y).className}
              style={{ transform: `translateY(${row.start - scrollMargin}px)` }}
            >
              <div className={stylex.props(styles.cqwr8yn).className}>
                {items.map((w) => (
                  <WorldCard
                    key={w.worldId}
                    world={w}
                    onSelect={onSelect}
                    onTagClick={onTagClick}
                    onPlatformClick={onPlatformClick}
                    onAuthorClick={handleAuthorClick}
                    showCuratorBadges={canManageCurator}
                    canCurate={canManageCurator}
                    ratingSummary={ratingSummaries ? ratingSummaries.get(w.worldId) ?? null : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isPending && !isError && worlds.length > 0 && viewMode === 'list' && (
        <div
          ref={listRef}
          style={{ height: listVirtualizer.getTotalSize() }}
          className={stylex.props(styles.ckr1ik8).className}
        >
          {listRows.map((row) => (
            <div
              key={row.key}
              data-index={row.index}
              ref={listVirtualizer.measureElement}
              className={stylex.props(styles.ccwef6y).className}
              style={{ transform: `translateY(${row.start - scrollMargin}px)` }}
            >
              <WorldListRow
                world={worlds[row.index]}
                onSelect={onSelect}
                onAuthorClick={handleAuthorClick}
                showCuratorBadges={canManageCurator}
                ratingSummary={ratingSummaries ? ratingSummaries.get(worlds[row.index].worldId) ?? null : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {scrollMode === 'infinite' && !isError && (
        <div ref={sentinelRef} className={stylex.props(styles.cs6jd9z).className}>
          {infiniteQuery.isFetchingNextPage && (
            <span aria-live="polite" className={stylex.props(styles.c1xmut6z).className}>
              {t('worlds.loadingMore')}
            </span>
          )}
        </div>
      )}

      {scrollMode === 'pagination' && total > 0 && (
        <div className={stylex.props(styles.cs6j9kg).className}>
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
          className={stylex.props(styles.c13vkjpx).className}
          aria-label={t('worlds.backToTop')}
        >
          <ArrowUp className={stylex.props(styles.c1kypdu7).className} />
        </button>
      )}
    </div>
  );
}

const styles = stylex.create({
  stack4: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  stack3: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  czrugxf: {
    "display": "flex",
    "flexDirection": "column",
    "gap": "1rem",
    "@media (min-width: 640px)": {
      "flexDirection": "row",
      "alignItems": "center",
      "justifyContent": "space-between",
    },
  },
  c1ygyk63: {
    "fontSize": "1.25rem",
    "lineHeight": "1.75rem",
    "fontWeight": 700,
    "color": colors["--sos-text-slate-900-white"],
  },
  c1xmut6z: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  cbczsox: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.5rem",
    "paddingLeft": "0.75rem",
    "paddingRight": "0.75rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
  },
  c1gy9eiv: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 600,
    "color": colors["--sos-text-slate-900-white"],
  },
  c1g4q79s: {
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "space-between",
    "gap": "0.75rem",
  },
  clk02tk: {
    "position": "relative",
    "flex": 1,
  },
  c1uln0k6: {
    "position": "absolute",
    "left": "0.625rem",
    "top": "50%",
    "height": "1rem",
    "width": "1rem",
    "transform": "translateY(-50%)",
    "color": colors["--sos-text-slate-400-slate-500"],
  },
  cnvqn3h: {
    "width": "100%",
    "paddingLeft": "2.25rem",
  },
  ccf2zaq: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-600-slate-400"],
  },
  c1x4r5ox: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.25rem",
    "borderRadius": "0.5rem",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-300-slate-700"],
    "backgroundColor": colors["--sos-bg-slate-100_50-slate-800_50"],
    "padding": "0.25rem",
  },
  c1ky5l8t: {
    "height": "1rem",
    "width": "1rem",
  },
  c1sn20ea: {
    "borderRadius": "0.5rem",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": "#ef444433",
    "backgroundColor": "#ef44441a",
    "padding": "1rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-red-700-red-300"],
  },
  cn0q47e: {
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
    "height": "16rem",
  },
  cgj8p3f: {
    "padding": "2rem",
    "textAlign": "center",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  co0qexa: {
    "color": colors["--sos-text-indigo-600-indigo-400"],
    "textDecorationLine": "underline",
  },
  c1pv0ki4: {
    "position": "relative",
  },
  ccwef6y: {
    "position": "absolute",
    "left": "0",
    "right": "0",
    "top": "0",
  },
  cqwr8yn: {
    "display": "grid",
    "gap": "1rem",
    "@media (min-width: 640px)": {
      "gridTemplateColumns": "repeat(2, minmax(0, 1fr))",
    },
    "@media (min-width: 1280px)": {
      "gridTemplateColumns": "repeat(4, minmax(0, 1fr))",
    },
  },
  ckr1ik8: {
    "position": "relative",
    "width": "100%",
    "minWidth": "0",
  },
  cs6jd9z: {
    "display": "flex",
    "justifyContent": "center",
    "paddingTop": "1rem",
    "paddingBottom": "1rem",
  },
  cs6j9kg: {
    "display": "flex",
    "justifyContent": "center",
    "paddingTop": "0.5rem",
  },
  c13vkjpx: {
    "position": "fixed",
    "bottom": "1.5rem",
    "right": "1.5rem",
    "zIndex": 40,
    "display": "flex",
    "height": "3rem",
    "width": "3rem",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "9999px",
    "backgroundColor": colors["--sos-bg-indigo-600-indigo-500"],
    "color": "#ffffff",
    "boxShadow": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "backgroundColor": colors["--sos-bg-indigo-700-indigo-600"],
    },
    ":focus": {
      "boxShadow": "0 0 0 0px #fff, 0 0 0 2px #818cf8",
    },
  },
  c1kypdu7: {
    "height": "1.25rem",
    "width": "1.25rem",
  },
  viewBtn: {
    "display": "flex",
    "height": "2.75rem",
    "width": "2.75rem",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "0.375rem",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    "transitionDuration": "0.15s",
    "transitionTimingFunction": "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  viewActive: {
    "backgroundColor": colors["--sos-bg-slate-300-slate-700"],
    "color": colors["--sos-text-slate-900-white"],
  },
  viewInactive: {
    "color": colors["--sos-text-slate-500-slate-400"],
    ":hover": {
      "color": colors["--sos-text-slate-900-white"],
    },
  },
  skeletonGrid: {
    "display": "grid",
    "gap": "1rem",
    "@media (min-width: 640px)": {
      "gridTemplateColumns": "repeat(2, minmax(0, 1fr))",
    },
    "@media (min-width: 1280px)": {
      "gridTemplateColumns": "repeat(4, minmax(0, 1fr))",
    },
  },
});
