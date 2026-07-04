# Community Sentiment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Supabase-backed community sentiment feature to the SOS World Dashboard so visitors can rate worlds good/bad and leave short comments without creating a full account.

**Architecture:** A thin API layer (`src/api/sentiment.ts`) wraps the Supabase client for anonymous auth and Data API calls. TanStack Query hooks (`src/hooks/useSentiment.ts`) expose queries and optimistic mutations. UI components live in `src/components/sentiment-*` feature folders and are composed into a `SentimentSection` mounted below the action buttons on the world detail page.

**Tech Stack:** React 18.3, Vite, TypeScript, TanStack Query 5, `@supabase/supabase-js`, Tailwind CSS, `lucide-react`, `react-i18next`, Vitest + Testing Library.

---

## File map

| File | Responsibility |
| --- | --- |
| `src/lib/supabase.ts` | Create the single Supabase client from env vars. |
| `src/utils/username.ts` | Returns "Anonymous" for every anonymous user. |
| `src/utils/username.test.ts` | Tests for the username generator. |
| `src/utils/commentValidation.ts` | Validate comment text length/content and return typed errors. |
| `src/utils/commentValidation.test.ts` | Tests for comment validation. |
| `src/api/sentiment.ts` | Fetch/submit ratings and comments via Supabase Data API. |
| `src/hooks/useSentiment.ts` | TanStack Query hooks and mutations for sentiment. |
| `src/types.ts` | Add `Rating`, `Comment`, `RatingSummary` types. |
| `src/components/sentiment-rating/` | Good/bad rating buttons with counts. |
| `src/components/sentiment-comment-form/` | Comment textarea, counter, validation, submit. |
| `src/components/sentiment-comment-list/` | Render list of comments. |
| `src/components/sentiment-section/` | Compose rating + form + list for a world. |
| `src/pages/world-detail/WorldDetailPage.tsx` | Mount `SentimentSection` below action buttons. |
| `src/i18n/locales/en.json` | English sentiment copy. |
| `src/i18n/locales/ja.json` | Japanese sentiment copy. |
| `CONTRIBUTING.md` | Add local Supabase setup notes. |

---

### Task 1: Install dependency and create Supabase client

**Files:**
- Modify: `package.json` (via `pnpm add`)
- Create: `src/lib/supabase.ts`
- Modify: `.env.example`
- Modify: `CONTRIBUTING.md`

- [ ] **Step 1: Install `@supabase/supabase-js`**

Run:
```bash
pnpm add @supabase/supabase-js
```

Expected: dependency appears in `package.json` and lockfile is updated.

- [ ] **Step 2: Create the Supabase client**

Create `src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (typeof url !== 'string' || !url) {
  throw new Error('Missing VITE_SUPABASE_URL');
}
if (typeof key !== 'string' || !key) {
  throw new Error('Missing VITE_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = createClient(url, key);
```

- [ ] **Step 3: Update `.env.example` with Supabase env vars**

Ensure `.env.example` contains:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_API_BEARER_TOKEN=your-bearer-token-here

VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

- [ ] **Step 4: Add local Supabase setup notes to `CONTRIBUTING.md`**

Append a "Local Supabase setup" section after the existing sections. Include:
1. Create a project in the Supabase dashboard.
2. Copy project URL and publishable key to `.env.local`.
3. Enable Authentication → Providers → Anonymous Sign-Ins.
4. Run the schema SQL from `docs/plans/community-sentiment-implementation-plan.md` section 4 in the SQL Editor.
5. Install `@supabase/supabase-js` via pnpm.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml .env.example src/lib/supabase.ts CONTRIBUTING.md
git commit -m "chore(supabase): add supabase-js client, env docs, and contributing setup"
```

---

### Task 2: Implement deterministic username generator

**Files:**
- Create: `src/utils/username.ts`
- Create: `src/utils/username.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/utils/username.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { generateUsername } from './username';

