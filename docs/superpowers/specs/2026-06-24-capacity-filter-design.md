---
title: "[FEAT] Add filtering by max player count (capacity range) on /worlds"
labels: enhancement
type: Feature
effort: M
---

## What

The `/worlds` page currently lets users filter by **tag** and **quality**. Users also want to filter worlds by **player capacity**, i.e. the maximum number of players a world supports. VRChat worlds currently support **1–80 players**.

This spec covers both the frontend filtering UI and the backend API contract changes needed to support it.

- **Related:** `src/pages/WorldsPage.tsx`, `src/components/FilterBar.tsx`, `src/hooks/useApi.ts`, `src/api/client.ts`
- **API endpoint:** `GET /api/worlds`

## Why

Capacity is one of the most useful discovery criteria for VRChat worlds. A user hosting a small hangout needs different worlds than someone throwing a large event. Without capacity filtering, users must open each world detail page individually.

## Design

### UI/UX

Add a **player capacity range filter** inside the existing `FilterBar` expandable panel, positioned between the **Quality** and **Tags** sections.

- **Range:** 1–80 players, matching VRChat's current world capacity limits.
- **Control:** dual-handle range slider plus two number inputs for precise min/max entry.
- **Default:** no filter applied (full 1–80 range). When the user moves a handle or edits an input, the filter becomes active.
- **Active state:** when capacity is filtered, show a chip in the collapsed `FilterBar` header (e.g. "1–40 players").
- **Reset behavior:** changing capacity filters resets the infinite/paginated list to the first page, consistent with tag and quality changes.

### Data model

The existing `World` type already has:

```ts
interface World {
  worldId: string;
  name: string;
  capacity: number; // already present
  // ...
}
```

No schema changes are needed. The `capacity` field is a plain integer.

### API requirements (for backend team)

The `GET /api/worlds` endpoint must accept two new optional query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `minCapacity` | integer, optional | Minimum world capacity to include (inclusive). Must be ≥ 1. |
| `maxCapacity` | integer, optional | Maximum world capacity to include (inclusive). Must be ≤ 80. |

**Validation rules:**

- If only `minCapacity` is provided, return worlds where `capacity >= minCapacity`.
- If only `maxCapacity` is provided, return worlds where `capacity <= maxCapacity`.
- If both are provided, return worlds where `minCapacity <= capacity <= maxCapacity`.
- If `minCapacity > maxCapacity`, return **400 Bad Request** with a clear error message.
- Values outside the valid range (`minCapacity < 1` or `maxCapacity > 80`) should be clamped or rejected (recommendation: clamp with a warning header, or reject with 400).
- Invalid non-integer values should return **400 Bad Request**.

**Behavior with existing filters:**

- `minCapacity`/`maxCapacity` must compose with existing `tag`, `quality`, and `search` query params using AND logic.
- The `total` count in the response must reflect the combined filter set.
- Pagination (`offset`/`limit`) must apply after filtering.

**Example request:**

```
GET /api/worlds?minCapacity=10&maxCapacity=40&quality=good&limit=20&offset=0
```

**Example response shape** (unchanged):

```json
{
  "worlds": [ /* worlds with capacity between 10 and 40, quality good */ ],
  "total": 128
}
```

### Frontend changes

1. **Update `src/api/client.ts`**
   - Add `minCapacity` and `maxCapacity` to the `fetchWorlds` request params.

2. **Update `src/hooks/useApi.ts`**
   - Thread `minCapacity`/`maxCapacity` through `useWorlds` and `useInfiniteWorlds` query keys and requests.

3. **Update `src/components/FilterBar.tsx`**
   - Add capacity section with dual-handle slider and min/max inputs.
   - Add `onCapacityChange` prop interface.
   - Show active capacity chip in collapsed header.
   - Include "clear all" behavior for capacity.

4. **Update `src/pages/WorldsPage.tsx`**
   - Add `minCapacity`/`maxCapacity` state, seeded from URL query params.
   - Sync state back to URL (`minCapacity`, `maxCapacity`).
   - Reset list on capacity change.
   - Pass capacity values to `FilterBar` and API hooks.

5. **i18n**
   - Add new translation keys for English and Japanese:
     - `filter.capacity`
     - `filter.minCapacity`
     - `filter.maxCapacity`
     - `filter.players` (or equivalent suffix)

6. **Testing**
   - Unit tests for `FilterBar` capacity interactions (input changes, slider changes, chip display).
   - `WorldsPage` tests verifying URL sync and query reset behavior.
   - API client tests for param serialization.
   - Build and lint must pass.

## Acceptance criteria

- [ ] Users can select a capacity range of 1–80 via slider and number inputs on `/worlds`.
- [ ] Active capacity range is shown as a chip in the `FilterBar` header.
- [ ] URL query params `minCapacity` and `maxCapacity` reflect the selected range.
- [ ] Page loads from a URL containing `minCapacity`/`maxCapacity` and applies the filter.
- [ ] Changing capacity resets both infinite scroll and pagination to the first page.
- [ ] `GET /api/worlds` supports `minCapacity` and `maxCapacity` query params.
- [ ] API returns correct filtered `total` and composes with `tag`, `quality`, and `search`.
- [ ] Invalid capacity params return 400 Bad Request.
- [ ] New i18n keys added for `en.json` and `ja.json`.
- [ ] `pnpm lint`, `pnpm test`, and `pnpm build` pass.

## Out of scope

- Server-side capacity aggregation endpoints.
- Filtering on other capacity-like fields (e.g. recommended or current occupancy).
- Saving capacity filter preference to localStorage.
- Mobile-specific slider interactions beyond standard touch behavior.

## Open questions

1. Should the slider step be 1 player, or larger steps (e.g. 5) for easier dragging?
2. Should we expose small/medium/large preset chips in addition to the range?
3. Does the backend want to clamp out-of-range values or reject them with 400?

## Notes

- The backend must support `minCapacity`/`maxCapacity` before this feature is fully functional in production. The frontend can be developed against mocked or testnet data in parallel.
- Coordinate deployment with the API team so testnet and production backends expose the new params at the same time the frontend ships.
