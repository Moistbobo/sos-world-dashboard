import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useCurrentUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};
    if (!supabase) {
      return () => {
        cancelled = true;
      };
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setUserId(data.session?.user?.id ?? null);
      }
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setUserId(session?.user?.id ?? null);
      }
    });
    unsubscribe = subscription.subscription?.unsubscribe ?? (() => {});
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return userId;
}