describe('generateUsername', () => {
  it('returns "Anonymous"', () => {
    expect(generateUsername()).toBe('Anonymous');
  });
});
```

Run:
```bash
pnpm vitest run src/utils/username.test.ts
```

Expected: FAIL — `generateUsername` is not defined.

- [ ] **Step 2: Implement the username generator**

Create `src/utils/username.ts`:

```ts
export function generateUsername(): string {
  return 'Anonymous';
}
```

- [ ] **Step 3: Run tests and verify they pass**

Run:
```bash
pnpm vitest run src/utils/username.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/utils/username.ts src/utils/username.test.ts
git commit -m "feat(sentiment): add deterministic anonymous username generator"
```

---

### Task 3: Implement comment validation utility

**Files:**
- Create: `src/utils/commentValidation.ts`
- Create: `src/utils/commentValidation.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/utils/commentValidation.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { validateComment } from './commentValidation';

describe('validateComment', () => {
  it('accepts plain short text', () => {
    expect(validateComment('Great world!')).toEqual({ valid: true });
  });

  it('rejects empty comments', () => {
    expect(validateComment('').valid).toBe(false);
  });

  it('rejects comments over 256 chars', () => {
    const long = 'a'.repeat(257);
    const result = validateComment(long);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('tooLong');
  });

  it('rejects urls', () => {
    expect(validateComment('check https://example.com').reason).toBe('noLinks');
    expect(validateComment('visit http://test.com').reason).toBe('noLinks');
    expect(validateComment('look at www.example.com').reason).toBe('noLinks');
  });

  it('rejects emails', () => {
    expect(validateComment('mail me at hi@example.com').reason).toBe('noEmails');
  });

  it('rejects html or markdown tags', () => {
    expect(validateComment('<script>bad</script>').reason).toBe('noMarkup');
    expect(validateComment('[link](url)').reason).toBe('noMarkup');
  });

  it('rejects excessive whitespace/line breaks', () => {
    expect(validateComment('hello\n\n\nworld').reason).toBe('noExcessWhitespace');
  });

  it('trims leading and trailing whitespace', () => {
    expect(validateComment('  hello  ')).toEqual({ valid: true });
  });
});
```

Run:
```bash
pnpm vitest run src/utils/commentValidation.test.ts
```

Expected: FAIL — `validateComment` is not defined.

- [ ] **Step 2: Implement comment validation**

Create `src/utils/commentValidation.ts`:

```ts
export type CommentValidationResult =
  | { valid: true }
  | { valid: false; reason: CommentValidationError };

export type CommentValidationError =
  | 'tooLong'
  | 'noLinks'
  | 'noEmails'
  | 'noMarkup'
  | 'noExcessWhitespace'
  | 'empty';

const MAX_LENGTH = 256;
const URL_RE = /https?:\/\/|www\./i;
const EMAIL_RE = /\S+@\S+\.\S+/i;
const MARKUP_RE = /<[^>]+>|\[[^\]]*\]\([^)]*\)|\*\*|__|`|#+/;
const EXCESS_WHITESPACE_RE = /\n{3,}|\s{4,}/;

export function validateComment(content: string): CommentValidationResult {
  const trimmed = content.trim();

  if (!trimmed) {
    return { valid: false, reason: 'empty' };
  }

  if (trimmed.length > MAX_LENGTH) {
    return { valid: false, reason: 'tooLong' };
  }

  if (URL_RE.test(trimmed)) {
    return { valid: false, reason: 'noLinks' };
  }

  if (EMAIL_RE.test(trimmed)) {
    return { valid: false, reason: 'noEmails' };
  }

  if (MARKUP_RE.test(trimmed)) {
    return { valid: false, reason: 'noMarkup' };
  }

  if (EXCESS_WHITESPACE_RE.test(trimmed)) {
    return { valid: false, reason: 'noExcessWhitespace' };
  }

  return { valid: true };
}
```

- [ ] **Step 3: Run tests and verify they pass**

Run:
```bash
pnpm vitest run src/utils/commentValidation.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/utils/commentValidation.ts src/utils/commentValidation.test.ts
git commit -m "feat(sentiment): add comment validation utility"
```

---

### Task 4: Add sentiment types

**Files:**
- Modify: `src/types.ts`

- [ ] **Step 1: Append sentiment types**

Add at the end of `src/types.ts`:

