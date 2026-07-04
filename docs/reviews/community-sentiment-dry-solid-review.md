# Community Sentiment PR Review: DRY & SOLID

**PR:** #93 — `[FEAT]: add Supabase-backed community sentiment (ratings and comments)`  
**Branch:** `15-community-sentiment`  
**Review date:** 2026-07-04  
**Scope:** Focused on DRY and SOLID principles across the new community-sentiment code.

---

## 1. Executive Summary

The community sentiment feature is structurally sound and follows the project's existing conventions (co-located components/tests, TanStack Query, i18next, lazy loading). The PR correctly links to issues #15, #16, #17, and #18.

This review found several **DRY** and **SRP** opportunities in the API layer, hooks, and component markup. Most were non-blocking and have been refactored in place. One **functional gap** remains: the username generator is still a stub and does not satisfy issue #17's acceptance criteria.

### Verdict after fixes

- ✅ `pnpm lint` clean
- ✅ `pnpm test` passing (213 tests)
- ✅ `pnpm build` succeeds
- 💬 One non-blocking functional gap remains (AdjectiveAnimal usernames).

---

## 2. DRY Findings

### 2.1 `MAX_LENGTH` duplicated between validation and form

**Before:**

```ts
// src/utils/commentValidation.ts
const MAX_LENGTH = 256;

// src/components/sentiment-comment-form/SentimentCommentForm.tsx
const MAX_LENGTH = 256;
```

**Smell:** The same business rule (256-character limit) was authored in two places. A future change to the limit would require editing both files and risks the UI counter disagreeing with the validator.

**Applied fix:** `MAX_LENGTH` is now exported from `commentValidation.ts` and imported by `SentimentCommentForm.tsx`.

---

### 2.2 Inline `formatTimestamp` inside `SentimentCommentList`

**Before:** `SentimentCommentList.tsx` contained `weekdays`, `pad`, and `formatTimestamp` logic directly in the component file. Date formatting is a generic concern, not a comment-list concern.

**Applied fix:** Extracted `formatTimestamp` and its helpers to `src/utils/formatTimestamp.ts` and imported it.

---

### 2.3 Rating mutation lifecycle boilerplate

**Before:** `useSubmitRating`, `useUpdateRating`, and `useDeleteRating` each repeated the same TanStack Query lifecycle:

- `queryClient.cancelQueries({ queryKey: ['ratings', worldId] })`
- `queryClient.getQueryData<RatingSummary>(queryKey)`
- `queryClient.setQueryData(queryKey, next)`
- rollback on error
- `invalidateQueries` on settled

**Applied fix:** Introduced a private `useRatingMutation` factory in `src/hooks/useSentiment.ts`. Each rating hook now only supplies its `mutationFn` and the optimistic-update calculation. The shared lifecycle is centralized.

---

### 2.4 Captcha try/catch repeated in `SentimentSection`

**Before:** Three handlers (`handleRate`, `handleRemove`, `handleComment`) each had identical error-handling shape:

```ts
try {
  const captchaToken = await getCaptchaToken();
  await someMutation.mutateAsync(...);
} catch (err) {
  if (isCaptchaCancelled(err)) return;
  toast.error(t(errorKey, { message: (err as Error).message }));
}
```

**Applied fix:** Extracted a local `withCaptcha` helper that wraps an action, obtains the token, and applies the captcha-cancelled/error-toast logic once.

---

### 2.5 Duplicated percentage-bar markup in `SentimentRating`

**Before:** The good and bad bar segments were two near-identical blocks of JSX with mirrored color classes (`bg-emerald-500`/`bg-rose-500`, `text-emerald-800`/`text-rose-800`).

**Applied fix:** Added a small `BarSegment` presentational component inside `SentimentRating.tsx`. Each segment is now rendered declaratively with props.

---

## 3. SOLID Findings

### 3.1 SRP — `SentimentCommentList` mixed presentation and formatting

**Observation:** The component was responsible for sorting comments, rendering the list, rendering the current-user indicator, *and* formatting timestamps.

**Applied fix:** Moved timestamp formatting to `src/utils/formatTimestamp.ts`. The remaining component responsibilities (sorting, rendering, user highlighting) are still in one file but the formatting concern is now separate and reusable.

**Recommended follow-up:** Consider extracting `AuthorLabel` to its own component file if it grows (e.g., avatars, badges, moderation controls).

---

### 3.2 SRP — `SentimentRating` mixed bar geometry with click handling

**Observation:** The component computed percentages, rendered bar fills, rendered percentage labels, and handled click/toggle logic in one large JSX block.

**Applied fix:** Extracted `BarSegment` so the bar-fill/label rendering has its own unit. Click handling and state derivation remain in the main component.

---

### 3.3 SRP — `useSentiment.ts` rating hooks each owned the full mutation lifecycle

