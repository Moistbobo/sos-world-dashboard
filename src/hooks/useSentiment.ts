import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchComments,
  fetchRatings,
  submitComment,
  submitRating,
  updateRating,
  deleteRating,
} from '../api/sentiment';
import { useCurrentUserId } from './useCurrentUser';
import { generateUsername } from '../utils/username';
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

type RatingMutationVariables = {
  worldId: string;
  value?: 'good' | 'bad';
  captchaToken?: string;
};

function useRatingMutation<TVariables extends RatingMutationVariables>(
  mutationFn: (variables: TVariables) => Promise<void>,
  computeNext: (previous: RatingSummary, variables: TVariables) => RatingSummary | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      const queryKey = ['ratings', variables.worldId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<RatingSummary>(queryKey);

      if (previous) {
        const next = computeNext(previous, variables);
        if (next) {
          queryClient.setQueryData(queryKey, next);
        }
      }

      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['ratings', variables.worldId], context.previous);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', variables.worldId] });
    },
  });
}

export function useSubmitRating() {
  return useRatingMutation(
    ({ worldId, value, captchaToken }) => submitRating(worldId, value!, captchaToken),
    (previous, { value }) => {
      if (!value) return undefined;
      const next: RatingSummary = { ...previous };
      if (previous.userRating && previous.userRating !== value) {
        next[previous.userRating] = Math.max(0, next[previous.userRating] - 1);
        next[value]++;
      } else if (!previous.userRating) {
        next[value]++;
      } else {
        return undefined;
      }
      next.userRating = value;
      return next;
    },
  );
}

export function useUpdateRating() {
  return useRatingMutation(
    ({ worldId, value, captchaToken }) => updateRating(worldId, value!, captchaToken),
    (previous, { value }) => {
      if (!value || !previous.userRating || previous.userRating === value) {
        return undefined;
      }
      return {
        ...previous,
        good: value === 'good' ? previous.good + 1 : Math.max(0, previous.good - 1),
        bad: value === 'bad' ? previous.bad + 1 : Math.max(0, previous.bad - 1),
        userRating: value,
      };
    },
  );
}

export function useDeleteRating() {
  return useRatingMutation(
    ({ worldId, captchaToken }) => deleteRating(worldId, captchaToken),
    (previous) => {
      if (!previous.userRating) return undefined;
      return {
        ...previous,
        good: previous.userRating === 'good' ? Math.max(0, previous.good - 1) : previous.good,
        bad: previous.userRating === 'bad' ? Math.max(0, previous.bad - 1) : previous.bad,
        userRating: null,
      };
    },
  );
}

export function useSubmitComment() {
  const queryClient = useQueryClient();
  const currentUserId = useCurrentUserId();
  return useMutation({
    mutationFn: ({
      worldId,
      content,
      captchaToken,
    }: {
      worldId: string;
      content: string;
      captchaToken?: string;
    }) => submitComment(worldId, content, captchaToken),
    onMutate: async ({ worldId, content }) => {
      const queryKey = ['comments', worldId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Comment[]>(queryKey) ?? [];

      const optimistic: Comment = {
        id: `optimistic-${Date.now()}`,
        world_id: worldId,
        user_id: currentUserId ?? '',
        username: generateUsername(),
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
