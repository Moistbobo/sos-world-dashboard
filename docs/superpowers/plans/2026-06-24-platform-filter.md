# Add platform filter to /worlds page

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users filter the `/worlds` list by one or more raw platform values via the existing `FilterBar`, syncing selections to the URL and the `/api/worlds` request.

**Architecture:** Extend `fetchWorlds` and the `useWorlds` / `useInfiniteWorlds` hooks with a `platform?: string[]` parameter that becomes repeated `platform` query params. `WorldsPage` adds `selectedPlatforms` state, seeds it from `URLSearchParams.getAll('platform')`, and passes it to the hooks and the `FilterBar`. `FilterBar` renders a static list of common platform values (plus an input for arbitrary raw values), shows selected platform chips in the collapsed bar, and includes platforms in "Clear all" and the active-filter badge.

**Tech Stack:** React, TypeScript, Tailwind CSS, react-router-dom, @tanstack/react-query, i18next, vitest, Testing Library.

**Scope note:** The repository contains only the frontend dashboard. The backend `/api/worlds` endpoint lives in a separate service; this plan wires the frontend to send `platform` query params and assumes the backend already accepts them. Adding a new `/api/platforms` endpoint is out of scope per the ticket.

---

## Task 1: Define common platform values

**Files:**
- Modify: `src/utils/platformLabel.ts`
- Test: `src/utils/platformLabel.test.ts`

Add a `COMMON_PLATFORM_VALUES` array so `FilterBar` can show a fixed, sensible list of known raw platform values. Keep the empty string to represent "Unknown" and let `getPlatformLabel` handle display labels.

- [ ] **Step 1: Write the failing test**

```typescript
it('exports common platform values for filtering', () => {
  expect(COMMON_PLATFORM_VALUES).toEqual([
    'standalonewindows',
    'android',
    'ios',
    'web',
    'unknownplatform',
    '',
  ]);
});
```

Run: `pnpm test src/utils/platformLabel.test.ts`
Expected: FAIL — `COMMON_PLATFORM_VALUES` is not exported.

- [ ] **Step 2: Add the constant**

```typescript
export const COMMON_PLATFORM_VALUES = [
  'standalonewindows',
  'android',
  'ios',
  'web',
  'unknownplatform',
  '',
];
```

- [ ] **Step 3: Run the test**

Run: `pnpm test src/utils/platformLabel.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/utils/platformLabel.ts src/utils/platformLabel.test.ts
git commit -m "feat(platform): export common platform values for filtering"
```

---

## Task 2: Add platform query parameter to fetchWorlds

**Files:**
- Modify: `src/api/client.ts`
- Test: `src/api/client.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
it('includes platform query params', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(JSON.stringify({ worlds: [], total: 0, limit: 20, offset: 0 }), { status: 200 })
  );
  await fetchWorlds({ platform: ['android', 'ios'] });
  const url = vi.mocked(fetch).mock.calls[0][0] as string;
  expect(url).toContain('platform=android');
  expect(url).toContain('platform=ios');
});
```

Run: `pnpm test src/api/client.test.ts`
Expected: FAIL — `platform` is not a valid parameter.

- [ ] **Step 2: Update fetchWorlds signature and query builder**

In `src/api/client.ts`, add `platform?: string[]` to the `fetchWorlds` params and append each value to the query string.

```typescript
export async function fetchWorlds(params?: {
  limit?: number;
  offset?: number;
  tag?: string[];
  quality?: ('good' | 'bad')[];
  search?: string;
  minCapacity?: number;
  maxCapacity?: number;
  platform?: string[];
}): Promise<PaginatedWorlds> {
  const qs = new URLSearchParams();
  // ... existing params ...
  if (params?.platform?.length) {
    for (const p of params.platform) qs.append('platform', p);
  }
  // ...
}
```

- [ ] **Step 3: Run the test**

Run: `pnpm test src/api/client.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/api/client.ts src/api/client.test.ts
git commit -m "feat(api): add platform query param to fetchWorlds"
```

---

## Task 3: Pass platform through the hooks

**Files:**
- Modify: `src/hooks/useApi.ts`
- Test: `src/hooks/useApi.test.tsx`

- [ ] **Step 1: Write the failing tests**

```typescript
it('passes platform array to fetchWorlds', async () => {
  renderHook(() => useWorlds({ platform: ['android', 'ios'] }), { wrapper: Wrapper });
  await waitFor(() => expect(vi.mocked(fetchWorlds)).toHaveBeenCalled());
  expect(vi.mocked(fetchWorlds)).toHaveBeenCalledWith(
    expect.objectContaining({ platform: ['android', 'ios'] })
  );
});
```

