# Show Supported Platforms on WorldCard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the world's supported platforms as small chips inside `WorldCard`, using the same `getPlatformLabel` mapping already applied to the detail and list views.

**Architecture:** Reuse the existing `getPlatformLabel` helper. Add a compact platform chip row between the metadata row and the tags row in `WorldCard`. Create a focused unit test for `WorldCard` that verifies mapped platform labels render.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, React Testing Library, i18next.

---

## File map

- **Modify** `src/components/WorldCard.tsx` — add platform chips.
- **Create** `src/components/WorldCard.test.tsx` — unit tests for `WorldCard` including platforms.

---

### Task 1: Add platform chips to WorldCard

**Files:**
- Modify: `src/components/WorldCard.tsx`

- [ ] **Step 1: Import the platform helper**

```ts
import { getPlatformLabel } from '../utils/platformLabel';
```

- [ ] **Step 2: Add platform chip row**

Insert a new flex container after the metadata row (`Users`/`Calendar`) and before the tags row:

```tsx
        <div className="mt-3 flex flex-wrap gap-1">
          {world.platforms.map((p) => (
            <span
              key={p}
              className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {getPlatformLabel(p)}
            </span>
          ))}
        </div>
```

- [ ] **Step 3: Verify existing tests still pass**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/WorldCard.tsx
git commit -m "feat(worldCard): display supported platforms as chips"
```

---

### Task 2: Add unit tests for WorldCard

**Files:**
- Create: `src/components/WorldCard.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorldCard } from './WorldCard';

const mockWorld = {
  worldId: 'wrld_test',
  name: 'Test World',
  authorName: 'Tester',
  capacity: 40,
  platforms: ['standalonewindows', 'android', 'ios'],
  tags: ['chill'],
  imageUrl: '',
  vrchatUrl: 'https://vrchat.com/home/world/wrld_test',
  quality: 'good' as const,
  createdAt: '2024-01-01',
};

describe('WorldCard', () => {
  it('renders world name and author', () => {
    render(<WorldCard world={mockWorld} />);
    expect(screen.getByText('Test World')).toBeInTheDocument();
    expect(screen.getByText(/by Tester/)).toBeInTheDocument();
  });

  it('renders mapped platform chips', () => {
    render(<WorldCard world={mockWorld} />);
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('android')).toBeInTheDocument();
    expect(screen.getByText('iOS')).toBeInTheDocument();
  });

  it('calls onSelect when the card is clicked', () => {
    const onSelect = vi.fn();
    render(<WorldCard world={mockWorld} onSelect={onSelect} />);
    screen.getByLabelText(/Details - Test World/).click();
    expect(onSelect).toHaveBeenCalledWith('wrld_test');
  });
});
```

- [ ] **Step 2: Run the new tests**

```bash
pnpm test src/components/WorldCard.test.tsx
```

Expected: 3 passing tests.

- [ ] **Step 3: Commit**

```bash
git add src/components/WorldCard.test.tsx
git commit -m "test(worldCard): add tests including mapped platform labels"
```

---

### Task 3: Final verification

- [ ] **Step 1: Run full test suite**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: clean.

- [ ] **Step 3: Run build**

```bash
pnpm build
```

Expected: succeeds.

---

## Self-review

**Spec coverage:**
- Platforms displayed on WorldCard: Task 1 ✅
- Uses existing `getPlatformLabel` mapping: Task 1 ✅
- Test coverage for platform chips: Task 2 ✅

**Placeholder scan:** No placeholders. Each step includes concrete code and commands.

**Type consistency:** `WorldCardProps` unchanged; platforms remain `string[]`.
