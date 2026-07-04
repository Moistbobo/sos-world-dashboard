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