```ts
export interface Rating {
  id: string;
  world_id: string;
  user_id: string;
  value: 'good' | 'bad';
  created_at: string;
}

export interface RatingSummary {
  worldId: string;
  good: number;
  bad: number;
  userRating: 'good' | 'bad' | null;
}

export interface Comment {
  id: string;
  world_id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
pnpm run build
```

Expected: build succeeds (no new usage yet).

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat(sentiment): add rating and comment types"
```

---

### Task 5: Implement Supabase sentiment API layer

**Files:**
- Create: `src/api/sentiment.ts`
- Create: `src/api/sentiment.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/api/sentiment.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchRatings, fetchComments, submitRating, submitComment } from './sentiment';

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockRpc = vi.fn();
const mockSignInAnonymously = vi.fn();
const mockGetSession = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInAnonymously: mockSignInAnonymously,
      getSession: mockGetSession,
    },
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
    })),
    rpc: mockRpc,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  mockSignInAnonymously.mockResolvedValue({
    data: { user: { id: 'user-1', is_anonymous: true } },
    error: null,
  });
});

describe('fetchRatings', () => {
  it('returns aggregate counts and null user rating when no session', async () => {
    mockSelect.mockReturnValueOnce({
      eq: vi.fn().mockReturnValue({
        data: [
          { value: 'good' },
          { value: 'good' },
          { value: 'bad' },
        ],
        error: null,
      }),
    });

    const result = await fetchRatings('wrld_123');
    expect(result).toEqual({ worldId: 'wrld_123', good: 2, bad: 1, userRating: null });
  });
});

describe('fetchComments', () => {
  it('returns comments ordered by created_at desc', async () => {
    mockSelect.mockReturnValueOnce({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          data: [{ id: 'c1', content: 'hi' }],
          error: null,
        }),
      }),
    });

    const result = await fetchComments('wrld_123');
    expect(result).toEqual([{ id: 'c1', content: 'hi' }]);
  });
});

describe('submitRating', () => {
  it('signs in anonymously and inserts rating', async () => {
    mockInsert.mockReturnValueOnce({ data: null, error: null });
    await submitRating('wrld_123', 'good');
    expect(mockSignInAnonymously).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalled();
  });
});

describe('submitComment', () => {
  it('signs in anonymously and inserts comment', async () => {
    mockInsert.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({ data: [{ id: 'c1' }], error: null }),
    });
    const result = await submitComment('wrld_123', 'Nice world');
    expect(mockSignInAnonymously).toHaveBeenCalled();
    expect(result).toEqual({ id: 'c1' });
  });
});
```

Run:
```bash
pnpm vitest run src/api/sentiment.test.ts
```

Expected: FAIL — `sentiment.ts` does not exist.

- [ ] **Step 2: Implement the API layer**

Create `src/api/sentiment.ts`:

```ts
import { supabase } from '../lib/supabase';
import { generateUsername } from '../utils/username';
import type { Comment, Rating, RatingSummary } from '../types';

async function ensureAnonymousUser() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user) {
    return sessionData.session.user;
  }
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) throw new Error('Anonymous sign-in failed');
  return data.user;
}

export async function fetchRatings(worldId: string): Promise<RatingSummary> {
  const { data, error } = await supabase.from('ratings').select('value, user_id').eq('world_id', worldId);
  if (error) throw new Error(error.message);

  let good = 0;
  let bad = 0;
  let userRating: 'good' | 'bad' | null = null;

  const { data: sessionData } = await supabase.auth.getSession();
  const currentUserId = sessionData.session?.user?.id;

  for (const row of data ?? []) {
    if (row.value === 'good') good++;
    if (row.value === 'bad') bad++;
    if (currentUserId && row.user_id === currentUserId) {
      userRating = row.value as 'good' | 'bad';
    }
  }

  return { worldId, good, bad, userRating };
}

