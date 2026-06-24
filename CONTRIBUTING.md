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
