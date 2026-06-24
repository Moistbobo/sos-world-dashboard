# Display App Version Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the dashboard's semantic version (`MAJOR.MINOR.PATCH`, with a preview build timestamp appended when appropriate) on the Settings page and in the sidebar, using a single source of truth.

**Architecture:** Use Vite's `define` to inject `__APP_VERSION__` and `__APP_MODE__` at build time from `package.json` version and `import.meta.env.MODE`. Create a tiny `src/config/version.ts` helper that formats the version string and appends a UTC ISO timestamp for preview builds. The sidebar and Settings page consume this helper; tests assert the rendered value.

**Tech Stack:** React, TypeScript, Tailwind CSS, i18next, Vitest, Vite.

---

## Task 1: Expose version and mode via Vite `define`

**Files:**
- Modify: `vite.config.ts`

**Goal:** Make `__APP_VERSION__` and `__APP_MODE__` available at runtime without importing `package.json` into the browser bundle.

- [ ] **Step 1: Read the current vite.config.ts**

Already read in context. The config exports a default `defineConfig` with the react plugin.

- [ ] **Step 2: Modify vite.config.ts to define version and mode**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json' assert { type: 'json' }

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['node_modules', '.worktrees/**'],
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_MODE__: JSON.stringify(process.env.NODE_ENV),
  },
})
```

- [ ] **Step 3: Verify vite.config.ts parses**

Run: `pnpm exec tsc --noEmit -p tsconfig.node.json`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts
git commit -m "build: expose app version and build mode via vite define"
```

---

## Task 2: Add global type declarations for injected constants

**Files:**
- Create: `src/types/vite-env.d.ts`

**Goal:** Teach TypeScript that `__APP_VERSION__` and `__APP_MODE__` are strings.

- [ ] **Step 1: Check if a vite env types file already exists**

`src/vite-env.d.ts` does not exist in the current file list. We will create a new file.

- [ ] **Step 2: Create src/types/vite-env.d.ts**

```ts
declare const __APP_VERSION__: string;
declare const __APP_MODE__: string;
```

- [ ] **Step 3: Verify the project still typechecks**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types/vite-env.d.ts
git commit -m "chore(types): declare vite-injected app version constants"
```

---

## Task 3: Create the version formatting helper

**Files:**
- Create: `src/config/version.ts`
- Test: `src/config/version.test.ts`

**Goal:** Centralize version formatting logic. Returns `1.0.0` in production and `1.0.0 — 2026-06-24T12:34:56Z` in preview builds.

- [ ] **Step 1: Write the failing test for production mode**

Create `src/config/version.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAppVersion } from './version';

