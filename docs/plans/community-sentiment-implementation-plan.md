# Implementation Plan: Supabase-backed Community Sentiment

> Parent ticket: [#15](https://github.com/Moistbobo/sos-world-dashboard/issues/15)  
> Sub-issues: [#16](https://github.com/Moistbobo/sos-world-dashboard/issues/16), [#17](https://github.com/Moistbobo/sos-world-dashboard/issues/17), [#18](https://github.com/Moistbobo/sos-world-dashboard/issues/18)  
> Branch: `feat/15-community-sentiment-plan`  
> Target merge branch: `main`

## 1. Goal

Add a public, Supabase-backed community sentiment feature to the SOS World Dashboard. Visitors can submit good/bad ratings and short plain-text comments on individual worlds without creating a full account. All feedback is visible to everyone immediately via TanStack Query optimistic updates.

## 2. Current repo state

- **Stack:** React 18.3.1, Vite 8.0.16, TanStack Query 5.101.0.
- **API:** Existing custom REST backend consumed via `VITE_API_BASE_URL` and `VITE_API_BEARER_TOKEN`.
- **No Supabase yet:** no dependency, no env vars, no tables, no RLS.
- **World model:** already has a backend-curated `quality: 'good' | 'bad' | null`. Community ratings are a **separate** user-contributed signal.
- **Conventions:** components live in `src/components/<kebab-feature>/` with barrel exports; pages live in `src/pages/<kebab-feature>/` with barrel exports; tests co-located.
- **No README.md;** onboarding docs live in `.env.example` and `CONTRIBUTING.md`.

## 3. Prerequisites (to be completed outside this branch)

Before implementation begins, the following must be done in the Supabase dashboard:

1. Create a new Supabase project for the dashboard.
2. Save the project's `URL` and `anon public key`.
3. In Database → SQL Editor, create the `ratings` and `comments` tables (exact schema below).
4. Enable **Anonymous Sign-Ins** in Authentication → Providers → Anonymous.
5. Configure RLS policies (exact SQL below).
6. (Optional but recommended) create a Supabase Edge Function for rate-limiting/abuse prevention.

## 4. Supabase schema

### 4.1 `ratings` table

```sql
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  world_id text not null,
  user_id uuid not null,
  value text not null check (value in ('good', 'bad')),
  created_at timestamptz not null default now(),
  unique (world_id, user_id)
);

create index idx_ratings_world_id on public.ratings(world_id);
create index idx_ratings_user_id on public.ratings(user_id);

alter table public.ratings enable row level security;

-- Everyone can read ratings.
create policy "Ratings are publicly readable"
  on public.ratings for select
  to anon, authenticated
  using (true);

-- Anonymous users can insert only their own rating for a world, and only once.
create policy "Anonymous users can insert their own rating"
  on public.ratings for insert
  to anon
  with check (auth.uid() = user_id);

-- Users cannot update or delete ratings directly (soft-delete/report can be added later).
```

### 4.2 `comments` table

```sql
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  world_id text not null,
  user_id uuid not null,
  username text not null,
  content text not null check (char_length(content) <= 256),
  created_at timestamptz not null default now()
);

create index idx_comments_world_id on public.comments(world_id);
create index idx_comments_user_id on public.comments(user_id);
create index idx_comments_created_at on public.comments(created_at desc);

alter table public.comments enable row level security;

-- Everyone can read comments.
create policy "Comments are publicly readable"
  on public.comments for select
  to anon, authenticated
  using (true);

-- Anonymous users can insert only their own comments.
create policy "Anonymous users can insert their own comments"
  on public.comments for insert
  to anon
  with check (auth.uid() = user_id);
```

### 4.3 Notes on schema

- `world_id` is stored as `text` because the dashboard's `World.worldId` is a VRChat-derived string, not a UUID.
- `user_id` is the Supabase anonymous user UUID.
- `username` is stored denormalized alongside comments so that the display name is stable even if the generation algorithm changes later.
- `ratings` has a unique constraint `(world_id, user_id)` to enforce one rating per anonymous user per world.

## 5. Frontend implementation steps

### 5.1 Install dependency

```bash
pnpm add @supabase/supabase-js
```

### 5.2 Environment variables

Update `.env.example`:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_API_BEARER_TOKEN=your-bearer-token-here

VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Add the same to local `.env.local` once Supabase is configured.

### 5.3 Create Supabase client

`src/lib/supabase.ts`

```ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);
```

### 5.4 Create username generator (sub-issue #17)

`src/utils/username.ts` and `src/utils/username.test.ts`

- Deterministic AdjectiveAnimal from a Supabase anonymous UUID.
- Curated, inoffensive word lists.
- URL-safe output.
- Target at least 1,000 combinations.

### 5.5 Create validation utility (sub-issue #16)

`src/utils/commentValidation.ts` and `src/utils/commentValidation.test.ts`

Rules:

- Max 256 characters.
- Reject URLs (`http://`, `https://`, `www.`, common TLD patterns).
- Reject email addresses.
- Reject HTML/Markdown tags.
- Reject excessive whitespace/line breaks.
- Return typed validation results for i18n error messages.

### 5.6 API layer for sentiment

`src/api/sentiment.ts`

Functions:

- `fetchRatings(worldId: string): Promise<RatingSummary>`
- `fetchComments(worldId: string): Promise<Comment[]>`
- `submitRating(worldId: string, value: 'good' | 'bad'): Promise<void>`
- `submitComment(worldId: string, content: string): Promise<Comment>`

Internal helpers:

- Ensure anonymous sign-in before mutation.
- Derive and persist username on first interaction.

### 5.7 TanStack Query hooks

`src/hooks/useSentiment.ts`

- `useRatings(worldId)` — fetch aggregate counts and current user's rating.
- `useComments(worldId)` — fetch comment list.
- `useSubmitRating()` — mutation with optimistic update.
- `useSubmitComment()` — mutation with cache invalidation/optimistic append.

### 5.8 UI components (sub-issue #18)

All components live in feature folders with barrel exports:

- `src/components/sentiment-rating/SentimentRating.tsx`
  - Good/bad buttons with counts and active state.
- `src/components/sentiment-comment-form/SentimentCommentForm.tsx`
  - Textarea with 256-char counter and validation errors.
- `src/components/sentiment-comment-list/SentimentCommentList.tsx`
  - List of comments with username and timestamp; empty state.
- `src/components/sentiment-section/SentimentSection.tsx`
  - Combines rating, comment form, and comment list.

### 5.9 Integrate into world detail page

`src/pages/world-detail/WorldDetailPage.tsx`

- Import `<SentimentSection worldId={w.worldId} />`.
- Place it below the existing action buttons.
- Lazy-load the section if it risks blocking the main world content.

### 5.10 i18n

Add new keys to `src/i18n/locales/en.json` and `ja.json`:

- `sentiment.ratings.good`
- `sentiment.ratings.bad`
- `sentiment.comments.empty`
- `sentiment.comments.placeholder`
- `sentiment.comments.submit`
- `sentiment.comments.count` / `sentiment.comments.tooLong`
- `sentiment.validation.noLinks`
- `sentiment.validation.noEmails`
- etc.

## 6. Testing plan

### 6.1 Unit tests

- `username.test.ts`: determinism, collision resistance, inoffensive output.
- `commentValidation.test.ts`: allowed text, boundary length, rejected patterns.
- `sentiment.test.ts`: Supabase client mocks for fetch and submit mutations.

### 6.2 Component tests

- `SentimentRating.test.tsx`: count display, active state, mutation callback.
- `SentimentCommentForm.test.tsx`: counter, validation errors, submit callback.
- `SentimentCommentList.test.tsx`: empty state, populated list.
- `WorldDetailPage.test.tsx`: section renders when world loads.

### 6.3 Manual / local E2E

- Start local dev with `.env.local` pointing at the Supabase project.
- Submit ratings and comments in an incognito window.
- Verify a second incognito session sees the same data without authentication.
- Verify one rating per world per anonymous identity.

## 7. Documentation updates

- `.env.example`: add Supabase env vars.
- `CONTRIBUTING.md`: add a "Local Supabase setup" section covering project creation, env vars, and where to run the SQL schema.

## 8. Out of scope (do not implement here)

- Full user accounts or social login.
- Comment threading or replies.
- Advanced moderation beyond soft-delete/report.
- Real-time WebSocket updates beyond TanStack Query polling/optimistic updates.
- Moving the entire app to Supabase or replacing the existing REST backend.

## 9. Suggested execution order

1. Complete Supabase prerequisites (schema, RLS, anonymous auth).
2. Install `@supabase/supabase-js` and add env vars/docs.
3. Implement username generator (#17).
4. Implement comment validation (#16).
5. Implement Supabase client + API layer + hooks.
6. Implement UI components (#18).
7. Integrate into `WorldDetailPage`.
8. Add i18n and tests.
9. Open PR against `main` with the standard `[FEAT]: ...` title and a change list referencing #15, #16, #17, #18.

## 10. Risk notes

- **Anonymous identity stability:** Supabase anonymous users are session-scoped unless `signInAnonymously` is called and the session is refreshed. Verify that the same browser gets the same `user_id` across reloads.
- **Rate limiting:** RLS alone won't stop spam. Consider an Edge Function for submit throttling before public release.
- **Existing `World.quality`:** Ensure community ratings are displayed separately and never sent to the existing REST backend as the curated `quality` value.
