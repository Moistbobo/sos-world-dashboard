# Capacity Range Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 1–80 player capacity range filter to the `/worlds` page, wired through the API with `minCapacity`/`maxCapacity` query params and synced to the URL.

**Architecture:** Extend the existing `fetchWorlds` request params and React Query hooks to carry `minCapacity`/`maxCapacity`. Add a reusable range slider + number input control to `FilterBar`, keep capacity state in `WorldsPage`, and sync it to URL query params just like tag/quality. Reset pagination/infinite scroll on every capacity change.

**Tech Stack:** React, TypeScript, Tailwind CSS, `@tanstack/react-query`, `react-i18next`, `lucide-react`, Vitest + React Testing Library.

---

## File map

| File | Responsibility |
|------|---------------|
| `src/api/client.ts` | Serialize `minCapacity`/`maxCapacity` into `GET /api/worlds` query string. |
| `src/hooks/useApi.ts` | Accept and forward `minCapacity`/`maxCapacity` in `useWorlds` and `useInfiniteWorlds`. |
| `src/components/FilterBar.tsx` | Add capacity section with slider + inputs, active chip, and clear support. |
| `src/components/FilterBar.test.tsx` | Test capacity rendering, user input, chip display, and clear behavior. |
| `src/pages/WorldsPage.tsx` | Hold capacity state from URL, sync back to URL, reset list on change, pass to hooks and `FilterBar`. |
| `src/pages/WorldsPage.test.tsx` | Test URL seeding, URL updates, and query reset on capacity changes. |
| `src/i18n/locales/en.json` / `ja.json` | Add capacity-related translation keys. |

---

## Constants

```ts
// src/components/CapacityRange.tsx
export const MIN_CAPACITY = 1;
export const MAX_CAPACITY = 80;
```

---

## Task 1: Create a reusable `CapacityRange` component

**Files:**
- Create: `src/components/CapacityRange.tsx`
- Test: `src/components/CapacityRange.test.tsx`

### Step 1: Write the failing test

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CapacityRange, MIN_CAPACITY, MAX_CAPACITY } from './CapacityRange';

describe('CapacityRange', () => {
  it('renders min/max inputs with the provided values', () => {
    render(<CapacityRange min={10} max={40} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/min/i)).toHaveValue(10);
    expect(screen.getByLabelText(/max/i)).toHaveValue(40);
  });

  it('calls onChange when min input changes', () => {
    const onChange = vi.fn();
    render(<CapacityRange min={1} max={80} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/min/i), { target: { value: '15' } });
    expect(onChange).toHaveBeenCalledWith({ min: 15, max: 80 });
  });

  it('clamps min below MIN_CAPACITY', () => {
    const onChange = vi.fn();
    render(<CapacityRange min={1} max={80} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/min/i), { target: { value: '0' } });
    expect(onChange).toHaveBeenCalledWith({ min: MIN_CAPACITY, max: 80 });
  });

  it('clamps max above MAX_CAPACITY', () => {
    const onChange = vi.fn();
    render(<CapacityRange min={1} max={80} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/max/i), { target: { value: '100' } });
    expect(onChange).toHaveBeenCalledWith({ min: 1, max: MAX_CAPACITY });
  });
});
```

### Step 2: Run test to verify it fails

Run: `pnpm test src/components/CapacityRange.test.tsx`
Expected: FAIL — component not found, etc.

### Step 3: Write minimal implementation

```tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const MIN_CAPACITY = 1;
export const MAX_CAPACITY = 80;

interface CapacityRangeProps {
  min: number;
  max: number;
  onChange: (range: { min: number; max: number }) => void;
}

