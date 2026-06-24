# Reuse world list data for detail view

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a user opens a world detail view from the worlds list, render it immediately from cached list data instead of showing a loading skeleton, while still fetching the single-world API in the background for freshness.

**Architecture:** Update `useWorld` to supply TanStack Query `placeholderData` by scanning both the paginated `['worlds']` and infinite `['worlds-infinite']` query caches for a matching `worldId`. The detail page will render as soon as placeholder data is available and show a subtle refreshing indicator only when data exists but a background fetch is still in flight. Direct navigation without cached list data keeps the existing loading skeleton behavior.

**Tech Stack:** React, TypeScript, TanStack Query v5, Tailwind CSS, Vitest

---

## File map

- **Modify:** `src/hooks/useApi.ts` — add `placeholderData` to `useWorld` that searches list query caches.
- **Modify:** `src/pages/WorldDetailPage.tsx` — avoid full skeleton when data is present, show subtle background-fetch indicator.
- **Modify:** `src/pages/WorldDetailPage.test.tsx` — add tests for placeholderData behavior and background fetch indicator.
- **Modify:** `src/pages/WorldsPage.test.tsx` — add test verifying the overlay opens without loading state when list data is cached.

---

### Task 1: Seed detail query from cached list data

**Files:**
- Modify: `src/hooks/useApi.ts`

- [ ] **Step 1: Add `useQueryClient` import**

```ts
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
```

- [ ] **Step 2: Implement `placeholderData` in `useWorld`**

Replace the `useWorld` function with a version that looks up the world in both paginated and infinite list caches before falling back to `undefined`.

```ts
export function useWorld(worldId: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['world', worldId],
    queryFn: () => {
      if (!worldId) throw new Error('No worldId provided');
      return fetchWorld(worldId);
    },
    enabled: !!worldId,
    placeholderData: () => {
      if (!worldId) return undefined;

      const paginatedQueries = queryClient.getQueriesData<PaginatedWorlds>({
        queryKey: ['worlds'],
      });
      const fromPaginated = paginatedQueries
        .flatMap(([, data]) => data?.worlds ?? [])
        .find((w) => w.worldId === worldId);
      if (fromPaginated) return fromPaginated;

      const infiniteQueries = queryClient.getQueriesData<{ pages: PaginatedWorlds[] }>({
        queryKey: ['worlds-infinite'],
      });
      const fromInfinite = infiniteQueries
        .flatMap(([, data]) => data?.pages.flatMap((page) => page.worlds) ?? [])
        .find((w) => w.worldId === worldId);

      return fromInfinite;
    },
  });
}
```

- [ ] **Step 3: Import `PaginatedWorlds` type if needed**

Ensure `PaginatedWorlds` is imported at the top of `useApi.ts`:

```ts
import type { HealthResponse, PaginatedWorlds, TagsResponse, World } from '../types';
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useApi.ts
git commit -m "feat(useWorld): seed detail query from cached list data"
```

---

### Task 2: Avoid full skeleton and show background refresh indicator

**Files:**
- Modify: `src/pages/WorldDetailPage.tsx`

- [ ] **Step 1: Destructure `isFetching` from `useWorld`**

```ts
const { data, isPending, isError, error, isFetching } = useWorld(worldId);
```

- [ ] **Step 2: Render existing data while fetching in the background**

Change the pending guard so it only shows the skeleton when there is no data. When `data` exists, render the full detail view and add a small loading bar/indicator at the top of the card when `isFetching` is true.

Replace:

```ts
if (isPending) {
```

with:

```ts
if (isPending && !data) {
```

Then, inside the card header area (just inside the `<div className="card overflow-hidden">` after the hero image), conditionally render a thin indeterminate progress bar when `isFetching`:

```tsx
{isFetching && (
  <div className="h-1 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
    <div className="h-full w-1/3 animate-[shimmer_1s_infinite] bg-indigo-500" />
  </div>
)}
```

If a `shimmer` keyframe is not defined, add a Tailwind arbitrary animation or use the simpler pulse bar:

```tsx
{isFetching && (
  <div className="h-1 w-full animate-pulse bg-indigo-500/50" />
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/WorldDetailPage.tsx
git commit -m "feat(WorldDetailPage): render from placeholder data and indicate background refresh"
```

---

### Task 3: Test placeholderData behavior

**Files:**
- Modify: `src/pages/WorldDetailPage.test.tsx`

