import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { SentimentRating } from '../sentiment-rating';
import { SentimentCommentForm } from '../sentiment-comment-form';
import { SentimentCommentList } from '../sentiment-comment-list';
import {
  useComments,
  useRatings,
  useSubmitComment,
  useSubmitRating,
  useUpdateRating,
  useDeleteRating,
} from '../../hooks/useSentiment';

interface SentimentSectionProps {
  worldId: string;
}

export function SentimentSection({ worldId }: SentimentSectionProps) {
  const { t } = useTranslation();
  const { data: ratings, isLoading: ratingsLoading } = useRatings(worldId);
  const { data: comments } = useComments(worldId);
  const submitRating = useSubmitRating();
  const updateRating = useUpdateRating();
  const deleteRating = useDeleteRating();
  const submitComment = useSubmitComment();

  const isSubmitting = submitRating.isPending || updateRating.isPending || deleteRating.isPending;

  const handleRate = async (value: 'good' | 'bad') => {
    try {
      if (!ratings?.userRating) {
        await submitRating.mutateAsync({ worldId, value });
      } else if (ratings.userRating !== value) {
        await updateRating.mutateAsync({ worldId, value });
      } else {
        await deleteRating.mutateAsync({ worldId });
      }
    } catch (err) {
      toast.error(t('sentiment.ratings.submitError', { message: (err as Error).message }));
    }
  };

  const handleRemove = async () => {
    try {
      await deleteRating.mutateAsync({ worldId });
    } catch (err) {
      toast.error(t('sentiment.ratings.removeRatingError', { message: (err as Error).message }));
    }
  };

  const handleComment = async (content: string) => {
    try {
      await submitComment.mutateAsync({ worldId, content });
    } catch (err) {
      toast.error(t('sentiment.comments.submitError', { message: (err as Error).message }));
    }
  };

  return (
    <div data-testid="sentiment-section">
      <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
        {t('sentiment.comments.title')}
      </h2>
      <div className="mb-6">
        <SentimentRating
          summary={ratings}
          isLoading={ratingsLoading}
          isSubmitting={isSubmitting}
          onRate={handleRate}
          onRemove={handleRemove}
        />
      </div>
      <div className="mb-6">
        <SentimentCommentForm
          isSubmitting={submitComment.isPending}
          onSubmit={handleComment}
        />
      </div>
      <SentimentCommentList comments={comments} />
    </div>
  );
}
