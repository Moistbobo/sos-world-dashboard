import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RatingSummary } from '../../types';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';

interface SentimentRatingProps {
  summary: RatingSummary | undefined;
  isLoading: boolean;
  isSubmitting: boolean;
  onRate: (value: 'good' | 'bad') => void;
  onRemove: () => void;
}

interface BarSegmentProps {
  percent: number;
  isActive: boolean;
  fillStyle: unknown;
  activeTextStyle: unknown;
  label: string;
}

function BarSegment({ percent, isActive, fillStyle, activeTextStyle, label }: BarSegmentProps) {
  if (percent <= 0) return null;
  return (
    <div
      className={stylex.props(styles.seg, fillStyle as never).className}
      style={{ width: `${percent}%` }}
      title={`${percent}% ${label}`}
    >
      <span
        className={stylex.props(
          styles.segText,
          isActive ? (activeTextStyle as never) : styles.segTextDefault,
        ).className}
      >
        {percent}%
      </span>
    </div>
  );
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
  const hasVoted = isGoodActive || isBadActive;
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
    <div className={stylex.props(styles.stack2).className} data-testid="sentiment-rating">
      <div
        className={stylex.props(styles.ckqnok4).className}
        aria-label={t('sentiment.ratings.ratingBarLabel')}
        aria-valuenow={goodPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      >
        <div
          className={stylex.props(styles.c1wcxnka).className}
          data-testid="rating-fill-container"
        >
          <BarSegment
            percent={goodPercent}
            isActive={isGoodActive}
            fillStyle={styles.fillGood}
            activeTextStyle={styles.fillGoodText}
            label={t('sentiment.ratings.good')}
          />
          <BarSegment
            percent={badPercent}
            isActive={isBadActive}
            fillStyle={styles.fillBad}
            activeTextStyle={styles.fillBadText}
            label={t('sentiment.ratings.bad')}
          />
        </div>
        <button
          type="button"
          disabled={isLoading || isSubmitting}
          onClick={handleGoodClick}
           className={`group ${stylex.props(styles.cmvbwxc).className}`}
          aria-label={t('sentiment.ratings.good')}
          aria-pressed={isGoodActive}
        >
          <ThumbsUp className={stylex.props(styles.c1g1cjcy).className} />
        </button>
        <button
          type="button"
          disabled={isLoading || isSubmitting}
          onClick={handleBadClick}
           className={`group ${stylex.props(styles.cww7eea).className}`}
          aria-label={t('sentiment.ratings.bad')}
          aria-pressed={isBadActive}
        >
          <ThumbsDown className={stylex.props(styles.c1g1cjcy).className} />
        </button>
      </div>
      <p className={stylex.props(styles.ce6m6tc).className}>
        {hasVoted ? (
          <>
            <span>{t('sentiment.ratings.yourVote')}</span>
            {isGoodActive ? (
              <ThumbsUp className={stylex.props(styles.c1too78j).className} />
            ) : (
              <ThumbsDown className={stylex.props(styles.c1aqy741).className} />
            )}
          </>
        ) : (
          <span>{t('sentiment.ratings.ratingBarLabel')}</span>
        )}
      </p>
    </div>
  );
}

const styles = stylex.create({
  stack2: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  ckqnok4: {
    "position": "relative",
    "display": "flex",
    "height": "3rem",
    "width": "100%",
    "overflow": "hidden",
    "borderRadius": "9999px",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-300-slate-600"],
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
    "transitionProperty": "box-shadow",
    "transitionDuration": "0.15s",
    "transitionTimingFunction": "cubic-bezier(0, 0, 0.2, 1)",
    ":hover": {
      "boxShadow": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    },
  },
  c1wcxnka: {
    "pointerEvents": "none",
    "position": "absolute",
    "top": 0,
    "bottom": 0,
    "left": "0",
    "zIndex": 0,
    "display": "flex",
    "height": "100%",
    "width": "100%",
  },
  cmvbwxc: {
    "position": "relative",
    "zIndex": 10,
    "display": "flex",
    "width": "50%",
    "alignItems": "center",
    "justifyContent": "flex-start",
    "paddingLeft": "1rem",
    "paddingRight": "1rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "color": colors["--sos-text-slate-700-slate-200"],
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke",
    "transitionDuration": "0.15s",
    "transitionTimingFunction": "cubic-bezier(0, 0, 0.2, 1)",
    ":hover": {
      "color": colors["--sos-text-slate-900-white"],
    },
    ":disabled": {
      "cursor": "not-allowed",
    },
    ":focus-visible": {
      "boxShadow": "0 0 0 2px #fff, 0 0 0 4px #10b981",
    },
  },
  c1g1cjcy: {
    "height": "1.25rem",
    "width": "1.25rem",
    "transitionProperty": "transform",
    "transitionDuration": "0.15s",
    "transitionTimingFunction": "cubic-bezier(0, 0, 0.2, 1)",
    ":is(.group:hover *)": {
      "transform": "scale(1.1)",
    },
  },
  cww7eea: {
    "position": "relative",
    "zIndex": 10,
    "display": "flex",
    "width": "50%",
    "alignItems": "center",
    "justifyContent": "flex-end",
    "paddingLeft": "1rem",
    "paddingRight": "1rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "color": colors["--sos-text-slate-700-slate-200"],
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke",
    "transitionDuration": "0.15s",
    "transitionTimingFunction": "cubic-bezier(0, 0, 0.2, 1)",
    ":hover": {
      "color": colors["--sos-text-slate-900-white"],
    },
    ":disabled": {
      "cursor": "not-allowed",
    },
    ":focus-visible": {
      "boxShadow": "0 0 0 2px #fff, 0 0 0 4px #f43f5e",
    },
  },
  ce6m6tc: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.375rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1too78j: {
    "height": "0.875rem",
    "width": "0.875rem",
    "color": colors["--sos-text-emerald-600-emerald-400"],
  },
  c1aqy741: {
    "height": "0.875rem",
    "width": "0.875rem",
    "color": colors["--sos-text-rose-600-rose-400"],
  },
  seg: {
    "height": "100%",
  },
  segText: {
    "display": "flex",
    "height": "100%",
    "alignItems": "center",
    "justifyContent": "center",
    "fontSize": "1.125rem",
    "lineHeight": "1.75rem",
    "fontWeight": 600,
  },
  segTextDefault: {
    "color": "#ffffff",
  },
  fillGood: {
    "backgroundColor": "#10b981",
  },
  fillGoodText: {
    "color": "#065f46",
    ':is(.dark *)': { "color": "#064e3b" },
  },
  fillBad: {
    "backgroundColor": "#f43f5e",
  },
  fillBadText: {
    "color": "#9f1239",
    ':is(.dark *)': { "color": "#881337" },
  },
});