describe('getAppVersion', () => {
  let originalMode: string | undefined;

  beforeEach(() => {
    vi.resetModules();
    originalMode = (globalThis as Record<string, unknown>).__APP_MODE__ as string | undefined;
  });

  afterEach(() => {
    (globalThis as Record<string, unknown>).__APP_MODE__ = originalMode;
    vi.restoreAllMocks();
  });

  it('returns the plain version in production mode', async () => {
    (globalThis as Record<string, unknown>).__APP_MODE__ = 'production';
    (globalThis as Record<string, unknown>).__APP_VERSION__ = '1.0.0';
    const { getAppVersion: getVersion } = await import('./version');
    expect(getVersion()).toBe('1.0.0');
  });

  it('returns version with UTC timestamp in preview mode', async () => {
    (globalThis as Record<string, unknown>).__APP_MODE__ = 'preview';
    (globalThis as Record<string, unknown>).__APP_VERSION__ = '1.0.0';
    const mockDate = new Date(Date.UTC(2026, 5, 24, 12, 0, 0));
    vi.setSystemTime(mockDate);

    const { getAppVersion: getVersion } = await import('./version');
    const result = getVersion();

    expect(result).toMatch(/^1\.0\.0 — \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });
});
```

Run: `pnpm exec vitest run src/config/version.test.ts`
Expected: FAIL — `getAppVersion` is not exported from `./version`.

- [ ] **Step 2: Implement getAppVersion in src/config/version.ts**

```ts
export function getAppVersion(): string {
  const version = __APP_VERSION__ ?? '0.0.0';

  if (__APP_MODE__ === 'preview') {
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    return `${version} — ${timestamp}`;
  }

  return version;
}
```

Run: `pnpm exec vitest run src/config/version.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/config/version.ts src/config/version.test.ts
git commit -m "feat(config): add getAppVersion helper with preview timestamp"
```

---

## Task 4: Add i18n translation keys

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/ja.json`

**Goal:** Provide localized labels for "Version" and "Dashboard version" in English and Japanese.

- [ ] **Step 1: Add keys to en.json**

Modify the `layout` and `settings` sections:

```json
  "layout": {
    "appName": "SOS Dashboard",
    "apiStatus": "API status:",
    "online": "Online",
    "offline": "Offline / Unauthorized",
    "expandSidebar": "Expand sidebar",
    "collapseSidebar": "Collapse sidebar",
    "closeSidebar": "Close sidebar",
    "version": "Version"
  },
```

```json
  "settings": {
    "title": "Settings",
    "subtitle": "Configure application preferences.",
    "language": "Language",
    "languageHint": "Select your preferred display language.",
    "viewMode": "World view mode",
    "viewModeHint": "Choose how worlds are displayed on the Worlds page.",
    "viewModeGrid": "Grid",
    "viewModeList": "List",
    "scrollMode": "World scroll mode",
    "scrollModeHint": "Choose how the Worlds page loads more results.",
    "scrollModeInfinite": "Infinite scroll",
    "scrollModePagination": "Pagination",
    "appVersion": "Version",
    "appVersionHint": "Dashboard version"
  },
```

- [ ] **Step 2: Add keys to ja.json**

```json
  "layout": {
    "appName": "SOS Dashboard",
    "apiStatus": "API ステータス:",
    "online": "オンライン",
    "offline": "オフライン / 未認証",
    "expandSidebar": "サイドバーを展開",
    "collapseSidebar": "サイドバーを折りたたむ",
    "closeSidebar": "サイドバーを閉じる",
    "version": "バージョン"
  },
```

```json
  "settings": {
    "title": "設定",
    "subtitle": "アプリケーションの設定を変更します。",
    "language": "言語",
    "languageHint": "表示言語を選択してください。",
    "viewMode": "ワールド表示形式",
    "viewModeHint": "ワールドページでの表示形式を選択してください。",
    "viewModeGrid": "グリッド",
    "viewModeList": "リスト",
    "scrollMode": "ワールド読み込み形式",
    "scrollModeHint": "ワールドページでの結果の読み込み方法を選択してください。",
    "scrollModeInfinite": "無限スクロール",
    "scrollModePagination": "ページネーション",
    "appVersion": "バージョン",
    "appVersionHint": "ダッシュボードのバージョン"
  },
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/locales/en.json src/i18n/locales/ja.json
git commit -m "i18n: add version label keys for layout and settings"
```

---

## Task 5: Display version in the sidebar

**Files:**
- Modify: `src/components/Layout.tsx`

**Goal:** Show version under the app title when expanded; show as tooltip on hover/tap when collapsed.

- [ ] **Step 1: Import getAppVersion**

At the top of `src/components/Layout.tsx`, add:

```ts
import { getAppVersion } from '../config/version';
```

- [ ] **Step 2: Add state and helper for collapsed tooltip visibility**

Inside `Layout`, after the collapsed state:

```ts
  const [showCollapsedVersion, setShowCollapsedVersion] = useState(false);
  const appVersion = getAppVersion();
```

- [ ] **Step 3: Add version under the expanded title**

Wrap the expanded title block in a flex column and add a muted version label:

```tsx
          <div className={`flex flex-col ${collapsed ? 'lg:hidden' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{t('layout.appName')}</span>
            </div>
            <span className="mt-0.5 pl-9 text-[10px] text-slate-400 dark:text-slate-500">
              {t('layout.version')}: {appVersion}
            </span>
          </div>
```

The collapsed-only icon block remains unchanged.

- [ ] **Step 4: Add tooltip/tap version for collapsed state**

Wrap the collapsed icon-only title block in a relative container with a togglable tooltip:

```tsx
          <div
            className={`relative hidden ${collapsed ? 'lg:flex' : ''}`}
            onMouseEnter={() => setShowCollapsedVersion(true)}
            onMouseLeave={() => setShowCollapsedVersion(false)}
            onClick={() => setShowCollapsedVersion((prev) => !prev)}
            role="button"
            tabIndex={0}
            aria-label={t('layout.appName')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowCollapsedVersion((prev) => !prev);
              }
            }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span
              className={`pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity dark:bg-white dark:text-slate-900 ${
                showCollapsedVersion ? 'opacity-100' : ''
              }`}
            >
              {t('layout.appName')} {appVersion}
            </span>
          </div>
```

- [ ] **Step 5: Run tests and typecheck**

Run:
```bash
pnpm exec tsc --noEmit
pnpm exec vitest run src/test/sanity.test.tsx src/test/Layout.test.tsx
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "feat(layout): display app version in sidebar"
```

---

## Task 6: Display version on the Settings page

**Files:**
- Modify: `src/pages/SettingsPage.tsx`
- Test: `src/pages/SettingsPage.test.tsx`

**Goal:** Add a read-only Version row/card under the language setting.

- [ ] **Step 1: Import the version helper and icon**

At the top of `src/pages/SettingsPage.tsx`, add:

```ts
import { Info } from 'lucide-react';
import { getAppVersion } from '../config/version';
```

- [ ] **Step 2: Add the version card**

After the language section inside the card, add:

```tsx
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
            <Info className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            {t('settings.appVersion')}
          </label>
          <p
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            data-testid="app-version"
          >
            {getAppVersion()}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{t('settings.appVersionHint')}</p>
        </div>
```

- [ ] **Step 3: Write the regression test**

In `src/pages/SettingsPage.test.tsx`, add before the closing `});` of the describe block:

```ts
  it('renders the app version', () => {
    (globalThis as Record<string, unknown>).__APP_VERSION__ = '1.0.0';
    (globalThis as Record<string, unknown>).__APP_MODE__ = 'production';
    render(<SettingsPage />, { wrapper: Wrapper });
    expect(screen.getByTestId('app-version')).toHaveTextContent('1.0.0');
  });
```

- [ ] **Step 4: Run the SettingsPage tests**

Run: `pnpm exec vitest run src/pages/SettingsPage.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/SettingsPage.tsx src/pages/SettingsPage.test.tsx
git commit -m "feat(settings): display app version with test"
```

---

## Task 7: Final verification and summary

**Files:** All touched files.

- [ ] **Step 1: Run full test suite, lint, and build**

```bash
pnpm test
pnpm lint
pnpm build
```

Expected:
- `pnpm test` → all tests pass.
- `pnpm lint` → no errors/warnings.
- `pnpm build` → successful production build.

- [ ] **Step 2: If any step fails, fix and re-run**

- [ ] **Step 3: Summarize changes**

Files changed:
- `vite.config.ts`
- `src/types/vite-env.d.ts`
- `src/config/version.ts`
- `src/config/version.test.ts`
- `src/i18n/locales/en.json`
- `src/i18n/locales/ja.json`
- `src/components/Layout.tsx`
- `src/pages/SettingsPage.tsx`
- `src/pages/SettingsPage.test.tsx`

- [ ] **Step 4: Commit summary / finish branch**

Use `superpowers:finishing-a-development-branch` to create a PR to `main`.

