import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RatingSummary } from '../../types';

interface SentimentRatingProps {
  summary: RatingSummary | undefined;
  isLoading: boolean;
  isSubmitting: boolean;
  onRate: (value: 'good' | 'bad') => void;
}

export function SentimentRating({ summary, isLoading, isSubmitting, onRate }: SentimentRatingProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3" data-testid="sentiment-rating">
      <button
        type="button"
        disabled={isLoading || isSubmitting}
        onClick={() => onRate('good')}
        className={`btn-secondary gap-2 text-sm ${
          summary?.userRating === 'good'
            ? 'border-green-500/50 bg-green-500/15 text-green-700 dark:text-green-300'
            : ''
        }`}
        aria-pressed={summary?.userRating === 'good'}
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
        onClick={() => onRate('bad')}
        className={`btn-secondary gap-2 text-sm ${
          summary?.userRating === 'bad'
            ? 'border-red-500/50 bg-red-500/15 text-red-700 dark:text-red-300'
            : ''
        }`}
        aria-pressed={summary?.userRating === 'bad'}
      >
        <ThumbsDown className="h-4 w-4" />
        {t('sentiment.ratings.bad')}
        <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700">
          {summary?.bad ?? 0}
        </span>
      </button>
    </div>
  );
}
