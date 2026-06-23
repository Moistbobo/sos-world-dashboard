# List View Mobile Width Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make world list items fit the full width of the screen on mobile, preventing horizontal overflow/rendering off-screen.

**Architecture:** The list view in `WorldsPage.tsx` uses `w-full` on each item row, but the parent `<div className="space-y-3">` has no width constraints. Combined with long tag and quality text that is hidden on small screens, content can force the item wider than the viewport. The fix is to ensure the list container itself is constrained to the viewport width (`w-full min-w-0`) and that flex children shrink/truncate properly so the row never exceeds the screen.

**Tech Stack:** React, Tailwind CSS, Vitest, Testing Library

---

### Task 1: Constrain list view width on mobile

**Files:**
- Modify: `src/pages/WorldsPage.tsx`
- Test: `src/pages/WorldsPage.test.tsx`

- [ ] **Step 1: Write the failing test**

Add a test that switches to list view and asserts the list container has `w-full` and `min-w-0` classes.

```tsx
it('renders list items within the full container width', () => {
  render(<WorldsPage />, { wrapper: Wrapper });
  const listButton = screen.getByRole('button', { name: /switch to list/i });
  fireEvent.click(listButton);

  const listContainer = document.querySelector('.space-y-3.w-full.min-w-0');
  expect(listContainer).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- --run src/pages/WorldsPage.test.tsx`

Expected: FAIL — `expected element to be in the document` (selector `.space-y-3.w-full.min-w-0` not found)

- [ ] **Step 3: Add width constraints to the list container and row children**

In `src/pages/WorldsPage.tsx`, update the list container and row elements:

1. Change the list wrapper from `<div className="space-y-3">` to `<div className="space-y-3 w-full min-w-0">`.
2. On each row `<button>`, ensure it also has `min-w-0` (it already has `w-full`, but adding `min-w-0` lets flex children shrink below their intrinsic size).
3. Wrap the visible text/metadata sections so truncation is preserved and child text does not force the row wider than the viewport. The existing `truncate` classes help, but the parent chain must allow shrinking.

```tsx
<div className="space-y-3 w-full min-w-0">
  {worlds.map((w) => (
    <button
      key={w.worldId}
      onClick={() => navigate(`/worlds/${w.worldId}`)}
      className="card flex w-full min-w-0 items-center gap-4 p-3 text-left transition hover:border-slate-400 dark:hover:border-slate-600"
    >
      ...
    </button>
  ))}
</div>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- --run src/pages/WorldsPage.test.tsx`

Expected: PASS

- [ ] **Step 5: Run the full test suite**

Run: `pnpm test -- --run`

Expected: All tests pass

- [ ] **Step 6: Verify build and lint**

Run: `pnpm run lint && pnpm run build`

Expected: both succeed

- [ ] **Step 7: Commit**

```bash
git add src/pages/WorldsPage.tsx src/pages/WorldsPage.test.tsx
git commit -m "fix(worlds): make list view items fit mobile screen width"
```
