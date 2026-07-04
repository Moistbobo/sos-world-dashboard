import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (typeof url !== 'string' || !url) {
  throw new Error('Missing VITE_SUPABASE_URL');
}
if (typeof key !== 'string' || !key) {
  throw new Error('Missing VITE_SUPABASE_PUBLISHABLE_KEY');
}

// Defensive: ensure the anonymous session persists across page reloads
// so the same anonymous user_id is reused for community sentiment.
// supabase-js defaults this to true, but we set it explicitly to guard against regressions.
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
  },
});
