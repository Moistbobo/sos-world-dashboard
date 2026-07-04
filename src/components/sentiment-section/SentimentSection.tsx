import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { SentimentRating } from '../sentiment-rating';
import { SentimentCommentForm } from '../sentiment-comment-form';
import { SentimentCommentList } from '../sentiment-comment-list';
import { TurnstileChallenge } from '../turnstile-challenge';
import {
  useComments,
  useRatings,
  useSubmitComment,
  useSubmitRating,
  useUpdateRating,
  useDeleteRating,
} from '../../hooks/useSentiment';
import { useCaptcha } from '../../hooks/useCaptcha';
import { hasAnonymousSession } from '../../api/sentiment';

interface SentimentSectionProps {
  worldId: string;
}

export function SentimentSection({ worldId }: SentimentSectionProps) {
  const { t } = useTranslation();
  const siteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ?? '';
  const { data: ratings, isLoading: ratingsLoading } = useRatings(worldId);
  const { data: comments } = useComments(worldId);
  const submitRating = useSubmitRating();
  const updateRating = useUpdateRating();
  const deleteRating = useDeleteRating();
  const submitComment = useSubmitComment();
  const { isRequired, challengeKey, requestToken, onVerify, onError } = useCaptcha();

  const isSubmitting =
    submitRating.isPending ||
    updateRating.isPending ||
    deleteRating.isPending ||
    submitComment.isPending ||
    isRequired;

  const getCaptchaToken = async () => {
    const hasSession = await hasAnonymousSession();
    if (hasSession) return undefined;
    if (!siteKey) throw new Error(t('sentiment.captcha.missingKey'));
    return requestToken();
  };

  const isCaptchaCancelled = (err: unknown): boolean =>
    err instanceof Error && err.message === 'Captcha challenge was cancelled';

  const handleRate = async (value: 'good' | 'bad') => {
    try {
      const captchaToken = await getCaptchaToken();
      if (!ratings?.userRating) {
        await submitRating.mutateAsync({ worldId, value, captchaToken });
      } else if (ratings.userRating !== value) {
        await updateRating.mutateAsync({ worldId, value, captchaToken });
      } else {
        await deleteRating.mutateAsync({ worldId, captchaToken });
      }
    } catch (err) {
      if (isCaptchaCancelled(err)) return;
      toast.error(t('sentiment.ratings.submitError', { message: (err as Error).message }));
    }
  };

  const handleRemove = async () => {
    try {
      const captchaToken = await getCaptchaToken();
      await deleteRating.mutateAsync({ worldId, captchaToken });
    } catch (err) {
      if (isCaptchaCancelled(err)) return;
      toast.error(t('sentiment.ratings.removeRatingError', { message: (err as Error).message }));
    }
  };

  const handleComment = async (content: string) => {
    try {
      const captchaToken = await getCaptchaToken();
      await submitComment.mutateAsync({ worldId, content, captchaToken });
    } catch (err) {
      if (isCaptchaCancelled(err)) return;
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
      {isRequired && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
            {t('sentiment.captcha.description')}
          </p>
          <TurnstileChallenge
            key={challengeKey}
            siteKey={siteKey}
            onVerify={onVerify}
            onError={onError}
          />
        </div>
      )}
      <div className="mb-6">
        <SentimentCommentForm
          isSubmitting={submitComment.isPending || isRequired}
          onSubmit={handleComment}
        />
      </div>
      <SentimentCommentList comments={comments} />
    </div>
  );
}
