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
