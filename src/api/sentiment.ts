import { supabase } from '../lib/supabase';
import { generateUsername } from '../utils/username';
import type { Comment, RatingSummary } from '../types';

async function ensureAnonymousUser(captchaToken?: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const existing = sessionData.session?.user;
  if (existing?.is_anonymous) {
    return existing;
  }
  const { data, error } = await supabase.auth.signInAnonymously({
    options: captchaToken ? { captchaToken } : undefined,
  });
  if (error) throw error;
  if (!data.user?.is_anonymous) throw new Error('Anonymous sign-in failed');
  return data.user;
}

export async function hasAnonymousSession(): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData.session?.user?.is_anonymous === true;
}

export async function fetchRatings(worldId: string): Promise<RatingSummary> {
  const { data, error } = await supabase
    .from('ratings_summary')
    .select('*')
    .eq('world_id', worldId)
    .single();

  if (error) throw new Error(error.message);

  return {
    worldId,
    good: data?.good ?? 0,
    bad: data?.bad ?? 0,
    userRating: data?.user_rating ?? null,
  };
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

export async function submitRating(
  worldId: string,
  value: 'good' | 'bad',
  captchaToken?: string,
): Promise<void> {
  const user = await ensureAnonymousUser(captchaToken);
  const { error } = await supabase.from('ratings').insert({
    world_id: worldId,
    user_id: user.id,
    value,
  });
  if (error) throw new Error(error.message);
}

export async function updateRating(
  worldId: string,
  value: 'good' | 'bad',
  captchaToken?: string,
): Promise<void> {
  const user = await ensureAnonymousUser(captchaToken);
  const { error } = await supabase
    .from('ratings')
    .update({ value })
    .eq('world_id', worldId)
    .eq('user_id', user.id);
  if (error) throw new Error(error.message);
}

export async function deleteRating(worldId: string, captchaToken?: string): Promise<void> {
  const user = await ensureAnonymousUser(captchaToken);
  const { error } = await supabase
    .from('ratings')
    .delete()
    .eq('world_id', worldId)
    .eq('user_id', user.id);
  if (error) throw new Error(error.message);
}

export async function submitComment(
  worldId: string,
  content: string,
  captchaToken?: string,
): Promise<Comment> {
  const user = await ensureAnonymousUser(captchaToken);
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
