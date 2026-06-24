# Map Platform Values to Readable Labels — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small platform display helper that maps raw upstream platform strings to readable labels, and use it in both the world list and world detail views.

**Architecture:** A pure utility function (`getPlatformLabel`) will live alongside existing tag utilities. Known values get fixed readable labels; empty strings fall back to `Unknown`; any unexpected non-empty value is returned raw so useful metadata (e.g. Unity build strings) is not discarded. Components import the helper and transform `World.platforms` at render time, leaving the underlying `string[]` type untouched.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, React Testing Library, i18next (helper labels are hardcoded English for now; i18n extension noted as future work).

---

## File map

- **Create** `src/utils/platformLabel.ts` — platform label mapping helper.
- **Create** `src/utils/platformLabel.test.ts` — unit tests for the helper.
- **Modify** `src/pages/WorldDetailPage.tsx` — render mapped labels in the platforms section.
- **Modify** `src/pages/WorldsPage.tsx` — render mapped labels in the list view subtitle.
- **Modify** `src/pages/WorldsPage.test.tsx` — add a list-view integration assertion that mapping is applied.

---

### Task 1: Create the platform label helper

**Files:**
- Create: `src/utils/platformLabel.ts`

- [ ] **Step 1: Write the helper**

```ts
const PLATFORM_LABELS: Record<string, string> = {
  standalonewindows: 'Desktop',
  android: 'android',
  ios: 'iOS',
  web: 'web',
};

/**
 * Map a raw platform value from the API to a readable display label.
 * - Empty string -> "Unknown"
 * - Known values -> fixed readable labels
 * - Everything else -> raw value (preserves info like Unity build strings)
 */
export function getPlatformLabel(platform: string): string {
  if (platform === '') {
    return 'Unknown';
  }
  return PLATFORM_LABELS[platform] ?? platform;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/platformLabel.ts
git commit -m "feat(platform): add getPlatformLabel helper"
```

---

### Task 2: Write unit tests for the helper (TDD)

**Files:**
- Create: `src/utils/platformLabel.test.ts`

- [ ] **Step 1: Write the failing test file**

```ts
import { describe, it, expect } from 'vitest';
import { getPlatformLabel } from './platformLabel';

describe('getPlatformLabel', () => {
  it('maps known platform values to readable labels', () => {
    expect(getPlatformLabel('standalonewindows')).toBe('Desktop');
    expect(getPlatformLabel('android')).toBe('android');
    expect(getPlatformLabel('ios')).toBe('iOS');
    expect(getPlatformLabel('web')).toBe('web');
  });

  it('renders empty string as Unknown', () => {
    expect(getPlatformLabel('')).toBe('Unknown');
  });

  it('falls back to the raw value for unexpected inputs', () => {
    expect(getPlatformLabel('unknownplatform')).toBe('unknownplatform');
    expect(getPlatformLabel('2019.2.4-801-Release')).toBe('2019.2.4-801-Release');
  });
});
```

- [ ] **Step 2: Run the helper tests to confirm they pass**

```bash
pnpm test src/utils/platformLabel.test.ts
```

Expected: 3 passing tests.

- [ ] **Step 3: Commit**

```bash
git add src/utils/platformLabel.test.ts
git commit -m "test(platform): cover getPlatformLabel mapping and fallbacks"
```

---

### Task 3: Use the helper in WorldDetailPage

**Files:**
- Modify: `src/pages/WorldDetailPage.tsx`

- [ ] **Step 1: Add the import**

At the top of `src/pages/WorldDetailPage.tsx`, add:

```ts
import { getPlatformLabel } from '../utils/platformLabel';
```

- [ ] **Step 2: Map platform labels in the platforms section**

Locate this block:

```tsx
<div className="flex flex-wrap gap-2">
  {w.platforms.map((p) => (
    <span
      key={p}
      className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
    >
      {p}
    </span>
  ))}
</div>
```

Change the inner text to use the helper:

```tsx
<div className="flex flex-wrap gap-2">
  {w.platforms.map((p) => (
    <span
      key={p}
      className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
    >
      {getPlatformLabel(p)}
    </span>
  ))}
</div>
```

- [ ] **Step 3: Run the relevant tests**

```bash
pnpm test
```

Expected: full suite still passes.

- [ ] **Step 4: Commit**

```bash
git add src/pages/WorldDetailPage.tsx
git commit -m "feat(worldDetail): map platform labels via getPlatformLabel"
```

---

### Task 4: Use the helper in WorldsPage list view

**Files:**
- Modify: `src/pages/WorldsPage.tsx`
- Modify: `src/pages/WorldsPage.test.tsx`

- [ ] **Step 1: Add the import**

At the top of `src/pages/WorldsPage.tsx`, add:

```ts
import { getPlatformLabel } from '../utils/platformLabel';
```

- [ ] **Step 2: Map platform labels in the list view subtitle**

Locate:

```tsx
{t('common.byAuthor', { author: w.authorName || t('common.unknown') })} · {w.capacity}{' '}
capacity · {w.platforms.join(', ')}
```

Change to:

```tsx
{t('common.byAuthor', { author: w.authorName || t('common.unknown') })} · {w.capacity}{' '}
capacity · {w.platforms.map(getPlatformLabel).join(', ')}
```

- [ ] **Step 3: Update the list-view integration test**

In `src/pages/WorldsPage.test.tsx`, change the mock world's `platforms` to include a known raw value and add an assertion:

Change:

```ts
platforms: ['PC', 'Quest'],
```

To:

```ts
platforms: ['standalonewindows', 'android'],
```

Add a new test inside the main `describe('WorldsPage', ...)` block:

```ts
  it('renders mapped platform labels in list view', () => {
    render(<WorldsPage />, { wrapper: Wrapper });
    expect(screen.getByText('Desktop, android')).toBeInTheDocument();
  });
```

- [ ] **Step 4: Run the WorldsPage tests**

```bash
pnpm test src/pages/WorldsPage.test.tsx
```

Expected: all WorldsPage tests pass, including the new mapped-label assertion.

- [ ] **Step 5: Commit**

```bash
git add src/pages/WorldsPage.tsx src/pages/WorldsPage.test.tsx
git commit -m "feat(worlds): map platform labels in list view and add integration test"
```

---

### Task 5: Final verification

- [ ] **Step 1: Run the full test suite**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: no errors or warnings.

- [ ] **Step 3: Run TypeScript check**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 4: Commit any fixes**

If any lint/type issues were found, fix them and commit.

---

## Self-review

**Spec coverage:**
- `standalonewindows` → `Desktop`: Task 2 test + Task 3/4 usage ✅
- `android` → `android`: Task 2 test + Task 4 integration test ✅
- `ios` → `iOS`: Task 2 test ✅
- `web` → `web`: Task 2 test ✅
- `''` → `Unknown`: Task 2 test ✅
- Unknown values fall back to raw value consistently: Task 2 test ✅
- Mapping applied in world list and detail views: Tasks 3 & 4 ✅
- Unit tests cover helper: Task 2 ✅

**Placeholder scan:** No TBD/TODO/fill-in-later statements. Every step shows concrete code or commands.

**Type consistency:** `World.platforms` stays `string[]`; helper input/output is `string` → `string` throughout.
