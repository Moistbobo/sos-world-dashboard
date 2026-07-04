import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
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

  return (
    <div className="flex flex-wrap items-center gap-3" data-testid="sentiment-rating">
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
      {isGoodActive && (
        <button
          type="button"
          disabled={isLoading || isSubmitting}
          onClick={onRemove}
          aria-label={t('sentiment.ratings.removeRating')}
          className="btn-secondary p-2 text-sm"
          data-testid="remove-rating"
        >
          <X className="h-4 w-4" />
        </button>
      )}
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
      {isBadActive && (
        <button
          type="button"
          disabled={isLoading || isSubmitting}
          onClick={onRemove}
          aria-label={t('sentiment.ratings.removeRating')}
          className="btn-secondary p-2 text-sm"
          data-testid="remove-rating"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
