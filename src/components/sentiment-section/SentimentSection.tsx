import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { SentimentRating } from '../sentiment-rating';
import { SentimentCommentForm } from '../sentiment-comment-form';
import { SentimentCommentList } from '../sentiment-comment-list';
import { useComments, useRatings, useSubmitComment, useSubmitRating } from '../../hooks/useSentiment';

interface SentimentSectionProps {
  worldId: string;
}

export function SentimentSection({ worldId }: SentimentSectionProps) {
  const { t } = useTranslation();
  const { data: ratings, isLoading: ratingsLoading } = useRatings(worldId);
  const { data: comments } = useComments(worldId);
  const submitRating = useSubmitRating();
  const submitComment = useSubmitComment();

  const handleRate = async (value: 'good' | 'bad') => {
    try {
      await submitRating.mutateAsync({ worldId, value });
    } catch (err) {
      toast.error(t('sentiment.ratings.submitError', { message: (err as Error).message }));
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
    <section className="card p-5 sm:p-6" data-testid="sentiment-section" aria-label={t('sentiment.comments.title')}>
      <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
        {t('sentiment.comments.title')}
      </h2>
      <div className="mb-6">
        <SentimentRating
          summary={ratings}
          isLoading={ratingsLoading}
          isSubmitting={submitRating.isPending}
          onRate={handleRate}
        />
      </div>
      <div className="mb-6">
        <SentimentCommentForm
          isSubmitting={submitComment.isPending}
          onSubmit={handleComment}
        />
      </div>
      <SentimentCommentList comments={comments} />
    </section>
  );
}