And in the `useInfiniteWorlds` describe block:

```typescript
it('passes platform array to fetchWorlds', async () => {
  renderHook(() => useInfiniteWorlds({ platform: ['android'], enabled: true }), { wrapper: Wrapper });
  await waitFor(() => expect(vi.mocked(fetchWorlds)).toHaveBeenCalled());
  expect(vi.mocked(fetchWorlds)).toHaveBeenCalledWith(
    expect.objectContaining({ platform: ['android'] })
  );
});
```

Run: `pnpm test src/hooks/useApi.test.tsx`
Expected: FAIL — `platform` is not accepted by the hooks.

- [ ] **Step 2: Add platform to hook params**

Add `platform?: string[]` to both `useWorlds` and `useInfiniteWorlds` parameter types. The existing object spread already forwards all params to `fetchWorlds`, so only the type needs to change.

```typescript
export function useWorlds(params?: {
  limit?: number;
  offset?: number;
  tag?: string[];
  quality?: ('good' | 'bad')[];
  search?: string;
  minCapacity?: number;
  maxCapacity?: number;
  platform?: string[];
  enabled?: boolean;
}) { ... }

export function useInfiniteWorlds(params?: {
  limit?: number;
  tag?: string[];
  quality?: ('good' | 'bad')[];
  search?: string;
  minCapacity?: number;
  maxCapacity?: number;
  platform?: string[];
  enabled?: boolean;
}) { ... }
```

- [ ] **Step 3: Run the tests**

Run: `pnpm test src/hooks/useApi.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useApi.ts src/hooks/useApi.test.tsx
git commit -m "feat(hooks): accept platform filter in useWorlds and useInfiniteWorlds"
```

---

## Task 4: Add platform filter UI to FilterBar

**Files:**
- Modify: `src/components/FilterBar.tsx`
- Test: `src/components/FilterBar.test.tsx`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/ja.json`

Props to add:
- `selectedPlatforms: string[]`
- `onTogglePlatform: (platform: string) => void`
- `onRemovePlatform: (platform: string) => void`

Behavior:
- Show a "Platforms" section in the expanded panel.
- Render chips for `COMMON_PLATFORM_VALUES`.
- Provide an input so users can type a raw platform value and press Enter to toggle it.
- Show selected platform chips in the collapsed bar (between tags and quality, or at the end).
- Include `selectedPlatforms.length` in `hasFilters`, `activeFilterCount`, and `onClear`.
- Display labels via `getPlatformLabel`; render empty string as "Unknown".

- [ ] **Step 1: Add translation keys**

In `src/i18n/locales/en.json` under `filter`:

```json
"platform": "Platform",
"platforms": "Platforms",
"searchPlatformsPlaceholder": "Search or add platform...",
"removePlatform": "Remove platform filter"
```

In `src/i18n/locales/ja.json` under `filter`:

```json
"platform": "プラットフォーム",
"platforms": "プラットフォーム",
"searchPlatformsPlaceholder": "プラットフォームを検索または追加...",
"removePlatform": "プラットフォームフィルタを解除"
```

- [ ] **Step 2: Write the failing test**

```typescript
it('renders platform chips when expanded', async () => {
  const user = userEvent.setup();
  renderFilterBar({ selectedPlatforms: [], onTogglePlatform: vi.fn() });

  await user.click(screen.getByRole('button', { name: /filters/i }));

  expect(screen.getByText('Platforms')).toBeInTheDocument();
  expect(screen.getByText('Android')).toBeInTheDocument();
  expect(screen.getByText('Unknown')).toBeInTheDocument();
});

it('calls onTogglePlatform when a platform chip is clicked', async () => {
  const user = userEvent.setup();
  const onTogglePlatform = vi.fn();
  renderFilterBar({ onTogglePlatform });

  await user.click(screen.getByRole('button', { name: /filters/i }));
  await user.click(screen.getByText('Android'));

  expect(onTogglePlatform).toHaveBeenCalledWith('android');
});

it('shows selected platform chips in collapsed bar', () => {
  renderFilterBar({ selectedPlatforms: ['android', ''] });
  expect(screen.getByText('Android')).toBeInTheDocument();
  expect(screen.getByText('Unknown')).toBeInTheDocument();
});

it('calls onRemovePlatform when a selected platform X is clicked', async () => {
  const user = userEvent.setup();
  const onRemovePlatform = vi.fn();
  renderFilterBar({ selectedPlatforms: ['android'], onRemovePlatform });

  await user.click(
    screen.getByRole('button', { name: /remove platform filter/i })
  );

  expect(onRemovePlatform).toHaveBeenCalledWith('android');
});