export async function fetchComments(worldId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('world_id', worldId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Comment[];
}

export async function submitRating(worldId: string, value: 'good' | 'bad'): Promise<void> {
  const user = await ensureAnonymousUser();
  const { error } = await supabase.from('ratings').insert({
    world_id: worldId,
    user_id: user.id,
    value,
  });
  if (error) throw new Error(error.message);
}

export async function submitComment(worldId: string, content: string): Promise<Comment> {
  const user = await ensureAnonymousUser();
  const username = generateUsername();
  const { data, error } = await supabase
    .from('comments')
    .insert({
      world_id: worldId,
      user_id: user.id,
      username,
      content,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Comment;
}
```

- [ ] **Step 3: Run tests and verify they pass**

Run:
```bash
pnpm vitest run src/api/sentiment.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/api/sentiment.ts src/api/sentiment.test.ts
git commit -m "feat(sentiment): add Supabase sentiment API layer"
```

---

### Task 6: Implement TanStack Query sentiment hooks

**Files:**
- Create: `src/hooks/useSentiment.ts`
- Create: `src/hooks/useSentiment.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useSentiment.test.tsx`:

```tsx
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRatings, useComments, useSubmitRating, useSubmitComment } from './useSentiment';

const mockFetchRatings = vi.fn();
const mockFetchComments = vi.fn();
const mockSubmitRating = vi.fn();
const mockSubmitComment = vi.fn();

vi.mock('../api/sentiment', () => ({
  fetchRatings: mockFetchRatings,
  fetchComments: mockFetchComments,
  submitRating: mockSubmitRating,
  submitComment: mockSubmitComment,
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useRatings', () => {
  it('fetches rating summary', async () => {
    mockFetchRatings.mockResolvedValue({ worldId: 'wrld_123', good: 5, bad: 1, userRating: null });
    const { result } = renderHook(() => useRatings('wrld_123'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ worldId: 'wrld_123', good: 5, bad: 1, userRating: null });
  });
});

describe('useComments', () => {
  it('fetches comments', async () => {
    mockFetchComments.mockResolvedValue([{ id: 'c1', content: 'hi' }]);
    const { result } = renderHook(() => useComments('wrld_123'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 'c1', content: 'hi' }]);
  });
});

describe('useSubmitRating', () => {
  it('calls submitRating and invalidates rating query', async () => {
    mockSubmitRating.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSubmitRating(), { wrapper });
    await result.current.mutateAsync({ worldId: 'wrld_123', value: 'good' });
    expect(mockSubmitRating).toHaveBeenCalledWith('wrld_123', 'good');
  });
});

describe('useSubmitComment', () => {
  it('calls submitComment and invalidates comments query', async () => {
    mockSubmitComment.mockResolvedValue({ id: 'c2', content: 'hello' });
    const { result } = renderHook(() => useSubmitComment(), { wrapper });
    await result.current.mutateAsync({ worldId: 'wrld_123', content: 'hello' });
    expect(mockSubmitComment).toHaveBeenCalledWith('wrld_123', 'hello');
  });
});
```

Run:
```bash
pnpm vitest run src/hooks/useSentiment.test.tsx
```

Expected: FAIL — `useSentiment.ts` does not exist.

- [ ] **Step 2: Implement the hooks**

Create `src/hooks/useSentiment.ts`:

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchComments, fetchRatings, submitComment, submitRating } from '../api/sentiment';
import type { Comment, RatingSummary } from '../types';

export function useRatings(worldId: string | undefined) {
  return useQuery<RatingSummary>({
    queryKey: ['ratings', worldId],
    queryFn: () => fetchRatings(worldId!),
    enabled: !!worldId,
  });
}

export function useComments(worldId: string | undefined) {
  return useQuery<Comment[]>({
    queryKey: ['comments', worldId],
    queryFn: () => fetchComments(worldId!),
    enabled: !!worldId,
  });
}

export function useSubmitRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ worldId, value }: { worldId: string; value: 'good' | 'bad' }) =>
      submitRating(worldId, value),
    onSuccess: (_, { worldId }) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', worldId] });
    },
  });
}

export function useSubmitComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ worldId, content }: { worldId: string; content: string }) =>
      submitComment(worldId, content),
    onSuccess: (_, { worldId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', worldId] });
    },
  });
}
```

- [ ] **Step 3: Run tests and verify they pass**

Run:
```bash
pnpm vitest run src/hooks/useSentiment.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useSentiment.ts src/hooks/useSentiment.test.tsx
git commit -m "feat(sentiment): add TanStack Query hooks for ratings and comments"
```

---

### Task 7: Implement sentiment UI components

**Files:**
- Create: `src/components/sentiment-rating/SentimentRating.tsx`
- Create: `src/components/sentiment-rating/SentimentRating.test.tsx`
- Create: `src/components/sentiment-rating/index.ts`
- Create: `src/components/sentiment-comment-form/SentimentCommentForm.tsx`
- Create: `src/components/sentiment-comment-form/SentimentCommentForm.test.tsx`
- Create: `src/components/sentiment-comment-form/index.ts`
- Create: `src/components/sentiment-comment-list/SentimentCommentList.tsx`
- Create: `src/components/sentiment-comment-list/SentimentCommentList.test.tsx`
- Create: `src/components/sentiment-comment-list/index.ts`
- Create: `src/components/sentiment-section/SentimentSection.tsx`
- Create: `src/components/sentiment-section/SentimentSection.test.tsx`
- Create: `src/components/sentiment-section/index.ts`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/ja.json`

- [ ] **Step 1: Add i18n keys**

Add inside the top-level object in both `en.json` and `ja.json` (place near `worldDetail`):

`en.json`:
```json
  "sentiment": {
    "ratings": {
      "good": "Good",
      "bad": "Bad",
      "countGood": "{{count}} good",
      "countBad": "{{count}} bad",
      "submitError": "Could not submit rating: {{message}}"
    },
    "comments": {
      "title": "Community comments",
      "empty": "No comments yet. Be the first!",
      "placeholder": "Write a short comment...",
      "submit": "Post comment",
      "count": "{{count}} / {{max}}",
      "submitError": "Could not post comment: {{message}}",
      "postedAt": "{{time}} ago"
    },
    "validation": {
      "tooLong": "Comment must be 256 characters or less.",
      "noLinks": "Links are not allowed.",
      "noEmails": "Email addresses are not allowed.",
      "noMarkup": "Formatting or HTML is not allowed.",
      "noExcessWhitespace": "Too many line breaks or spaces.",
      "empty": "Please write something."
    }
  },
```

`ja.json` (approximate):
```json
  "sentiment": {
    "ratings": {
      "good": "良い",
      "bad": "悪い",
      "countGood": "良い {{count}}",
      "countBad": "悪い {{count}}",
      "submitError": "評価を送信できませんでした: {{message}}"
    },
    "comments": {
      "title": "コミュニティコメント",
      "empty": "まだコメントはありません。最初のコメントを書きませんか？",
      "placeholder": "短いコメントを書く...",
      "submit": "コメントを投稿",
      "count": "{{count}} / {{max}}",
      "submitError": "コメントを投稿できませんでした: {{message}}",
      "postedAt": "{{time}}前"
    },
    "validation": {
      "tooLong": "コメントは256文字以内にしてください。",
      "noLinks": "リンクは許可されていません。",
      "noEmails": "メールアドレスは許可されていません。",
      "noMarkup": "書式やHTMLは許可されていません。",
      "noExcessWhitespace": "改行や空白が多すぎます。",
      "empty": "何かを書いてください。"
    }
  },
```

- [ ] **Step 2: Create `SentimentRating` component**

Create `src/components/sentiment-rating/SentimentRating.tsx`:

```tsx
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RatingSummary } from '../../types';

