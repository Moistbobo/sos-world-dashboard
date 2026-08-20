import { supabase } from '../lib/supabase';
import { generateUsername } from '../utils/username';
import type { Comment, Rating, RatingSummary, RecentActivityItem } from '../types';

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
    .maybeSingle();

  if (error) throw new Error(error.message);

  return {
    worldId,
    good: data?.good ?? 0,
    bad: data?.bad ?? 0,
    userRating: data?.user_rating ?? null,
  };
}

export async function fetchRatingsForWorldIds(
  worldIds: readonly string[],
): Promise<Map<string, RatingSummary>> {
  const result = new Map<string, RatingSummary>();
  const uniqueIds = Array.from(new Set(worldIds));
  if (uniqueIds.length === 0) return result;

  const { data, error } = await supabase
    .from('ratings_summary')
    .select('*')
    .in('world_id', uniqueIds);

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const r = row as { world_id: string; good: number; bad: number; user_rating: 'good' | 'bad' | null };
    result.set(r.world_id, {
      worldId: r.world_id,
      good: r.good ?? 0,
      bad: r.bad ?? 0,
      userRating: r.user_rating ?? null,
    });
  }
  return result;
}

export interface FetchCommentsParams {
  limit?: number;
  offset?: number;
}

export interface FetchCommentsResult {
  comments: Comment[];
  total: number;
}

export async function fetchComments(
  worldId: string,
  params: FetchCommentsParams = {},
): Promise<FetchCommentsResult> {
  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;

  const [{ data, error }, { count: total, error: countError }] = await Promise.all([
    supabase
      .from('comments')
      .select('*')
      .eq('world_id', worldId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1),
    supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('world_id', worldId),
  ]);

  if (error) throw new Error(error.message);
  if (countError) throw new Error(countError.message);

  return {
    comments: (data ?? []) as Comment[],
    total: total ?? 0,
  };
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

export const RECENT_ACTIVITY_QUERY_LIMIT = 20;
export const RECENT_ACTIVITY_MAX = 10;

export function mergeRecentActivity(
  ratings: Rating[],
  comments: Comment[],
  max: number = RECENT_ACTIVITY_MAX,
): RecentActivityItem[] {
  const items: RecentActivityItem[] = [
    ...ratings.map((rating) => ({
      type: 'rating' as const,
      id: rating.id,
      worldId: rating.world_id,
      value: rating.value,
      createdAt: rating.created_at,
    })),
    ...comments.map((comment) => ({
      type: 'comment' as const,
      id: comment.id,
      worldId: comment.world_id,
      username: comment.username,
      content: comment.content,
      createdAt: comment.created_at,
    })),
  ];
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, max);
}

export async function fetchRecentActivity(): Promise<RecentActivityItem[]> {
  const [{ data: ratings, error: ratingsError }, { data: comments, error: commentsError }] =
    await Promise.all([
      supabase
        .from('ratings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(RECENT_ACTIVITY_QUERY_LIMIT),
      supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(RECENT_ACTIVITY_QUERY_LIMIT),
    ]);

  if (ratingsError) throw new Error(ratingsError.message);
  if (commentsError) throw new Error(commentsError.message);

  return mergeRecentActivity((ratings ?? []) as Rating[], (comments ?? []) as Comment[]);
}
