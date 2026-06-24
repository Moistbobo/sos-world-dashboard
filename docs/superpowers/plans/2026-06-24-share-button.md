# Share Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a clipboard share action with `sonner` toasts on `WorldCard` and `WorldDetailPage`, plus i18n strings and tests.

**Architecture:** A reusable `ShareButton` component handles copy logic and toast feedback. `App.tsx` mounts a single `Toaster`. The card and detail page render the button with appropriate variants. Translations live under a new `share` namespace.

**Tech Stack:** React, TypeScript, Tailwind CSS, `lucide-react`, `sonner`, `react-i18next`, Vitest + React Testing Library.

---

### Task 1: Install `sonner`

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml` (via pnpm install)

- [ ] **Step 1: Add the dependency**

Run:
```bash
pnpm add sonner
```

- [ ] **Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add sonner for toast notifications"
```

---

### Task 2: Add i18n strings

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/ja.json`

- [ ] **Step 1: Add `share` namespace to English locale**

Insert after the `theme` object in `src/i18n/locales/en.json`:

```json
  "share": {
    "share": "Share",
    "success": "Link copied",
    "error": "Could not copy link"
  }
```

- [ ] **Step 2: Add `share` namespace to Japanese locale**

Insert after the `theme` object in `src/i18n/locales/ja.json`:

```json
  "share": {
    "share": "共有",
    "success": "リンクをコピーしました",
    "error": "リンクをコピーできませんでした"
  }
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/locales/en.json src/i18n/locales/ja.json
git commit -m "i18n: add share namespace for en and ja"
```

---

### Task 3: Mount `Toaster` in the app root

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Import `Toaster`**

```tsx
import { Toaster } from 'sonner';
```

- [ ] **Step 2: Render `Toaster` inside `BrowserRouter` but outside `Layout`**

Updated `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { WorldsPage } from './pages/WorldsPage';
import { TagsPage } from './pages/TagsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" richColors />
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/worlds" element={<WorldsPage />} />
          <Route path="/worlds/:worldId" element={<WorldsPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: mount sonner Toaster at app root"
```

---

### Task 4: Create the `ShareButton` component

**Files:**
- Create: `src/components/ShareButton.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { World } from '../types';

interface ShareButtonProps {
  world: World;
  iconOnly?: boolean;
}

export function ShareButton({ world, iconOnly = false }: ShareButtonProps) {
  const { t } = useTranslation();

  const handleShare = async (event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await navigator.clipboard.writeText(world.vrchatUrl);
      toast.success(t('share.success'));
    } catch {
      toast.error(t('share.error'));
    }
  };

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleShare}
        className="btn-secondary p-2 text-xs relative z-30"
        aria-label={t('share.share')}
        title={t('share.share')}
      >
        <Share2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="btn-secondary gap-2 text-sm"
    >
      <Share2 className="h-4 w-4" />
      {t('share.share')}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ShareButton.tsx