interface SentimentRatingProps {
  summary: RatingSummary | undefined;
  isLoading: boolean;
  isSubmitting: boolean;
  onRate: (value: 'good' | 'bad') => void;
}

export function SentimentRating({ summary, isLoading, isSubmitting, onRate }: SentimentRatingProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3" data-testid="sentiment-rating">
      <button
        type="button"
        disabled={isLoading || isSubmitting}
        onClick={() => onRate('good')}
        className={`btn-secondary gap-2 text-sm ${
          summary?.userRating === 'good'
            ? 'border-green-500/50 bg-green-500/15 text-green-700 dark:text-green-300'
            : ''
        }`}
        aria-pressed={summary?.userRating === 'good'}
      >
        <ThumbsUp className="h-4 w-4" />
        {t('sentiment.ratings.good')}
        <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700">
          {summary?.good ?? 0}
        </span>
      </button>
      <button
        type="button"
        disabled={isLoading || isSubmitting}
        onClick={() => onRate('bad')}
        className={`btn-secondary gap-2 text-sm ${
          summary?.userRating === 'bad'
            ? 'border-red-500/50 bg-red-500/15 text-red-700 dark:text-red-300'
            : ''
        }`}
        aria-pressed={summary?.userRating === 'bad'}
      >
        <ThumbsDown className="h-4 w-4" />
        {t('sentiment.ratings.bad')}
        <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700">
          {summary?.bad ?? 0}
        </span>
      </button>
    </div>
  );
}
```

Create `src/components/sentiment-rating/index.ts`:

```ts
export { SentimentRating } from './SentimentRating';
```

Create `src/components/sentiment-rating/SentimentRating.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SentimentRating } from './SentimentRating';