it('adds a raw platform value when typing and pressing Enter', async () => {
  const user = userEvent.setup();
  const onTogglePlatform = vi.fn();
  renderFilterBar({ onTogglePlatform });

  await user.click(screen.getByRole('button', { name: /filters/i }));
  const input = screen.getByPlaceholderText(/search or add platform/i);
  await user.type(input, '2019.2.4-801-Release');
  await user.keyboard('{Enter}');

  expect(onTogglePlatform).toHaveBeenCalledWith('2019.2.4-801-Release');
});

it('clears platforms via onClear', async () => {
  const user = userEvent.setup();
  const onClear = vi.fn();
  renderFilterBar({ selectedPlatforms: ['android'], onClear });

  await user.click(screen.getByRole('button', { name: /clear all/i }));

  expect(onClear).toHaveBeenCalled();
});
```

Run: `pnpm test src/components/FilterBar.test.tsx`
Expected: FAIL — props and UI do not exist.

- [ ] **Step 3: Update FilterBar props and UI**

Import `COMMON_PLATFORM_VALUES` and `getPlatformLabel`:

```typescript
import { COMMON_PLATFORM_VALUES, getPlatformLabel } from '../utils/platformLabel';
```

Extend props:

```typescript
interface FilterBarProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  selectedQuality: ('good' | 'bad')[];
  onToggleQuality: (quality: 'good' | 'bad') => void;
  onClear: () => void;
  availableTags: { tag: string; count: number }[];
  capacityRange: CapacityRangeValue;
  onCapacityChange: (range: CapacityRangeValue) => void;
  selectedPlatforms: string[];
  onTogglePlatform: (platform: string) => void;
  onRemovePlatform: (platform: string) => void;
}
```

Add state for raw platform input:

```typescript
const [platformInput, setPlatformInput] = useState('');
```

Update `hasFilters` and `activeFilterCount`:

```typescript
const hasFilters =
  selectedTags.length > 0 ||
  selectedQuality.length > 0 ||
  isCapacityActive ||
  selectedPlatforms.length > 0;

const activeFilterCount =
  selectedTags.length +
  selectedQuality.length +
  (isCapacityActive ? 1 : 0) +
  selectedPlatforms.length;
```

Add selected-platform chips in the collapsed bar (after tags, before quality or at the end):

```tsx
{selectedPlatforms.map((p) => (
  <span
    key={p}
    className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30"
  >
    <span>{getPlatformLabel(p)}</span>
    <button
      onClick={() => onRemovePlatform(p)}
      aria-label={t('filter.removePlatform')}
      className="hover:text-white"
    >
      <X className="h-3 w-3" />
    </button>
  </span>
))}
```

Add the expanded platform section after the tags section:

```tsx
<div>
  <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
    {t('filter.platforms')}
  </label>
  <div className="relative mb-2">
    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
    <input
      type="text"
      value={platformInput}
      onChange={(e) => setPlatformInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && platformInput.trim()) {
          onTogglePlatform(platformInput.trim());
          setPlatformInput('');
        }
      }}
      placeholder={t('filter.searchPlatformsPlaceholder')}
      className="input w-full pl-8"
    />
  </div>
  <div className="flex flex-wrap gap-1.5 pr-1">
    {COMMON_PLATFORM_VALUES.map((p) => {
      const label = getPlatformLabel(p);
      return (
        <button
          key={p}
          onClick={() => onTogglePlatform(p)}
          className={`rounded-md border px-2 py-1 text-xs transition ${
            selectedPlatforms.includes(p)
              ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300'
              : 'border-slate-300 bg-slate-100/50 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-slate-600'
          }`}
        >
          {label}
        </button>
      );
    })}
  </div>
</div>
```

- [ ] **Step 4: Run the tests**

Run: `pnpm test src/components/FilterBar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/FilterBar.tsx src/components/FilterBar.test.tsx src/i18n/locales/en.json src/i18n/locales/ja.json
git commit -m "feat(filter): add platform selection UI to FilterBar"
```

---

## Task 5: Wire platform filter into WorldsPage

**Files:**
- Modify: `src/pages/WorldsPage.tsx`
- Test: `src/pages/WorldsPage.test.tsx`

- [ ] **Step 1: Write the failing tests**

```typescript
it('seeds selected platforms from URL query params', () => {
  window.history.pushState({}, '', '/worlds?platform=android&platform=ios');
  render(<WorldsPage />, { wrapper: Wrapper });
  fireEvent.click(screen.getByRole('button', { name: /filters/i }));
  expect(screen.getByText('Android')).toBeInTheDocument();
  expect(screen.getByText('iOS')).toBeInTheDocument();
});

