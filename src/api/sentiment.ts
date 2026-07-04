import { supabase } from '../lib/supabase';
import { generateUsername } from '../utils/username';
import type { Comment, RatingSummary } from '../types';

async function ensureAnonymousUser() {
  const { data: sessionData } = await supabase.auth.getSession();
  const existing = sessionData.session?.user;
  if (existing?.is_anonymous) {
    return existing;
  }
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user?.is_anonymous) throw new Error('Anonymous sign-in failed');
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

export async function updateRating(worldId: string, value: 'good' | 'bad'): Promise<void> {
  const user = await ensureAnonymousUser();
  const { error } = await supabase
    .from('ratings')
    .update({ value })
    .eq('world_id', worldId)
    .eq('user_id', user.id);
  if (error) throw new Error(error.message);
}

export async function deleteRating(worldId: string): Promise<void> {
  const user = await ensureAnonymousUser();
  const { error } = await supabase
    .from('ratings')
    .delete()
    .eq('world_id', worldId)
    .eq('user_id', user.id);
  if (error) throw new Error(error.message);
}

export async function submitComment(worldId: string, content: string): Promise<Comment> {
  const user = await ensureAnonymousUser();
  const username = generateUsername(user.id);
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
