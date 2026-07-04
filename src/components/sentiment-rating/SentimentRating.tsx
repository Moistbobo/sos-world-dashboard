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

export function SentimentRating({
  summary,
  isLoading,
  isSubmitting,
  onRate,
  onRemove,
}: SentimentRatingProps) {
  const { t } = useTranslation();

  const isGoodActive = summary?.userRating === 'good';
  const isBadActive = summary?.userRating === 'bad';
  const total = (summary?.good ?? 0) + (summary?.bad ?? 0);
  const goodPercent = total > 0 ? Math.round(((summary?.good ?? 0) / total) * 100) : 0;
  const badPercent = total > 0 ? 100 - goodPercent : 0;

  const handleGoodClick = () => {
    if (isGoodActive) {
      onRemove();
    } else {
      onRate('good');
    }
  };

  const handleBadClick = () => {
    if (isBadActive) {
      onRemove();
    } else {
      onRate('bad');
    }
  };

  return (
    <div className="space-y-2" data-testid="sentiment-rating">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t('sentiment.ratings.ratingBarLabel')}
      </p>
      <div
        className="relative flex h-12 w-full overflow-hidden rounded-full border border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700"
        aria-label={t('sentiment.ratings.ratingBarLabel')}
        aria-valuenow={goodPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-0 flex h-full w-full"
          data-testid="rating-fill-container"
        >
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${goodPercent}%` }}
            title={`${goodPercent}% ${t('sentiment.ratings.good')}`}
          >
            {goodPercent > 0 && (
              <span className="flex h-full items-center justify-center text-xs font-medium text-white">
                {goodPercent}%
              </span>
            )}
          </div>
          <div
            className="h-full bg-rose-500"
            style={{ width: `${badPercent}%` }}
            title={`${badPercent}% ${t('sentiment.ratings.bad')}`}
          >
            {badPercent > 0 && (
              <span className="flex h-full items-center justify-center text-xs font-medium text-white">
                {badPercent}%
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          disabled={isLoading || isSubmitting}
          onClick={handleGoodClick}
          className={`relative z-10 flex w-1/2 origin-left items-center justify-start px-4 text-sm font-medium transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            isGoodActive
              ? 'bg-emerald-500/10 text-emerald-700 focus-visible:ring-emerald-500 dark:text-emerald-300'
              : 'text-slate-700 hover:scale-105 hover:text-emerald-700 focus-visible:ring-emerald-500 dark:text-slate-200 dark:hover:text-emerald-300'
          }`}
          aria-pressed={isGoodActive}
        >
          <span className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            <span>{t('sentiment.ratings.good')}</span>
          </span>
        </button>
        <button
          type="button"
          disabled={isLoading || isSubmitting}
          onClick={handleBadClick}
          className={`relative z-10 flex w-1/2 origin-right items-center justify-end px-4 text-sm font-medium transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            isBadActive
              ? 'bg-rose-500/10 text-rose-700 focus-visible:ring-rose-500 dark:text-rose-300'
              : 'text-slate-700 hover:scale-105 hover:text-rose-700 focus-visible:ring-rose-500 dark:text-slate-200 dark:hover:text-rose-300'
          }`}
          aria-pressed={isBadActive}
        >
          <span className="flex items-center gap-2">
            <span>{t('sentiment.ratings.bad')}</span>
            <ThumbsDown className="h-4 w-4" />
          </span>
        </button>
      </div>
    </div>
  );
}