export function CapacityRange({ min, max, onChange }: CapacityRangeProps) {
  const { t } = useTranslation();
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);

  useEffect(() => setMinValue(min), [min]);
  useEffect(() => setMaxValue(max), [max]);

  const commit = (nextMin: number, nextMax: number) => {
    const clampedMin = Math.max(MIN_CAPACITY, Math.min(nextMin, MAX_CAPACITY));
    const clampedMax = Math.max(MIN_CAPACITY, Math.min(nextMax, MAX_CAPACITY));
    const finalMin = Math.min(clampedMin, clampedMax);
    const finalMax = Math.max(clampedMin, clampedMax);
    onChange({ min: finalMin, max: finalMax });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="capacity-min">
          {t('filter.minCapacity')}
        </label>
        <input
          id="capacity-min"
          type="number"
          min={MIN_CAPACITY}
          max={MAX_CAPACITY}
          value={minValue}
          onChange={(e) => {
            const value = e.target.value === '' ? MIN_CAPACITY : Number(e.target.value);
            setMinValue(value);
          }}
          onBlur={() => commit(minValue, maxValue)}
          className="input w-20 text-center"
        />
        <span className="text-xs text-slate-500">{t('filter.capacityTo')}</span>
        <label className="sr-only" htmlFor="capacity-max">
          {t('filter.maxCapacity')}
        </label>
        <input
          id="capacity-max"
          type="number"
          min={MIN_CAPACITY}
          max={MAX_CAPACITY}
          value={maxValue}
          onChange={(e) => {
            const value = e.target.value === '' ? MAX_CAPACITY : Number(e.target.value);
            setMaxValue(value);
          }}
          onBlur={() => commit(minValue, maxValue)}
          className="input w-20 text-center"
        />
        <span className="text-xs text-slate-500">{t('filter.capacityUnit')}</span>
      </div>
    </div>
  );
}
```

### Step 4: Run test to verify it passes

Run: `pnpm test src/components/CapacityRange.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/components/CapacityRange.tsx src/components/CapacityRange.test.tsx
git commit -m "feat: add reusable CapacityRange component"
```

---

## Task 2: Extend `fetchWorlds` with capacity params

**Files:**
- Modify: `src/api/client.ts`
- Test: create `src/api/client.test.ts`

### Step 1: Write the failing test

Create `src/api/client.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { fetchWorlds } from './client';

global.fetch = vi.fn();

describe('fetchWorlds', () => {
  it('includes minCapacity and maxCapacity query params', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ worlds: [], total: 0, limit: 20, offset: 0 }), { status: 200 })
    );
    await fetchWorlds({ minCapacity: 10, maxCapacity: 40 });
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('minCapacity=10');
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('maxCapacity=40');
  });
});
```

### Step 2: Run test to verify it fails

Run: `pnpm test src/api/client.test.ts`
Expected: FAIL — params not serialized.

### Step 3: Write minimal implementation

Update `src/api/client.ts`:

```ts
export async function fetchWorlds(params?: {
  limit?: number;
  offset?: number;
  tag?: string[];
  quality?: ('good' | 'bad')[];
  search?: string;
  minCapacity?: number;
  maxCapacity?: number;
}): Promise<PaginatedWorlds> {
  const qs = new URLSearchParams();
  if (params?.limit !== undefined) qs.set('limit', String(params.limit));
  if (params?.offset !== undefined) qs.set('offset', String(params.offset));
  if (params?.search?.trim()) qs.set('search', params.search.trim());
  if (params?.minCapacity !== undefined) qs.set('minCapacity', String(params.minCapacity));
  if (params?.maxCapacity !== undefined) qs.set('maxCapacity', String(params.maxCapacity));
  if (params?.tag?.length) {
    for (const t of params.tag) qs.append('tag', t);
  }
  if (params?.quality?.length) {
    for (const q of params.quality) qs.append('quality', q);
  }
  const query = qs.toString();
  return request(`/api/worlds${query ? `?${query}` : ''}`);
}
```

### Step 4: Run test to verify it passes

Run: `pnpm test src/api/client.test.ts`
Expected: PASS

### Step 5: Commit

```bash
git add src/api/client.ts src/api/client.test.ts
git commit -m "feat(api): support minCapacity and maxCapacity in fetchWorlds"
```

---

## Task 3: Extend React Query hooks

**Files:**
- Modify: `src/hooks/useApi.ts`

### Step 1: Write the failing test

Create `src/hooks/useApi.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWorlds } from './useApi';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

vi.mock('../api/client', () => ({
  fetchWorlds: vi.fn(() => Promise.resolve({ worlds: [], total: 0, limit: 20, offset: 0 })),
  fetchHealth: vi.fn(),
  fetchTags: vi.fn(),
  fetchWorld: vi.fn(),
}));

describe('useWorlds', () => {
  it('passes minCapacity and maxCapacity to fetchWorlds', async () => {
    renderHook(() => useWorlds({ minCapacity: 10, maxCapacity: 40 }), { wrapper: Wrapper });
    await waitFor(() => expect(vi.mocked(fetchWorlds)).toHaveBeenCalled());
    expect(vi.mocked(fetchWorlds)).toHaveBeenCalledWith(
      expect.objectContaining({ minCapacity: 10, maxCapacity: 40 })
    );
  });
});
```

### Step 2: Run test to verify it fails

Run: `pnpm test src/hooks/useApi.test.tsx`
Expected: FAIL — hooks don't accept capacity params.

### Step 3: Write minimal implementation

Update `src/hooks/useApi.ts`:

```ts
export function useWorlds(params?: {
  limit?: number;
  offset?: number;
  tag?: string[];
  quality?: ('good' | 'bad')[];
  search?: string;
  minCapacity?: number;
  maxCapacity?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['worlds', params],
    queryFn: () => fetchWorlds(params),
    enabled: params?.enabled,
  });
}

