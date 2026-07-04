# Community Sentiment Supabase Hardening Guide

This document addresses the risk notes from the [Community Sentiment Implementation Plan](../plans/community-sentiment-implementation-plan.md) by hardening the Supabase configuration, schema, and access patterns.

---

## 1. Anonymous identity stability + privacy leak

### Current issue

The current `fetchRatings()` selects `value, user_id` for **every** rating row so it can find the current user's rating. This leaks every user's `user_id` to every visitor and forces the client to do aggregation.

### Hardening steps

#### 1.1. Expose an aggregate view that hides `user_id`

Use a `security_invoker` view (Postgres 15+) so RLS still applies underneath. The view returns counts and only the caller's own rating:

```sql
create view public.ratings_summary with (security_invoker = true) as
select
  world_id,
  count(*) filter (where value = 'good')::int as good,
  count(*) filter (where value = 'bad')::int as bad,
  (select value
   from public.ratings r2
   where r2.world_id = r.world_id
     and r2.user_id = auth.uid()
   limit 1) as user_rating
from public.ratings r
group by world_id;

grant select on public.ratings_summary to anon, authenticated;
```

Then the frontend reads from `ratings_summary` instead of `ratings`:

```ts
const { data, error } = await supabase
  .from('ratings_summary')
  .select('*')
  .eq('world_id', worldId)
  .single();
```

#### 1.2. Add foreign keys to `auth.users`

This ties sentiment rows to real identities, enables cascade cleanup, and ensures referential integrity:

```sql
alter table public.ratings
  add constraint ratings_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.comments
  add constraint comments_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
```

#### 1.3. Clean up stale anonymous users

Supabase does not auto-delete anonymous users. Add a scheduled cleanup job via `pg_cron` or a manual cron that runs this SQL:

```sql
delete from auth.users
where is_anonymous is true and created_at < now() - interval '30 days';
```

With the FKs in place, deleting the user will cascade-delete their ratings and comments automatically.

#### 1.4. Maintain identity persistence on the client

`supabase-js` persists the anonymous session in localStorage and refreshes it automatically. Keep the default `persistSession: true` and avoid calling `supabase.auth.signOut()` during sentiment flows.

---

## 2. Rate limiting and abuse prevention

RLS only enforces **who** can write, not **how fast**. These Supabase-side changes reduce spam and abuse:

### 2.1. Enable CAPTCHA for anonymous sign-ins ✅ Implemented

In the Supabase dashboard:

- Go to **Auth → Bot and Abuse Protection → Enable CAPTCHA**.
- Choose **hCaptcha** or **Cloudflare Turnstile** and enter your secret key.

Frontend implementation:

- Install `@marsidev/react-turnstile`.
- Add `VITE_TURNSTILE_SITE_KEY` to `.env.example` and your deployment environment.
- Render a `TurnstileChallenge` component when the user attempts a write action (rating or comment) and no anonymous session exists yet.
- Pass the returned token to `signInAnonymously`:

```ts
await supabase.auth.signInAnonymously({
  options: { captchaToken },
});
```

Relevant files:

- `src/components/turnstile-challenge/TurnstileChallenge.tsx`
- `src/hooks/useCaptcha.ts`
- `src/components/sentiment-section/SentimentSection.tsx`
- `src/api/sentiment.ts` (`ensureAnonymousUser` accepts an optional `captchaToken`)
- `src/hooks/useSentiment.ts` (mutations pass `captchaToken` through)

Once the user solves the challenge and signs in anonymously, the session persists in the browser and no further CAPTCHA prompts are shown for that session.

### 2.2. Tighten anonymous sign-in rate limits

The anonymous sign-in endpoint is IP-limited by default. You can adjust the dedicated limit in the dashboard at **Auth → Rate Limits**, or via the Management API:

```bash
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rate_limit_anonymous_users": 10}'
```

### 2.3. Limit Data API row returns

Lower the project-wide **Max rows returned** setting in Project API settings, and paginate the comment feed with `.limit()` and `.range()`.

### 2.4. Enforce per-user write cooldowns

RLS alone cannot rate-limit writes from a valid session. Options:

- Add a `rate_limits` table and use an insert trigger or RLS helper function that checks the last write time for the same `user_id`/`world_id`.
- Route all mutations through a **Supabase Edge Function** that enforces per-user/per-world cooldowns, validates CAPTCHA server-side, and writes via the `service_role` key.

### 2.5. Add moderation hooks

Set up a **Database Webhook** on `comments` inserts to call an external moderation API (e.g., Perspective API) or push new comments into a review queue.

### 2.6. Recommended long-term architecture

Use a Supabase Edge Function for all sentiment mutations. The function can:

- Verify the CAPTCHA token.
- Enforce IP/user rate limits.
- Run content checks.
- Insert the row using the `service_role` key.

This is more robust than relying on RLS and CAPTCHA alone.

---

## 3. Separation from curated `World.quality`

The backend-curated `World.quality` value must not be confused with or affected by community ratings.

### 3.1. Schema-level protection

Keep the existing check constraint so ratings can only hold community values:

```sql
value text not null check (value in ('good', 'bad'))
```

### 3.2. Naming clarity

Consider renaming the tables to make their purpose explicit:

- `public.ratings` → `public.community_ratings`
- `public.comments` → `public.community_comments`

This prevents future developers from mistaking these for the curated quality field.

### 3.3. Frontend/API contract

Ensure `src/api/sentiment.ts` only uses Supabase and never touches `VITE_API_BASE_URL`. The existing custom REST backend should remain responsible for `World.quality` only.

---

## 4. General Supabase production hygiene

| Area | Action |
|------|--------|
| RLS | Verify RLS is enabled on `ratings`, `comments`, and any views. Run the Security Advisor to catch missing policies/FKs. |
| API keys | Use only the **publishable key** (`sb_publishable_...`) in the browser. Never expose `service_role` or legacy `anon`. |
| SSL | Enable **SSL enforcement** in Database Settings. |
| Network | Apply **Database network restrictions** if direct Postgres access is not required. |
| Sessions | Keep refresh token rotation enabled. Set a sensible JWT expiry. |
| Dependencies | Pin `@supabase/supabase-js` and commit the lockfile. |
| Advisors | Run `supabase db advisors` (CLI v2.81.3+) before shipping schema changes. |

---

## 5. Suggested implementation order

1. Create `ratings_summary` view and update `fetchRatings()` to use it.
2. Add `auth.users` foreign keys with `on delete cascade`.
3. Rename tables for clarity (if desired) and update all client queries.
4. Enable CAPTCHA for anonymous sign-ins and pass the token in `signInAnonymously()`.
5. Tighten `rate_limit_anonymous_users` and lower max rows returned.
6. Add a per-user/per-world cooldown via Edge Function or trigger.
7. Set up a database webhook for moderation/review queue.
8. Schedule stale anonymous user cleanup.
9. Run Security Advisor and apply any remaining fixes.

---

*Last updated: 2026-07-04*
