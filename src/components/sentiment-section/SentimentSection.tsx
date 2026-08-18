import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { SentimentRating } from '../sentiment-rating';
import { SentimentCommentForm } from '../sentiment-comment-form';
import { SentimentCommentList } from '../sentiment-comment-list';
import { TurnstileChallenge } from '../turnstile-challenge';
import {
  useInfiniteComments,
  useRatings,
  useSubmitComment,
  useSubmitRating,
  useUpdateRating,
  useDeleteRating,
} from '../../hooks/useSentiment';
import { useCaptcha } from '../../hooks/useCaptcha';
import { hasAnonymousSession } from '../../api/sentiment';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';

interface SentimentSectionProps {
  worldId: string;
}

export function SentimentSection({ worldId }: SentimentSectionProps) {
  const { t } = useTranslation();
  const siteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ?? '';
  const { data: ratings, isLoading: ratingsLoading } = useRatings(worldId);
  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteComments(worldId);
  const comments = data?.pages.flatMap((page) => page.comments) ?? [];
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

  const withCaptcha = async (
    action: (captchaToken?: string) => Promise<unknown>,
    errorKey: string,
  ) => {
    try {
      const captchaToken = await getCaptchaToken();
      await action(captchaToken);
    } catch (err) {
      if (isCaptchaCancelled(err)) return;
      toast.error(t(errorKey, { message: (err as Error).message }));
    }
  };

  const handleRate = async (value: 'good' | 'bad') => {
    await withCaptcha(async (captchaToken) => {
      if (!ratings?.userRating) {
        await submitRating.mutateAsync({ worldId, value, captchaToken });
      } else if (ratings.userRating !== value) {
        await updateRating.mutateAsync({ worldId, value, captchaToken });
      } else {
        await deleteRating.mutateAsync({ worldId, captchaToken });
      }
    }, 'sentiment.ratings.submitError');
  };

  const handleRemove = async () => {
    await withCaptcha(
      (captchaToken) => deleteRating.mutateAsync({ worldId, captchaToken }),
      'sentiment.ratings.removeRatingError',
    );
  };

  const handleComment = async (content: string) => {
    await withCaptcha(
      (captchaToken) => submitComment.mutateAsync({ worldId, content, captchaToken }),
      'sentiment.comments.submitError',
    );
  };

  return (
    <div data-testid="sentiment-section">
      <h2 className={stylex.props(styles.cg1e8gk).className}>
        {t('sentiment.comments.title')}
      </h2>
      <div className={stylex.props(styles.c1zncu).className}>
        <SentimentRating
          summary={ratings}
          isLoading={ratingsLoading}
          isSubmitting={isSubmitting}
          onRate={handleRate}
          onRemove={handleRemove}
        />
      </div>
      {isRequired && (
        <div className={stylex.props(styles.cjv8ivc).className}>
          <p className={stylex.props(styles.chny6a9).className}>
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
      <div className={stylex.props(styles.c1zncu).className}>
        <SentimentCommentForm
          isSubmitting={submitComment.isPending || isRequired}
          onSubmit={handleComment}
        />
      </div>
      <SentimentCommentList
        comments={comments}
        isLoading={isLoading}
        hasMore={!!hasNextPage}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />
    </div>
  );
}

const styles = stylex.create({
  cg1e8gk: {
    "marginBottom": "1rem",
    "fontSize": "1rem",
    "lineHeight": "1.5rem",
    "fontWeight": 600,
    "color": colors["--sos-text-slate-900-white"],
  },
  c1zncu: {
    "marginBottom": "1.5rem",
  },
  cjv8ivc: {
    "marginBottom": "1.5rem",
    "borderRadius": "0.5rem",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-200-slate-700"],
    "backgroundColor": colors["--sos-bg-slate-50-slate-800_50"],
    "padding": "1rem",
  },
  chny6a9: {
    "marginBottom": "0.75rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-700-slate-300"],
  },
});
