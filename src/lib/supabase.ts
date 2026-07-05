import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function isValidSupabaseUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const hasValidEnv = isValidSupabaseUrl(url) && typeof key === 'string' && key.length > 0;

// Defensive: ensure the anonymous session persists across page reloads
// so the same anonymous user_id is reused for community sentiment.
// supabase-js defaults this to true, but we set it explicitly to guard against regressions.
export const supabase = hasValidEnv
  ? createClient(url, key, {
      auth: {
        persistSession: true,
      },
    })
  : (null as unknown as ReturnType<typeof createClient>);
