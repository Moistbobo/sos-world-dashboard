# i18next Internationalization Design

**Date:** 2026-06-08  
**Scope:** Add i18next to the SOS Dashboard app with English as the base/fallback language.

## Goal
Extract all hardcoded English UI strings into a translation system, making the app translatable and ensuring English strings live in a dedicated resource file rather than inline.

## Architecture

### Dependencies
- `i18next` — core i18next library
- `react-i18next` — React bindings (`useTranslation`, `I18nextProvider`)

No HTTP backend is needed because we will bundle translations at build time.

### File Structure
```
src/
  i18n/
    index.ts          # i18next initialization
    locales/
      en.json         # English translation strings
  components/
    LanguageSwitcher.tsx  # reusable language select component
```

### Translation Format
Translations live in `src/i18n/locales/en.json`. Keys are nested by page/concern:

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "worlds": "Worlds",
    "tags": "Tags",
    "settings": "Settings"
  },
  "dashboard": { "title": "...", "subtitle": "..." },
  "worlds": { "title": "...", "subtitle": "..." },
  ...
}
```

### Initialization
`src/i18n/index.ts` creates and configures the i18next instance:
- `lng: 'en'`
- `fallbackLng: 'en'`
- `interpolation.escapeValue: false` (React handles escaping)
- `resources` loaded from the imported JSON

This file is imported once in `src/main.tsx` before `ReactDOM.createRoot`.

### Component Integration
Every component that currently contains hardcoded English strings will be updated to use:
```tsx
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
```

Components affected:
- `Layout.tsx`
- `DashboardPage.tsx`
- `WorldsPage.tsx`
- `WorldDetailPage.tsx`
- `TagsPage.tsx`
- `SettingsPage.tsx`
- `FilterBar.tsx`
- `Pagination.tsx`
- `ThemeToggle.tsx`
- `WorldCard.tsx`
- `StatCard.tsx` (receives `label` from parent, parents will pass `t(...)`)

### Language Switcher
A reusable `<select>` component (`LanguageSwitcher.tsx`) that:
- Lists available languages (only English for now, labeled "English")
- Reads current language from `i18n.language`
- On change, calls `i18n.changeLanguage(lng)`
- Persists the choice to `localStorage` under `i18nextLng`
- Used inside `SettingsPage.tsx`

### Persistence
i18next reads `localStorage.getItem('i18nextLng')` on initialization (standard behavior when `detection` or manual init is configured). We will set `lng` from `localStorage` if present, otherwise default to `'en'`.

### Key Naming Convention
- `nav.*` — navigation labels
- `dashboard.*` — dashboard page
- `worlds.*` — worlds page
- `worldDetail.*` — world detail page
- `tags.*` — tags page
- `settings.*` — settings page
- `filter.*` — filter bar
- `pagination.*` — pagination controls
- `common.*` — shared strings (e.g. "Back", "Details", "Open in VRChat")

## Testing
- Existing tests should continue to pass; string assertions may need updating to match translation keys or expected translated text.
- `i18next` instance is initialized before tests run via `main.tsx` import path.

## Rollout
1. Add dependencies
2. Create `src/i18n/` directory, `index.ts`, and `locales/en.json`
3. Wire i18next into `main.tsx`
4. Update each component to use `useTranslation()`
5. Add `LanguageSwitcher` to `SettingsPage`
6. Verify build and tests pass
