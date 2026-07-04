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
    onMutate: async ({ worldId, value }) => {
      const queryKey = ['ratings', worldId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<RatingSummary>(queryKey);

      if (previous) {
        const next: RatingSummary = { ...previous };
        if (previous.userRating && previous.userRating !== value) {
          next[previous.userRating]--;
          next[value]++;
        } else if (!previous.userRating) {
          next[value]++;
        }
        next.userRating = value;
        queryClient.setQueryData(queryKey, next);
      }

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['ratings', _variables.worldId], context.previous);
      }
    },
    onSettled: (_, __, { worldId }) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', worldId] });
    },
  });
}

export function useSubmitComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ worldId, content }: { worldId: string; content: string }) =>
      submitComment(worldId, content),
    onMutate: async ({ worldId, content }) => {
      const queryKey = ['comments', worldId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Comment[]>(queryKey) ?? [];

      const optimistic: Comment = {
        id: `optimistic-${Date.now()}`,
        world_id: worldId,
        user_id: '',
        username: 'You',
        content,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(queryKey, [optimistic, ...previous]);
      return { previous };
    },
    onError: (_err, { worldId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['comments', worldId], context.previous);
      }
    },
    onSettled: (_, __, { worldId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', worldId] });
    },
  });
}