function renderComponent(props = {}) {
  return render(
    <SentimentRating
      summary={{ worldId: 'wrld_123', good: 3, bad: 1, userRating: null }}
      isLoading={false}
      isSubmitting={false}
      onRate={vi.fn()}
      {...props}
    />
  );
}

describe('SentimentRating', () => {
  it('renders counts', () => {
    renderComponent();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onRate when good is clicked', () => {
    const onRate = vi.fn();
    renderComponent({ onRate });
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    expect(onRate).toHaveBeenCalledWith('good');
  });

  it('marks active rating', () => {
    renderComponent({ summary: { worldId: 'wrld_123', good: 3, bad: 1, userRating: 'good' } });
    const goodButton = screen.getByRole('button', { name: /Good/i });
    expect(goodButton).toHaveAttribute('aria-pressed', 'true');
  });
});
```

- [ ] **Step 3: Create `SentimentCommentForm` component**

Create `src/components/sentiment-comment-form/SentimentCommentForm.tsx`:

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { validateComment } from '../../utils/commentValidation';
import type { CommentValidationError } from '../../utils/commentValidation';

interface SentimentCommentFormProps {
  isSubmitting: boolean;
  onSubmit: (content: string) => void;
}

const MAX_LENGTH = 256;

const errorKeyMap: Record<CommentValidationError, string> = {
  tooLong: 'sentiment.validation.tooLong',
  noLinks: 'sentiment.validation.noLinks',
  noEmails: 'sentiment.validation.noEmails',
  noMarkup: 'sentiment.validation.noMarkup',
  noExcessWhitespace: 'sentiment.validation.noExcessWhitespace',
  empty: 'sentiment.validation.empty',
};

export function SentimentCommentForm({ isSubmitting, onSubmit }: SentimentCommentFormProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [error, setError] = useState<CommentValidationError | null>(null);

  const handleChange = (value: string) => {
    setContent(value);
    const result = validateComment(value);
    setError(result.valid ? null : result.reason);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateComment(content);
    if (!result.valid) {
      setError(result.reason);
      return;
    }
    onSubmit(content.trim());
    setContent('');
    setError(null);
  };

  const length = content.trim().length;

  return (
    <form onSubmit={handleSubmit} className="space-y-2" data-testid="sentiment-comment-form">
      <div>
        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={t('sentiment.comments.placeholder')}
          maxLength={MAX_LENGTH + 1}
          rows={3}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{error ? t(errorKeyMap[error]) : '\u00A0'}</span>
          <span className={length > MAX_LENGTH ? 'text-red-500' : ''}>
            {t('sentiment.comments.count', { count: length, max: MAX_LENGTH })}
          </span>
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !content.trim() || !!error}
        className="btn-primary text-sm"
      >
        {t('sentiment.comments.submit')}
      </button>
    </form>
  );
}
```

Create `src/components/sentiment-comment-form/index.ts`:

```ts
export { SentimentCommentForm } from './SentimentCommentForm';
```

Create `src/components/sentiment-comment-form/SentimentCommentForm.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SentimentCommentForm } from './SentimentCommentForm';

describe('SentimentCommentForm', () => {
  it('submits valid comment', () => {
    const onSubmit = vi.fn();
    render(<SentimentCommentForm isSubmitting={false} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText(/short comment/i), {
      target: { value: 'Great world!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /post comment/i }));
    expect(onSubmit).toHaveBeenCalledWith('Great world!');
  });

  it('shows validation error for url', () => {
    render(<SentimentCommentForm isSubmitting={false} onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/short comment/i), {
      target: { value: 'https://example.com' },
    });
    expect(screen.getByText(/links are not allowed/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Create `SentimentCommentList` component**

Create `src/components/sentiment-comment-list/SentimentCommentList.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import type { Comment } from '../../types';

