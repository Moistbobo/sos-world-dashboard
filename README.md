# SOS World Dashboard

A dashboard for browsing and curating VRChat worlds. Built with Vite, React 18, and TypeScript.

## Live Sites

- **Testnet:** https://testnet.googoogaagaa.club/
- **Production:** https://sosd.googoogaagaa.club/

## Features

- Browse worlds with search, tag, platform, quality, capacity, and date-range filters
- World detail pages with ratings and community comments (Supabase-backed)
- Curated lists with import/export
- Tag browsing
- Dashboard with platform and quality stats
- English and Japanese localization
- Dark/light theme

## Tech Stack

- Vite + React 18 + TypeScript
- TanStack Query for data fetching
- React Router for client-side routing
- Tailwind CSS
- i18next (en/ja)
- Supabase (community sentiment: ratings + comments)
- Cloudflare Turnstile
- Vitest + Playwright for testing
- Deployed on Vercel

## Getting Started

Requires `pnpm@11.5.1`.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The dev server runs at http://localhost:5173.

### Environment Variables

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Backend API base URL (defaults to `http://localhost:3000`) |
| `VITE_API_BEARER_TOKEN` | Optional bearer token sent as `Authorization: Bearer ...` |
| `VITE_SUPABASE_URL` | Supabase project URL (required at import time) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (required at import time) |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |
| `VITE_ENABLE_COMMUNITY_SENTIMENT` | Set `true` to show ratings/comments UI (default `false`) |

## Scripts

```bash
pnpm dev          # dev server
pnpm build        # typecheck + production build -> dist/
pnpm preview      # preview the production build
pnpm lint         # eslint
pnpm test         # vitest (unit)
pnpm test:e2e     # playwright (e2e)
pnpm screenshot:pr # capture a PR screenshot via Playwright
```

## Project Structure

```
src/
├── api/          # fetch helpers and backend client
├── components/   # kebab-case folders with barrel exports
├── contexts/     # preference and list state providers
├── hooks/        # TanStack Query hooks and custom hooks
├── i18n/         # i18next setup with en.json / ja.json
├── lib/          # Supabase client
├── pages/        # route pages (kebab-case folders with barrels)
└── types.ts      # shared domain types
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for issue templates, PR conventions, and local Supabase setup.