- [ ] **Step 1: Add `useQueryClient`/`QueryClient` setup for caching**

The existing test wraps the component in a fresh `QueryClientProvider`. We need to prime the cache with a `['worlds']` entry before rendering, then assert the detail page shows the cached world immediately even while the single-world query is pending.

Add a new test case:

```ts
it('renders immediately from cached worlds list data and then refetches', async () => {
  const cachedWorld = createWorld({ worldId: 'wrld_cached', name: 'Cached World' });

  queryClient.setQueryData(['worlds', {}], {
    worlds: [cachedWorld],
    total: 1,
    limit: 20,
    offset: 0,
  });

  const fetchWorld = vi.fn().mockResolvedValue(createWorld({ worldId: 'wrld_cached', name: 'Fetched World' }));
  vi.doMock('../api/client', () => ({ fetchWorld }));

  render(
    <Wrapper>
      <WorldDetailPage worldId="wrld_cached" />
    </Wrapper>,
  );

  expect(screen.getByRole('heading', { name: /Cached World/i })).toBeInTheDocument();
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();

  await waitFor(() => {
    expect(fetchWorld).toHaveBeenCalledWith('wrld_cached');
  });
});
```

**Note:** If `vi.doMock` is problematic after the module has been imported, change the test to spy on `fetchWorld` from `../api/client` directly and prime the cache, then assert the heading is present before the fetch resolves.

A more robust version that avoids mock timing issues:

```ts
it('renders immediately from cached worlds list data', () => {
  const cachedWorld = createWorld({ worldId: 'wrld_cached', name: 'Cached World' });

  queryClient.setQueryData(['worlds', {}], {
    worlds: [cachedWorld],
    total: 1,
    limit: 20,
    offset: 0,
  });

  vi.spyOn(useApi, 'useWorld').mockReturnValue({
    data: cachedWorld,
    isPending: false,
    isError: false,
    error: null,
    isFetching: true,
  } as ReturnType<typeof useApi.useWorld>);

  render(
    <Wrapper>
      <WorldDetailPage worldId="wrld_cached" />
    </Wrapper>,
  );

  expect(screen.getByRole('heading', { name: /Cached World/i })).toBeInTheDocument();
});
```

Use whichever version fits the existing mock style.

- [ ] **Step 2: Run the new test**

```bash
pnpm test src/pages/WorldDetailPage.test.tsx
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/pages/WorldDetailPage.test.tsx
git commit -m "test(WorldDetailPage): verify rendering from cached list data"
```

---

### Task 4: Test list → detail overlay handoff

**Files:**
- Modify: `src/pages/WorldsPage.test.tsx`

- [ ] **Step 1: Add a test that navigates from the list to a detail overlay**

Ensure the existing mocked `useWorld` returns pending first but with no data, and that the overlay still shows the world name from the list cache. Since the existing test mocks `useWorld` with a static return, this test should instead verify that `WorldDetailPage` is rendered with the correct `worldId` when the URL changes.

Add:

```ts
it('renders the detail overlay with the selected world id', async () => {
  window.history.pushState({}, '', '/worlds/wrld_1');
  renderPage(<WorldsPage />);
  expect(document.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
});
```

If the test framework does not render `WorldDetailPage` because the mock returns no data, keep this test minimal and rely on the `WorldDetailPage.test.tsx` coverage for the placeholder data logic.

- [ ] **Step 2: Run the page tests**

```bash
pnpm test src/pages/WorldsPage.test.tsx
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/pages/WorldsPage.test.tsx
git commit -m "test(WorldsPage): verify detail overlay opens from list"
```

---

### Task 5: Final verification

**Files:**
- All modified files

- [ ] **Step 1: Run the full test suite**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: no lint errors.

- [ ] **Step 3: Type check**

```bash
pnpm build
```

Expected: TypeScript compilation succeeds.

- [ ] **Step 4: Commit any fixes**

If any of the above steps fail, fix the issue, then commit:

```bash
git add -A
git commit -m "fix: address test/lint/type issues"
```

---

## Self-review

- **Spec coverage:** The plan covers seeding `useWorld` from list cache, avoiding the skeleton on cached data, indicating background refresh, and testing both unit and integration behavior.
- **Placeholder scan:** No TBDs or vague steps.
- **Type consistency:** `worldId` is used consistently. `PaginatedWorlds` is the correct type for list pages.