# Display App Version — Completion Summary

## What was built
Implemented #22: expose the dashboard's semantic version on the Settings page and in the sidebar, with a single source of truth and a preview-build timestamp.

## Files touched
- `vite.config.ts` — injects `__APP_VERSION__` (from `package.json`) and `__APP_MODE__` (from Vite mode) via `define`.
- `tsconfig.node.json` — added `@types/node` and `vitest/config` types so the Vite config typechecks.
- `src/types/vite-env.d.ts` — declares the injected globals.
- `src/config/version.ts` — `getAppVersion()` helper; appends UTC ISO timestamp when `__APP_MODE__ === 'preview'`.
- `src/config/version.test.ts` — unit tests for production and preview formatting.
- `src/i18n/locales/en.json` — added `layout.version`, `settings.appVersion`, `settings.appVersionHint`.
- `src/i18n/locales/ja.json` — Japanese translations for the same keys.
- `src/components/Layout.tsx` — displays version under app title when expanded; shows a hover/tap tooltip when collapsed.
- `src/pages/SettingsPage.tsx` — read-only version card in settings.
- `src/pages/SettingsPage.test.tsx` — regression test asserting the version is rendered.

## Tests added
- `src/config/version.test.ts`: 2 tests
  - returns plain version in production mode
  - appends UTC timestamp in preview mode
- `src/pages/SettingsPage.test.tsx`: 1 test
  - renders the app version

## Verification
- `pnpm test` → 10 test files, 44/44 tests passed
- `pnpm lint` → clean
- `pnpm build` → successful production build

## Known limitations / follow-ups
- The preview timestamp is generated at build time via `new Date().toISOString()`, so every preview build gets a fresh timestamp. Production builds show only the version number.
- No automatic release automation or changelog UI (out of scope).
