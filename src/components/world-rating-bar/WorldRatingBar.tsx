import { useTranslation } from 'react-i18next';
import type { RatingSummary } from '../../types';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';

export type WorldRatingBarVariant = 'card' | 'list';

interface WorldRatingBarProps {
  summary: RatingSummary | undefined;
  variant: WorldRatingBarVariant;
}

export function WorldRatingBar({ summary, variant }: WorldRatingBarProps) {
  const { t } = useTranslation();
  const good = summary?.good ?? 0;
  const bad = summary?.bad ?? 0;
  const total = good + bad;
  const isEmpty = total === 0;
  const goodPercent = isEmpty ? 0 : Math.round((good / total) * 100);
  const badPercent = isEmpty ? 0 : 100 - goodPercent;

  if (isEmpty) {
    return null;
  }

  if (variant === 'list') {
    return (
      <div
        className={stylex.props(styles.cltrpab).className}
        data-testid="world-rating-bar-list"
      >
        <div
          className={stylex.props(styles.c1du6otd).className}
          role="img"
          aria-label={`${goodPercent}% ${t('sentiment.ratings.good')} · ${t('sentiment.ratings.totalRatings', { count: total })}`}
        >
          <div
            className={stylex.props(styles.cwbafq4).className}
            style={{ width: `${goodPercent}%` }}
          />
          <div
            className={stylex.props(styles.c1u4ke18).className}
            style={{ width: `${badPercent}%` }}
          />
        </div>
        <p className={stylex.props(styles.c10tl28u).className}>
          <span
            className={
              goodPercent >= 50
                ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                : 'font-semibold text-rose-600 dark:text-rose-400'
            }
          >
            {goodPercent}%
          </span>{' '}
          {t('sentiment.ratings.good')} · {total}
        </p>
      </div>
    );
  }

  return (
    <div className={stylex.props(styles.c200p9).className} data-testid="world-rating-bar-card">
      <div
        className={stylex.props(styles.c1rw3ezr).className}
        role="img"
        aria-label={`${goodPercent}% ${t('sentiment.ratings.good')} · ${t('sentiment.ratings.totalRatings', { count: total })}`}
      >
        <div
          className={stylex.props(styles.cwbafq4).className}
          style={{ width: `${goodPercent}%` }}
        />
        <div
          className={stylex.props(styles.c1u4ke18).className}
          style={{ width: `${badPercent}%` }}
        />
      </div>
      <p className={stylex.props(styles.cy922ao).className}>
        <span className={stylex.props(styles.c1fbimet).className}>{goodPercent}%</span>{' '}
        · {t('sentiment.ratings.totalRatings', { count: total })}
      </p>
    </div>
  );
}

const styles = stylex.create({
  cltrpab: {
    "width": "110px",
    "display": "flex",
    "flexDirection": "column",
    "gap": "0.25rem",
  },
  c1du6otd: {
    "position": "relative",
    "height": "0.375rem",
    "width": "100%",
    "overflow": "hidden",
    "borderRadius": "9999px",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  cwbafq4: {
    "position": "absolute",
    "top": 0,
    "bottom": 0,
    "left": "0",
    "borderRadius": "9999px",
    "backgroundColor": "#10b981",
  },
  c1u4ke18: {
    "position": "absolute",
    "top": 0,
    "bottom": 0,
    "right": "0",
    "borderRadius": "9999px",
    "backgroundColor": "#f43f5e",
  },
  c10tl28u: {
    "textAlign": "right",
    "fontSize": "11px",
    "fontVariantNumeric": "tabular-nums",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c200p9: {
    "marginTop": "0.75rem",
  },
  c1rw3ezr: {
    "position": "relative",
    "height": "0.5rem",
    "width": "100%",
    "overflow": "hidden",
    "borderRadius": "9999px",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  cy922ao: {
    "marginTop": "0.25rem",
    "fontSize": "11px",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1fbimet: {
    "fontWeight": 600,
    "color": colors["--sos-text-slate-700-slate-300"],
  },
});
