import type { ComposedSupabaseClient } from './supabase-client';

let clientPromise: Promise<ComposedSupabaseClient | null> | null = null;

export function getSupabase(): Promise<ComposedSupabaseClient | null> {
  if (!clientPromise) {
    clientPromise = import('./supabase-client').then((m) =>
      m.hasValidEnv ? m.createSupabaseClient(m.envUrl!, m.envKey!) : null,
    );
  }
  return clientPromise;
}
