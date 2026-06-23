# List View Mobile Width Fix Completion Summary

**Ticket:** The "list" view on the worlds screen renders off-screen on mobile.

**Root cause:** The list container in `WorldsPage.tsx` used only `space-y-3`, and each row used `flex w-full`. A flex child with text content that doesn't shrink below its intrinsic width can overflow its parent on narrow viewports, pushing the row off-screen.

**Fix:** Added `w-full min-w-0` to the list container and `min-w-0` to each list row. This lets the flex items shrink properly and prevents the row from exceeding the viewport width on mobile.

**Files touched:**
- `src/pages/WorldsPage.tsx` — list container and row classes
- `src/pages/WorldsPage.test.tsx` — added regression test

**Tests added:**
- `renders list items within the full container width`

**Verification:**
- `pnpm test -- --run` — 13/13 tests passed
- `pnpm run lint` — clean
- `pnpm run build` — successful

**Branch:** `fix/list-view-mobile`
**Worktree:** `/Users/mrbobo/.config/superpowers/worktrees/sos-world-dashboard/fix-list-view-mobile`