interface SentimentCommentListProps {
  comments: Comment[] | undefined;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function SentimentCommentList({ comments }: SentimentCommentListProps) {
  const { t } = useTranslation();

  if (!comments || comments.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{t('sentiment.comments.empty')}</p>;
  }

  return (
    <ul className="space-y-3" data-testid="sentiment-comment-list">
      {comments.map((comment) => (
        <li key={comment.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">{comment.username}</span>
            <span title={new Date(comment.created_at).toLocaleString()}>
              {t('sentiment.comments.postedAt', { time: formatTimeAgo(comment.created_at) })}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">
            {comment.content}
          </p>
        </li>
      ))}
    </ul>
  );
}
```

Create `src/components/sentiment-comment-list/index.ts`:

```ts
export { SentimentCommentList } from './SentimentCommentList';
```

Create `src/components/sentiment-comment-list/SentimentCommentList.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SentimentCommentList } from './SentimentCommentList';

describe('SentimentCommentList', () => {
  it('shows empty state', () => {
    render(<SentimentCommentList comments={[]} />);
    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
  });

  it('renders comments', () => {
    const comments = [
      {
        id: 'c1',
        world_id: 'w1',
        user_id: 'u1',
        username: 'Anonymous',
        content: 'Nice!',
        created_at: new Date().toISOString(),
      },
    ];
    render(<SentimentCommentList comments={comments} />);
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
    expect(screen.getByText('Nice!')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Create `SentimentSection` composer**

Create `src/components/sentiment-section/SentimentSection.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { SentimentRating } from '../sentiment-rating';
import { SentimentCommentForm } from '../sentiment-comment-form';
import { SentimentCommentList } from '../sentiment-comment-list';
import { useComments, useRatings, useSubmitComment, useSubmitRating } from '../../hooks/useSentiment';

interface SentimentSectionProps {
  worldId: string;
}

export function SentimentSection({ worldId }: SentimentSectionProps) {
  const { t } = useTranslation();
  const { data: ratings, isLoading: ratingsLoading } = useRatings(worldId);
  const { data: comments, isLoading: commentsLoading } = useComments(worldId);
  const submitRating = useSubmitRating();
  const submitComment = useSubmitComment();

  const handleRate = async (value: 'good' | 'bad') => {
    try {
      await submitRating.mutateAsync({ worldId, value });
    } catch (err) {
      toast.error(t('sentiment.ratings.submitError', { message: (err as Error).message }));
    }
  };

  const handleComment = async (content: string) => {
    try {
      await submitComment.mutateAsync({ worldId, content });
    } catch (err) {
      toast.error(t('sentiment.comments.submitError', { message: (err as Error).message }));
    }
  };

  return (
    <section className="card p-5 sm:p-6" data-testid="sentiment-section" aria-label={t('sentiment.comments.title')}>
      <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
        {t('sentiment.comments.title')}
      </h2>
      <div className="mb-6">
        <SentimentRating
          summary={ratings}
          isLoading={ratingsLoading}
          isSubmitting={submitRating.isPending}
          onRate={handleRate}
        />
      </div>
      <div className="mb-6">
        <SentimentCommentForm
          isSubmitting={submitComment.isPending}
          onSubmit={handleComment}
        />
      </div>
      <SentimentCommentList comments={comments} />
    </section>
  );
}
```

Create `src/components/sentiment-section/index.ts`:

```ts
export { SentimentSection } from './SentimentSection';
```

Create `src/components/sentiment-section/SentimentSection.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SentimentSection } from './SentimentSection';

const mockUseRatings = vi.fn();
const mockUseComments = vi.fn();
const mockUseSubmitRating = vi.fn();
const mockUseSubmitComment = vi.fn();

vi.mock('../../hooks/useSentiment', () => ({
  useRatings: () => mockUseRatings(),
  useComments: () => mockUseComments(),
  useSubmitRating: () => mockUseSubmitRating(),
  useSubmitComment: () => mockUseSubmitComment(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('SentimentSection', () => {
  it('renders section', () => {
    mockUseRatings.mockReturnValue({ data: { worldId: 'w1', good: 0, bad: 0, userRating: null }, isLoading: false });
    mockUseComments.mockReturnValue({ data: [], isLoading: false });
    mockUseSubmitRating.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
    mockUseSubmitComment.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });

    render(<SentimentSection worldId="w1" />, { wrapper });
    expect(screen.getByTestId('sentiment-section')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run tests and lint**

Run:
```bash
pnpm vitest run src/components/sentiment-rating src/components/sentiment-comment-form src/components/sentiment-comment-list src/components/sentiment-section
pnpm run lint
```

Expected: tests PASS, lint has no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/sentiment-rating src/components/sentiment-comment-form src/components/sentiment-comment-list src/components/sentiment-section src/i18n/locales/en.json src/i18n/locales/ja.json
git commit -m "feat(sentiment): add sentiment rating, comment form, list, and section components"
```

---

### Task 8: Integrate sentiment section into world detail page

**Files:**
- Modify: `src/pages/world-detail/WorldDetailPage.tsx`
- Modify: `src/pages/world-detail/WorldDetailPage.test.tsx`

- [ ] **Step 1: Mount SentimentSection below action buttons**

Modify `src/pages/world-detail/WorldDetailPage.tsx`:

Add import near the top:
```tsx
import { SentimentSection } from '../../components/sentiment-section';
```

Insert below the action button div (after `<SaveToListDialog ... />`):

```tsx
            <div className="mt-6">
              <SentimentSection worldId={w.worldId} />
            </div>
```

- [ ] **Step 2: Update WorldDetailPage tests**

Add to `src/pages/world-detail/WorldDetailPage.test.tsx` a mock for the sentiment hooks. If the page test already mocks `useWorld`, add mocks for `useRatings`, `useComments`, `useSubmitRating`, and `useSubmitComment` so existing tests still pass.

Example mock block to add near other mocks:

```tsx
vi.mock('../../hooks/useSentiment', () => ({
  useRatings: () => ({ data: { worldId: 'w1', good: 0, bad: 0, userRating: null }, isLoading: false }),
  useComments: () => ({ data: [], isLoading: false }),
  useSubmitRating: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useSubmitComment: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));
```

- [ ] **Step 3: Run tests and build**

Run:
```bash
pnpm vitest run src/pages/world-detail
pnpm run build
pnpm run lint
```

Expected: all PASS, build succeeds, lint clean.

- [ ] **Step 4: Commit**

```bash
git add src/pages/world-detail/WorldDetailPage.tsx src/pages/world-detail/WorldDetailPage.test.tsx
git commit -m "feat(world-detail): integrate community sentiment section"
```

---

### Task 9: Final verification

**Files:** all of the above

- [ ] **Step 1: Run full test suite**

Run:
```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 2: Run full build**

Run:
```bash
pnpm run build
```

Expected: no TypeScript or build errors.

- [ ] **Step 3: Run lint**

Run:
```bash
pnpm run lint
```

Expected: zero warnings.

- [ ] **Step 4: Final commit if any changes**

If fixes were needed:
```bash
git add -A
git commit -m "fix(sentiment): address test, lint, and build issues"
```

---

## Self-review checklist

- **Spec coverage:** All schema-dependent frontend pieces from `docs/plans/community-sentiment-implementation-plan.md` are covered: client, username generator, validation, API layer, hooks, UI components, page integration, i18n, tests, docs.
- **Placeholder scan:** No TODOs/TBDs. Each step has concrete code, commands, and expected outputs.
- **Type consistency:** `Rating`, `RatingSummary`, `Comment` match usage in `api/sentiment.ts` and `hooks/useSentiment.ts`. Hook mutation arguments match component usage.
- **Security:** API layer uses publishable key from env, never service role. RLS already enforced on Supabase side.
- **Out of scope:** No full accounts, no threading, no real-time, no backend migration.
