import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RatingSummary } from '../../types';

interface SentimentRatingProps {
  summary: RatingSummary | undefined;
  isLoading: boolean;
  isSubmitting: boolean;
  onRate: (value: 'good' | 'bad') => void;
  onRemove: () => void;
}

export function SentimentRating({ summary, isLoading, isSubmitting, onRate, onRemove }: SentimentRatingProps) {
  const { t } = useTranslation();

  const isGoodActive = summary?.userRating === 'good';
  const isBadActive = summary?.userRating === 'bad';
  const total = (summary?.good ?? 0) + (summary?.bad ?? 0);
  const goodPercent = total > 0 ? Math.round(((summary?.good ?? 0) / total) * 100) : 0;
  const badPercent = total > 0 ? 100 - goodPercent : 0;

  return (
    <div className="space-y-3" data-testid="sentiment-rating">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isLoading || isSubmitting}
          onClick={() => (isGoodActive ? onRemove() : onRate('good'))}
          className={`btn-secondary gap-2 text-sm ${
            isGoodActive
              ? 'border-green-500/50 bg-green-500/15 text-green-700 dark:text-green-300'
              : ''
          }`}
          aria-pressed={isGoodActive}
        >
          <ThumbsUp className="h-4 w-4" />
          {t('sentiment.ratings.good')}
          <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700">
            {summary?.good ?? 0}
          </span>
        </button>
        <button
          type="button"
          disabled={isLoading || isSubmitting}
          onClick={() => (isBadActive ? onRemove() : onRate('bad'))}
          className={`btn-secondary gap-2 text-sm ${
            isBadActive
              ? 'border-red-500/50 bg-red-500/15 text-red-700 dark:text-red-300'
              : ''
          }`}
          aria-pressed={isBadActive}
        >
          <ThumbsDown className="h-4 w-4" />
          {t('sentiment.ratings.bad')}
          <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700">
            {summary?.bad ?? 0}
          </span>
        </button>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
        aria-label={t('sentiment.ratings.ratingBarLabel')}
        aria-valuenow={goodPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      >
        {total === 0 ? (
          <div className="h-full w-full bg-slate-300 dark:bg-slate-600" />
        ) : (
          <>
            <div
              className="float-left h-full bg-green-500"
              style={{ width: `${goodPercent}%` }}
              title={`${goodPercent}% ${t('sentiment.ratings.good')}`}
            />
            <div
              className="float-left h-full bg-red-500"
              style={{ width: `${badPercent}%` }}
              title={`${badPercent}% ${t('sentiment.ratings.bad')}`}
            />
          </>
        )}
      </div>
    </div>
  );
}