export function useInfiniteWorlds(params?: {
  limit?: number;
  tag?: string[];
  quality?: ('good' | 'bad')[];
  search?: string;
  minCapacity?: number;
  maxCapacity?: number;
  enabled?: boolean;
}) {
  const limit = params?.limit ?? 20;
  return useInfiniteQuery({
    queryKey: ['worlds-infinite', { ...params, limit }],
    queryFn: ({ pageParam }) =>
      fetchWorlds({
        ...params,
        limit,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    enabled: params?.enabled,
  });
}
```

### Step 4: Run test to verify it passes

Run: `pnpm test src/hooks/useApi.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/hooks/useApi.ts src/hooks/useApi.test.tsx
git commit -m "feat(hooks): thread minCapacity/maxCapacity through world queries"
```

---

## Task 4: Add i18n keys

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/ja.json`

### Step 1: Write the failing test

No new failing test needed. Existing i18n usage will fail TypeScript/lint if keys are missing after components are wired.

### Step 2: Add keys

Update `en.json` under the `filter` object:

```json
"filter": {
  "filters": "Filters",
  "quality": "Quality",
  "good": "✅ Good",
  "bad": "❌ Bad",
  "tags": "Tags",
  "searchTagsPlaceholder": "Search tags...",
  "clearAll": "Clear all",
  "capacity": "Player capacity",
  "minCapacity": "Minimum capacity",
  "maxCapacity": "Maximum capacity",
  "capacityTo": "to",
  "capacityUnit": "players"
}
```

Update `ja.json` under the `filter` object:

```json
"filter": {
  "filters": "フィルタ",
  "quality": "品質",
  "good": "✅ 良い",
  "bad": "❌ 悪い",
  "tags": "タグ",
  "searchTagsPlaceholder": "タグを検索...",
  "clearAll": "すべて解除",
  "capacity": "定員",
  "minCapacity": "最小定員",
  "maxCapacity": "最大定員",
  "capacityTo": "〜",
  "capacityUnit": "人"
}
```

### Step 3: Run lint/test to verify

Run: `pnpm lint` and `pnpm test`
Expected: PASS (after component wiring is done this will fail if keys are missing; add keys before wiring to keep tests green).

### Step 4: Commit

```bash
git add src/i18n/locales/en.json src/i18n/locales/ja.json
git commit -m "i18n: add capacity filter translations"
```

---

## Task 5: Wire capacity into `FilterBar`

**Files:**
- Modify: `src/components/FilterBar.tsx`
- Test: `src/components/FilterBar.test.tsx`

### Step 1: Write the failing test

Create `src/components/FilterBar.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from './FilterBar';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

describe('FilterBar capacity', () => {
  it('renders capacity section with slider and inputs', () => {
    render(
      <FilterBar
        selectedTags={[]}
        onToggleTag={vi.fn()}
        onRemoveTag={vi.fn()}
        selectedQuality={[]}
        onToggleQuality={vi.fn()}
        onClear={vi.fn()}
        availableTags={[]}
        capacityRange={{ min: 1, max: 80 }}
        onCapacityChange={vi.fn()}
      />,
      { wrapper: Wrapper }
    );
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    expect(screen.getByLabelText(/minimum capacity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum capacity/i)).toBeInTheDocument();
  });

  it('shows active capacity chip when not at default range', () => {
    render(
      <FilterBar
        selectedTags={[]}
        onToggleTag={vi.fn()}
        onRemoveTag={vi.fn()}
        selectedQuality={[]}
        onToggleQuality={vi.fn()}
        onClear={vi.fn()}
        availableTags={[]}
        capacityRange={{ min: 10, max: 40 }}
        onCapacityChange={vi.fn()}
      />,
      { wrapper: Wrapper }
    );
    expect(screen.getByText(/10.*40.*players/i)).toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

Run: `pnpm test src/components/FilterBar.test.tsx`
Expected: FAIL — props don't exist yet.

### Step 3: Write minimal implementation

Update `src/components/FilterBar.tsx`:

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getEmojiForTag } from '../utils/tagEmoji';
import { CapacityRange, MIN_CAPACITY, MAX_CAPACITY } from './CapacityRange';

interface FilterBarProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  selectedQuality: ('good' | 'bad')[];
  onToggleQuality: (quality: 'good' | 'bad') => void;
  onClear: () => void;
  availableTags: { tag: string; count: number }[];
  capacityRange: { min: number; max: number };
  onCapacityChange: (range: { min: number; max: number }) => void;
}

export function FilterBar({
  selectedTags,
  onToggleTag,
  onRemoveTag,
  selectedQuality,
  onToggleQuality,
  onClear,
  availableTags,
  capacityRange,
  onCapacityChange,
}: FilterBarProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  const filteredTags = availableTags.filter((t) =>
    t.tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const hasCapacityFilter = capacityRange.min > MIN_CAPACITY || capacityRange.max < MAX_CAPACITY;
  const hasFilters = selectedTags.length > 0 || selectedQuality.length > 0 || hasCapacityFilter;

  return (
    <div className="card mb-4">
      <div className="flex flex-wrap items-center gap-2 p-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`btn-ghost gap-1.5 text-xs ${expanded ? 'bg-slate-200 dark:bg-slate-800' : ''}`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {t('filter.filters')}
          {hasFilters && (
            <span className="ml-1 rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {selectedTags.length + selectedQuality.length + (hasCapacityFilter ? 1 : 0)}
            </span>
          )}
        </button>

        {selectedTags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30"
          >
            <span className="leading-none">{getEmojiForTag(t)}</span>
            <span>{t}</span>
            <button onClick={() => onRemoveTag(t)} className="hover:text-white">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {selectedQuality.map((q) => (
          <span
            key={q}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
              q === 'good'
                ? 'bg-green-500/20 text-green-300 ring-green-500/30'
                : 'bg-red-500/20 text-red-300 ring-red-500/30'
            }`}
          >
            {q}
            <button onClick={() => onToggleQuality(q)} className="hover:text-white">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {hasCapacityFilter && (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30">
            {capacityRange.min}–{capacityRange.max} {t('filter.capacityUnit')}
            <button
              onClick={() => onCapacityChange({ min: MIN_CAPACITY, max: MAX_CAPACITY })}
              className="hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {hasFilters && (
          <button onClick={onClear} className="btn-ghost text-xs py-1.5">
            {t('filter.clearAll')}
          </button>
        )}
      </div>

      {expanded && (
        <div className="border-t border-slate-200 p-3 dark:border-slate-700/50">
          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('filter.quality')}
            </label>
            <div className="flex gap-2">
              {(['good', 'bad'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => onToggleQuality(q)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    selectedQuality.includes(q)
                      ? q === 'good'
                        ? 'border-green-500/40 bg-green-500/15 text-green-300'
                        : 'border-red-500/40 bg-red-500/15 text-red-300'
                      : 'border-slate-300 bg-slate-100/50 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  {q === 'good' ? t('filter.good') : t('filter.bad')}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('filter.capacity')}
            </label>
            <CapacityRange min={capacityRange.min} max={capacityRange.max} onChange={onCapacityChange} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('filter.tags')}
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder={t('filter.searchTagsPlaceholder')}
                className="input w-full pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto scrollbar-thin pr-1">
              {filteredTags.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => onToggleTag(t.tag)}
                  className={`rounded-md border px-2 py-1 text-xs transition ${
                    selectedTags.includes(t.tag)
                      ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300'
                      : 'border-slate-300 bg-slate-100/50 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  {getEmojiForTag(t.tag)} {t.tag}{' '}
                  <span className="text-slate-400 dark:text-slate-500">({t.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 4: Run test to verify it passes

Run: `pnpm test src/components/FilterBar.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/components/FilterBar.tsx src/components/FilterBar.test.tsx
git commit -m "feat(filterbar): add capacity range section and active chip"
```

---

## Task 6: Wire capacity into `WorldsPage`

**Files:**
- Modify: `src/pages/WorldsPage.tsx`
- Test: `src/pages/WorldsPage.test.tsx`

### Step 1: Write the failing test

Append to `src/pages/WorldsPage.test.tsx`:

```tsx
describe('WorldsPage capacity filter', () => {
  it('seeds capacity range from URL query params', () => {
    window.history.pushState({}, '', '/worlds?minCapacity=10&maxCapacity=40');
    render(<WorldsPage />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    expect(screen.getByLabelText(/minimum capacity/i)).toHaveValue(10);
    expect(screen.getByLabelText(/maximum capacity/i)).toHaveValue(40);
  });
});
```

### Step 2: Run test to verify it fails

Run: `pnpm test src/pages/WorldsPage.test.tsx`
Expected: FAIL — `WorldsPage` doesn't read capacity from URL.

### Step 3: Write minimal implementation

Update `src/pages/WorldsPage.tsx`:

1. Import `CapacityRange` constants:

```ts
import { CapacityRange, MIN_CAPACITY, MAX_CAPACITY } from '../components/CapacityRange';
```

Wait — naming conflict with the imported hook type. Use named import aliases or import only constants:

```ts
import { MIN_CAPACITY, MAX_CAPACITY } from '../components/CapacityRange';
import type { CapacityRangeValue } from '../components/CapacityRange';
```

Add `export type CapacityRangeValue = { min: number; max: number };` in `src/components/CapacityRange.tsx`.

2. Add capacity state after `selectedQuality`:

```ts
const [capacityRange, setCapacityRange] = useState(() => {
  const minRaw = searchParams.get('minCapacity');
  const maxRaw = searchParams.get('maxCapacity');
  const min = Number(minRaw);
  const max = Number(maxRaw);
  return {
    min: minRaw && !isNaN(min) ? Math.max(MIN_CAPACITY, min) : MIN_CAPACITY,
    max: maxRaw && !isNaN(max) ? Math.min(MAX_CAPACITY, max) : MAX_CAPACITY,
  };
});
```

3. Pass `minCapacity`/`maxCapacity` to both query hooks:

```ts
const paginationQuery = useWorlds({
  limit,
  offset,
  tag: selectedTags,
  quality: selectedQuality,
  search: searchQuery,
  minCapacity: capacityRange.min,
  maxCapacity: capacityRange.max,
  enabled: scrollMode === 'pagination',
});

const infiniteQuery = useInfiniteWorlds({
  limit,
  tag: selectedTags,
  quality: selectedQuality,
  search: searchQuery,
  minCapacity: capacityRange.min,
  maxCapacity: capacityRange.max,
  enabled: scrollMode === 'infinite',
});
```

4. Update URL sync effect:

```ts
useEffect(() => {
  const next = new URLSearchParams();
  if (selectedTags.length > 0) next.set('tag', selectedTags[0]);
  if (selectedQuality.length > 0) next.set('quality', selectedQuality[0]);
  if (capacityRange.min > MIN_CAPACITY) next.set('minCapacity', String(capacityRange.min));
  if (capacityRange.max < MAX_CAPACITY) next.set('maxCapacity', String(capacityRange.max));
  if (next.toString() !== searchParams.toString()) {
    setSearchParams(next, { replace: true });
  }
}, [selectedTags, selectedQuality, capacityRange, setSearchParams, searchParams]);
```

5. Add capacity change handler and update clear handler:

```ts
const handleCapacityChange = (range: { min: number; max: number }) => {
  setCapacityRange(range);
  resetToFirstPage();
};

const handleClear = () => {
  setSelectedTags([]);
  setSelectedQuality([]);
  setCapacityRange({ min: MIN_CAPACITY, max: MAX_CAPACITY });
  setSearchInput('');
  resetToFirstPage();
};
```

6. Pass capacity props to `FilterBar`:

```tsx
<FilterBar
  selectedTags={selectedTags}
  onToggleTag={handleToggleTag}
  onRemoveTag={handleRemoveTag}
  selectedQuality={selectedQuality}
  onToggleQuality={handleToggleQuality}
  onClear={handleClear}
  availableTags={tagsData?.tags || []}
  capacityRange={capacityRange}
  onCapacityChange={handleCapacityChange}
/>
```

### Step 4: Run test to verify it passes

Run: `pnpm test src/pages/WorldsPage.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/pages/WorldsPage.tsx src/pages/WorldsPage.test.tsx
git commit -m "feat(worlds): wire capacity range filter to URL and API"
```

---

## Task 7: Verify build, lint, and full test suite

### Step 1: Run lint

Run: `pnpm lint`
Expected: No errors.

### Step 2: Run tests

Run: `pnpm test`
Expected: All tests pass.

### Step 3: Run build

Run: `pnpm build`
Expected: Build succeeds.

### Step 4: Commit

```bash
git commit -m "chore: verify capacity filter feature passes lint, test, and build" --allow-empty
```

---

## Spec coverage self-review

| Spec requirement | Task |
|---|---|
| 1–80 range slider + inputs | Task 1, Task 5 |
| Active capacity chip | Task 5 |
| `minCapacity`/`maxCapacity` URL params | Task 6 |
| Reset list on capacity change | Task 6 |
| `fetchWorlds` sends capacity params | Task 2 |
| `useWorlds`/`useInfiniteWorlds` accept capacity | Task 3 |
| i18n keys in en/ja | Task 4 |
| Tests for UI and URL behavior | Tasks 1, 2, 3, 5, 6 |

No placeholders found. All later tasks use the same `CapacityRange` props and `minCapacity`/`maxCapacity` naming defined in earlier tasks.
