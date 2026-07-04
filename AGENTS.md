# Agent Notes

## Stack & Entrypoints

- Vite + React 18 + TypeScript SPA. Entry: `index.html` → `src/main.tsx` → `src/App.tsx`.
- Client-side routing with `react-router-dom`; `vercel.json` rewrites all paths to `index.html`.
- Package manager: `pnpm@11.5.1`.
- There is no root README; conventions live in `CONTRIBUTING.md` and this file.

## Daily Commands

```bash
pnpm dev          # dev server on http://localhost:5173
pnpm build        # tsc && vite build -> dist/
pnpm preview      # preview the dist build locally
pnpm lint         # eslint . --report-unused-disable-directives --max-warnings 0
pnpm test         # vitest run
pnpm test:watch   # vitest in watch mode
pnpm test:ui      # vitest --ui
```

## Verification Order

- Pre-push hook (`.husky/pre-push`) runs `pnpm lint` then `pnpm test`.
- `pnpm build` also runs `tsc`, so type errors block builds.
- Run a single test: `pnpm test -- src/components/world-card/WorldCard.test.tsx`.

## Testing

- Vitest is configured inside `vite.config.ts`: `globals: true`, `environment: 'jsdom'`, setup file `src/test/setup.ts`.
- `src/test/setup.ts` mocks `sonner`, polyfills `IntersectionObserver` / `ResizeObserver`, and imports i18n so translations load in tests.
- Many component/page tests use MSW-style fetch mocking and `vi.useFakeTimers()`; check existing tests before inventing new patterns.

## Environment

Copy `.env.example` to `.env.local`. Vite exposes only `VITE_*` env vars to the client.

- `VITE_API_BASE_URL` — defaults to `http://localhost:3000` in `src/api/client.ts` if unset.
- `VITE_API_BEARER_TOKEN` — optional; sent as `Authorization: Bearer ...`.
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` — required at import time by `src/lib/supabase.ts`. The client throws at module load if these are missing, even when community sentiment is disabled. Set dummy values in `.env.local` for non-sentiment work; tests mock Supabase.
- `VITE_ENABLE_COMMUNITY_SENTIMENT` — gates the sentiment UI; default is `false`.
- `VITE_TURNSTILE_SITE_KEY` — Cloudflare Turnstile site key.

## Code Organization

- `src/components/<kebab-name>/` — component, test, and `index.ts` barrel.
- `src/pages/<kebab-name>/` — page component, test, and barrel.
- Import through barrels: `import { WorldCard } from '../components/world-card'` — not from the `.tsx` directly.
- `src/api/` — fetch helpers and backend client code.
- `src/hooks/` — TanStack Query hooks and custom hooks.
- `src/contexts/` — preference and list state providers.
- `src/i18n/` — i18next setup with `en.json` / `ja.json`.

## Style & Conventions

- ESLint flat config in `eslint.config.js` uses `typescript-eslint`, `react-hooks`, and `react-refresh`.
- React Refresh rule allows constant exports (`allowConstantExport: true`), so `export const foo = ...` is fine in component files.
- Strict TypeScript: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` are enabled.
- Tailwind dark mode is `class`-based. Initial theme is set in `index.html` via inline script reading `localStorage.sos-theme`, falling back to `prefers-color-scheme: dark`.

## Feature Flags

- `VITE_ENABLE_COMMUNITY_SENTIMENT` gates the sentiment UI. `SentimentSection` itself does not read the flag; the parent (`WorldDetailPage`) decides whether to render it.

## Build-injected Globals

- Vite defines `__APP_VERSION__`, `__APP_MODE__`, and `__APP_GIT_SHA__` at build time from `package.json`, mode, and current git SHA. These are declared in `src/types/vite-env.d.ts`.

## Deployment & Branch Rules

- Deploy target is Vercel. `vercel.json` uses the SPA rewrite.
- `scripts/apply-rulesets.sh` applies GitHub rulesets via `gh` CLI; requires repo admin access.
- `.github/rulesets/main.json` enforces squash-only merges on the default branch; `.github/rulesets/release-branches.json` enforces merge-commit only on `testnet` and `production`.

## Useful References

- `CONTRIBUTING.md` covers PR title conventions (`[FEAT]: ...`), code organization, and the Supabase sentiment setup steps.
