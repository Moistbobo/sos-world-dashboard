# Contributing

## Pull Request Descriptions

When opening a pull request that merges `main` into a release branch (`testnet` or `production`), include a list of the changes being merged in the PR description.

```markdown
Merges latest `main` into `testnet`.

### Changes included

- #39 — chore(github): enforce merge methods per branch
- #38 — [FEAT]: Map raw platform values to readable display labels
- #37 — [FEAT]: display app version on settings page and sidebar
```

## Code Organization

Keep the source tree organized by feature domain so related files stay co-located and imports remain predictable.

### `src/components`

Each component lives in its own kebab-case folder under `src/components`. The folder contains the component file, its test file, and an `index.ts` barrel export. Other code imports components through the barrel, never from the component file directly.

```
src/components/
├── ui/
│   └── Card.tsx
├── world-card/
│   ├── WorldCard.tsx
│   ├── WorldCard.test.tsx
│   └── index.ts
└── filter-bar/
    ├── FilterBar.tsx
    ├── FilterBar.test.tsx
    └── index.ts
```

```ts
// ✅ Good
import { WorldCard } from '../components/world-card';

// ❌ Avoid
import { WorldCard } from '../components/WorldCard';
```

### `src/pages`

Each route page follows the same pattern: a kebab-case folder under `src/pages` with the page component, its test file, and an `index.ts` barrel export.

```
src/pages/
├── dashboard/
│   ├── DashboardPage.tsx
│   └── index.ts
└── worlds/
    ├── WorldsPage.tsx
    ├── WorldsPage.test.tsx
    └── index.ts
```

```ts
// ✅ Good
import { WorldsPage } from './pages/worlds';

// ❌ Avoid
import { WorldsPage } from './pages/WorldsPage';
```

### New components and pages

When adding a new component or page, create a folder with a barrel file from the start. Do not place new files directly in the root of `src/components` or `src/pages`.

## Pull Request Title Convention

Use a **single major tag** at the start of the PR title in square brackets, followed by a colon and a short description of the change.

```
[FEAT]: add user profile page
[FIX]: correct pagination offset when filtering
[DOCS]: update API authentication instructions
[CHORE]: upgrade Vitest to v5
[REFACTOR]: simplify world card layout
[TEST]: add integration tests for login flow
```

### Rules

- Use **one** major tag only. Do not add scopes inside the tag.
  - ✅ `[FEAT]: add platform label mapping`
  - ❌ `[FEAT](platform): add platform label mapping`
- Keep the description concise and focused on what the PR introduces.
- Commit messages inside the PR may continue to use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).

## Local Supabase setup

The community sentiment feature stores ratings and comments in Supabase.

1. Create a new project in the [Supabase dashboard](https://supabase.com/dashboard).
2. Open Project Settings → API and copy the project URL and **publishable key** (`sb_publishable_...`) into `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   VITE_ENABLE_COMMUNITY_SENTIMENT=true
   ```
3. Enable **Anonymous Sign-Ins** in Authentication → Providers → Anonymous.
4. Open Database → SQL Editor and run the schema SQL in `docs/plans/community-sentiment-implementation-plan.md` section 4 to create the `ratings` and `comments` tables and their RLS policies.
5. Optionally set `VITE_ENABLE_COMMUNITY_SENTIMENT=false` to hide the community sentiment UI without removing the Supabase setup.
6. Install the Supabase JavaScript client:
   ```bash
   pnpm add @supabase/supabase-js
   ```

After these steps, `pnpm run dev` will be able to connect to your Supabase project.

## Feature flags

- `VITE_ENABLE_COMMUNITY_SENTIMENT` controls whether the community sentiment section (ratings and comments) is visible on the world detail page. It is a build-time/public flag because it gates client-side UI only.
- New sentiment UI or data fetching must respect this flag. `SentimentSection` does not read the flag itself; the parent page decides whether to render it.
