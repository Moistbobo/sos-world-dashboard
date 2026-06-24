# Completion: Reuse world list data for detail view

## What was built

Implemented the TanStack Query `placeholderData` pattern so that the world detail view can render immediately from cached worlds list data when navigating from the Worlds page. The single-world API still fires in the background to refresh/append detail data, and the UI now indicates when a background refresh is in flight.

## Files touched

- `src/hooks/useApi.ts` — Added `useQueryClient` and `placeholderData` to `useWorld`. The placeholder searches both paginated (`['worlds']`) and infinite (`['worlds-infinite']`) query caches for a matching `worldId`, preferring the paginated cache.
- `src/pages/WorldDetailPage.tsx` — Changed pending/error guards to keep rendering when cached data exists; added a thin shimmer loading bar for background fetches and a non-blocking refresh error banner.
- `src/index.css` — Added the `shimmer` keyframe animation used by the refresh indicator.
- `src/i18n/locales/en.json` — Added `worldDetail.refreshError` translation.
- `src/i18n/locales/ja.json` — Added Japanese translation for `worldDetail.refreshError`.
- `src/hooks/useApi.test.tsx` (new) — Hook-level tests covering placeholder data from paginated cache, placeholder data from infinite cache, cache precedence, and disabled-state behavior.
- `src/pages/WorldDetailPage.test.tsx` — Added tests for the refresh indicator and for rendering cached content with a background fetch error.
- `src/pages/WorldsPage.test.tsx` — Added `useWorld` to the module mock and added a test verifying the detail overlay renders when a world id is in the URL.

## Tests added

- `useWorld` returns cached data from paginated `['worlds']` query while fetching in background.
- `useWorld` returns cached data from infinite `['worlds-infinite']` query.
- `useWorld` prefers paginated cache over infinite cache when both contain the world.
- `WorldDetailPage` shows the shimmer loading bar while data is present and `isFetching` is true.
- `WorldDetailPage` renders cached content with a refresh error banner when the background fetch fails.
- `WorldsPage` renders the detail overlay when the URL contains a world id.

## Verification run

```bash
pnpm test        # 70/70 tests passed
pnpm lint        # 0 errors, 0 warnings
pnpm build       # TypeScript compile + Vite build succeeded
```

## Known limitations / follow-ups

- The current `World` type from the list API covers all fields rendered in the detail view. If the single-world API later returns additional fields not present in the list response, the placeholder type should be updated and the detail UI should display the enriched fields once the background fetch completes.
- The shimmer animation is defined globally in `index.css`; if more indeterminate progress bars are added later, consider extracting a reusable `LoadingBar` component.