git commit -m "feat: add ShareButton component with clipboard and toast"
```

---

### Task 5: Add share button to `WorldCard`

**Files:**
- Modify: `src/components/WorldCard.tsx`

- [ ] **Step 1: Import `ShareButton`**

```tsx
import { ShareButton } from './ShareButton';
```

- [ ] **Step 2: Add icon-only share button next to Open in VRChat**

Replace the action container in `WorldCard.tsx`:

```tsx
        <div className="mt-auto pt-3 flex items-center justify-center gap-2">
          <a
            href={world.vrchatUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary px-4 py-2 text-xs font-medium relative z-30"
          >
            {t('worldDetail.openInVRChat')}
          </a>
          <ShareButton world={world} iconOnly />
        </div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/WorldCard.tsx
git commit -m "feat: add icon-only share button to WorldCard"
```

---

### Task 6: Add share button to `WorldDetailPage`

**Files:**
- Modify: `src/pages/WorldDetailPage.tsx`

- [ ] **Step 1: Import `ShareButton` and `Share2` icon**

```tsx
import { Share2 } from 'lucide-react';  // already imported icons line needs Share2 added
import { ShareButton } from '../components/ShareButton';
```

Update the existing import line from:
```tsx
import { ArrowLeft, Globe, Users, Calendar, ExternalLink, Hash } from 'lucide-react';
```
to:
```tsx
import { ArrowLeft, Globe, Users, Calendar, ExternalLink, Hash, Share2 } from 'lucide-react';
```

- [ ] **Step 2: Add share button next to Open in VRChat**

Replace the action container in the detail page:

```tsx
          <div className="mt-6 flex gap-3">
            <a
              href={w.vrchatUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary gap-2 text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              {t('worldDetail.openInVRChat')}
            </a>
            <ShareButton world={w} />
          </div>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/WorldDetailPage.tsx
git commit -m "feat: add share button to WorldDetailPage"
```

---

### Task 7: Update `WorldCard` tests

**Files:**
- Modify: `src/components/WorldCard.test.tsx`

- [ ] **Step 1: Write failing tests for share button rendering and click behavior**

Add inside the existing `WorldCard` test file after existing tests:

```tsx
  it('renders a share button that copies the VRChat URL', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const world = createWorld({ vrchatUrl: 'https://vrchat.com/home/world/wrld_123' });
    render(
      <TestWrapper>
        <WorldCard world={world} onSelect={vi.fn()} />
      </TestWrapper>,
    );

    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeInTheDocument();

    await userEvent.click(shareButton);

    expect(writeText).toHaveBeenCalledWith(world.vrchatUrl);
  });

  it('does not trigger card navigation when the share button is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const onSelect = vi.fn();
    const world = createWorld();
    render(
      <TestWrapper>
        <WorldCard world={world} onSelect={onSelect} />
      </TestWrapper>,
    );

    const shareButton = screen.getByRole('button', { name: /share/i });
    await userEvent.click(shareButton);

    expect(onSelect).not.toHaveBeenCalled();
  });
```

- [ ] **Step 2: Run the test file**

Run:
```bash
pnpm vitest run src/components/WorldCard.test.tsx
```

Expected: PASS after implementation.

- [ ] **Step 3: Commit**

```bash
git add src/components/WorldCard.test.tsx
git commit -m "test: verify WorldCard share button copies URL and stops propagation"
```

---

### Task 8: Add tests for `WorldDetailPage` share button

**Files:**
- Modify: `src/pages/WorldDetailPage.tsx` (already updated in Task 6)
- Create: `src/pages/WorldDetailPage.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorldDetailPage } from './WorldDetailPage';
import { TestWrapper } from '../test/test-utils';
import * as useApi from '../hooks/useApi';
import type { World } from '../types';

const createWorld = (overrides: Partial<World> = {}): World => ({
  worldId: 'wrld_123',
  name: 'Test World',
  authorName: 'Test Author',
  imageUrl: 'https://example.com/image.png',
  tags: [],
  platforms: ['pc'],
  capacity: 42,
  quality: 'good',
  createdAt: '2024-01-01T00:00:00Z',
  vrchatUrl: 'https://vrchat.com/home/world/wrld_123',
  ...overrides,
});

vi.spyOn(useApi, 'useWorld');

describe('WorldDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a share button that copies the VRChat URL', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    vi.mocked(useApi.useWorld).mockReturnValue({
      data: createWorld(),
      isPending: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useApi.useWorld>);

    render(
      <TestWrapper>
        <WorldDetailPage worldId="wrld_123" />
      </TestWrapper>,
    );

    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeInTheDocument();

    await userEvent.click(shareButton);

    expect(writeText).toHaveBeenCalledWith('https://vrchat.com/home/world/wrld_123');
  });
});
```

- [ ] **Step 2: Run the new test file**

Run:
```bash
pnpm vitest run src/pages/WorldDetailPage.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/WorldDetailPage.test.tsx
git commit -m "test: verify WorldDetailPage share button copies URL"
```

---

### Task 9: Full verification

- [ ] **Step 1: Run the full test suite**

Run:
```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 2: Run lint and typecheck**

Run:
```bash
pnpm lint
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit if any fixes were needed**

If no fixes were needed, no commit is required.

---

## Self-review

- **Spec coverage:** Every acceptance criterion in issue #36 is represented: `sonner` dependency (Task 1), i18n (Task 2), `Toaster` (Task 3), `ShareButton` component (Task 4), card integration (Task 5), detail page integration (Task 6), tests (Tasks 7 and 8), and final verification (Task 9).
- **Placeholder scan:** No TBD/TODO. Each step includes exact code, file paths, and commands.
- **Type consistency:** `ShareButtonProps` uses `World` from `../types`. `WorldCard` and `WorldDetailPage` pass the same `world` shape. Toast keys are `share.success` / `share.error` in both component and i18n.