it('updates URL when platforms are selected', async () => {
  const user = userEvent.setup();
  render(<WorldsPage />, { wrapper: Wrapper });
  await user.click(screen.getByRole('button', { name: /filters/i }));
  await user.click(screen.getByText('Android'));
  expect(window.location.search).toContain('platform=android');
});

it('clears platform filters via Clear all', async () => {
  const user = userEvent.setup();
  window.history.pushState({}, '', '/worlds?platform=android');
  render(<WorldsPage />, { wrapper: Wrapper });
  await user.click(screen.getByRole('button', { name: /clear all/i }));
  expect(window.location.search).not.toContain('platform=android');
});
```

Run: `pnpm test src/pages/WorldsPage.test.tsx`
Expected: FAIL — `WorldsPage` does not handle platforms.

- [ ] **Step 2: Add platform state and handlers**

Seed `selectedPlatforms` from URL:

```typescript
const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(() =>
  searchParams.getAll('platform')
);
```

Pass `platform: selectedPlatforms` to both queries:

```typescript
const paginationQuery = useWorlds({
  // ...existing params...
  platform: selectedPlatforms,
  enabled: scrollMode === 'pagination',
});

const infiniteQuery = useInfiniteWorlds({
  // ...existing params...
  platform: selectedPlatforms,
  enabled: scrollMode === 'infinite',
});
```

Add handlers:

```typescript
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
```

Update `handleClear`:

```typescript
const handleClear = () => {
  setSelectedTags([]);
  setSelectedQuality([]);
  setSelectedPlatforms([]);
  setCapacityRange({ min: MIN_CAPACITY, max: MAX_CAPACITY });
  setSearchInput('');
  resetToFirstPage();
};
```

- [ ] **Step 3: Sync platforms to URL**

Update the URL effect to append all selected platforms:

```typescript
useEffect(() => {
  const next = new URLSearchParams();
  if (selectedTags.length > 0) next.set('tag', selectedTags[0]);
  if (selectedQuality.length > 0) next.set('quality', selectedQuality[0]);
  if (capacityRange.min > MIN_CAPACITY) next.set('minCapacity', String(capacityRange.min));
  if (capacityRange.max < MAX_CAPACITY) next.set('maxCapacity', String(capacityRange.max));
  for (const p of selectedPlatforms) {
    next.append('platform', p);
  }
  if (next.toString() !== searchParams.toString()) {
    setSearchParams(next, { replace: true });
  }
}, [selectedTags, selectedQuality, capacityRange, selectedPlatforms, setSearchParams, searchParams]);
```

- [ ] **Step 4: Pass props to FilterBar**

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
  selectedPlatforms={selectedPlatforms}
  onTogglePlatform={handleTogglePlatform}
  onRemovePlatform={handleRemovePlatform}
/>
```

- [ ] **Step 5: Run the tests**

Run: `pnpm test src/pages/WorldsPage.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/WorldsPage.tsx src/pages/WorldsPage.test.tsx
git commit -m "feat(worlds): wire platform filter state and URL sync"
```

---

## Task 6: Full verification

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`
Expected: All tests pass.

- [ ] **Step 2: Run the linter**

Run: `pnpm lint`
Expected: No errors or warnings.

- [ ] **Step 3: Run the TypeScript build**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 4: Commit any fixes**

If the linter or build required changes, commit them with an appropriate `[CHORE]` or `[FIX]` message.

---

## Acceptance Criteria Coverage

| Criterion | Covered by |
|-----------|------------|
| Backend `/api/worlds` supports filtering by platform value(s) | Frontend sends repeated `platform` query params (Task 2). Backend implementation is in a separate service. |
| `fetchWorlds` and `useInfiniteWorlds` accept `platform?: string[]` | Tasks 2 and 3 |
| `FilterBar` renders available platforms and toggles them | Task 4 |
| Selecting/deselecting platforms updates the world list and URL | Task 5 |
| Empty platform value (`""`) is labeled as "Unknown" | Task 4 uses `getPlatformLabel('')` → "Unknown" |
| Platform filter chips appear next to tag/quality chips | Task 4 |
| Platform filter is cleared by the existing "Clear all" button | Tasks 4 and 5 |
| Tests cover the new hook parameter and filter interaction | Tasks 2–5 |