**Observation:** Each rating mutation hook knew both *what* it was doing (submit/update/delete) and *how* to manage the shared query-cache lifecycle.

**Applied fix:** `useRatingMutation` owns the shared lifecycle. The individual hooks own only their optimistic-update calculation.

---

### 3.4 OCP — `SentimentSection` handlers were open for new mutations but required copy/paste

**Observation:** Adding a fourth write action (e.g., edit comment, report comment) would have required copying the same captcha/error pattern again.

**Applied fix:** `withCaptcha` centralizes the pattern, so future write actions only need to supply their mutation call and error key.

---

### 3.5 DIP — No abstraction between the UI and Supabase auth

**Observation:** `src/api/sentiment.ts` calls `supabase.auth.signInAnonymously` directly. This is acceptable for the current app size because `src/lib/supabase.ts` is the single concrete dependency. However, if the project later swaps auth providers or adds an abstraction layer, every API function would need editing.

**Recommendation:** Keep an eye on this as the feature grows. If more Supabase auth calls appear, extract a thin `AnonymousAuthService` interface so the sentiment API depends on an abstraction rather than the concrete client.

---

## 4. Functional Gap (Non-blocking)

### 4.1 Username generator is a stub

`src/utils/username.ts` currently returns a hard-coded string:

```ts
export function generateUsername(): string {
  return 'Anonymous';
}
```

Issue #17 explicitly requires a deterministic **AdjectiveAnimal** username generator with:

- Stable output per anonymous identity
- Large word list to avoid collisions
- Unit tests for determinism and collision resistance

The current implementation does **not** satisfy these acceptance criteria. All comments will show the same display name, which undermines the goal of friendly, recognizable attribution.

**Recommendation:** Implement the deterministic generator in a follow-up commit before closing #17. Do not close issue #17 until this is done.

---

## 5. Other Notable Observations

### 5.1 Optimistic comment username mismatch

`useSubmitComment` calls `generateUsername()` for the optimistic comment. Once the generator is implemented, this will produce a stable name for the current identity. Today it returns `'Anonymous'` for every optimistic comment, matching the persisted value but not the intended UX.

### 5.2 `VITE_SUPABASE_PUBLISHABLE_KEY` vs. `VITE_SUPABASE_ANON_KEY`

The issue description uses `VITE_SUPABASE_ANON_KEY`, but the code uses `VITE_SUPABASE_PUBLISHABLE_KEY`. The `.env.example` has been updated to match the code. This is consistent internally; update the issue text or docs if you want to standardize on one name.

### 5.3 `useSubmitRating` optimistic update is defensive beyond its call site

`useSubmitRating` handles both "new vote" and "switch vote" in its optimistic update, even though `SentimentSection` only calls it when there is no existing rating. This defensive logic is harmless but could be simplified once the contract is trusted.

---

## 6. Files Changed During Review

| File | Change |
|------|--------|
| `src/utils/commentValidation.ts` | Exported `MAX_LENGTH` |
| `src/components/sentiment-comment-form/SentimentCommentForm.tsx` | Imported shared `MAX_LENGTH`, removed local constant |
| `src/utils/formatTimestamp.ts` | **New** — extracted timestamp formatter |
| `src/utils/formatTimestamp.test.ts` | **New** — unit tests for the formatter |
| `src/components/sentiment-comment-list/SentimentCommentList.tsx` | Imported `formatTimestamp`, removed inline helpers |
| `src/hooks/useSentiment.ts` | Added `useRatingMutation` factory, refactored three rating hooks |
| `src/components/sentiment-section/SentimentSection.tsx` | Added `withCaptcha` helper, refactored three handlers |
| `src/components/sentiment-rating/SentimentRating.tsx` | Added `BarSegment` component, removed duplicated bar markup |

---

## 7. Recommendations for Follow-up

1. **Implement `generateUsername`** as a deterministic AdjectiveAnimal generator with a large, curated word list and comprehensive unit tests.
2. ~~Add a unit test for `formatTimestamp`~~ **Done** — added `src/utils/formatTimestamp.test.ts`.
3. **Consider a generic optimistic-update helper** for `useSubmitComment` if more mutations follow the same pattern.
4. **Monitor auth coupling** in `src/api/sentiment.ts`; introduce an abstraction if the auth surface grows beyond `ensureAnonymousUser`.

---

## 8. Checklist

- [x] PR is linked to the correct issues (#15, #16, #17, #18)
- [x] DRY violations identified and refactored
- [x] SOLID principles applied (SRP, OCP, DIP noted)
- [x] `pnpm lint` passes
- [x] `pnpm test` passes
- [x] `pnpm build` passes
- [x] Username generator gap documented for follow-up
- [x] `formatTimestamp` utility extracted and unit-tested
