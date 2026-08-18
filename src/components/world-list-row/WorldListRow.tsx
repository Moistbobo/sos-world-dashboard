import { memo } from 'react';
import { List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RatingSummary, World } from '../../types';
import { TagBadge } from '../tag-badge';
import { getPlatformLabel } from '../../utils/platformLabel';
import { createWSRVUrl } from '../../utils/worldImageUrl';
import { WorldRatingBar } from '../world-rating-bar';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

interface WorldListRowProps {
  world: World;
  onSelect: (worldId: string) => void;
  onAuthorClick?: (authorName: string) => void;
  ratingSummary?: RatingSummary | null | undefined;
  showCuratorBadges?: boolean;
}

export const WorldListRow = memo(function WorldListRow({ world, onSelect, onAuthorClick, ratingSummary, showCuratorBadges = true }: WorldListRowProps) {
  const { t } = useTranslation();

  const handleSelect = () => onSelect(world.worldId);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      }}
      className={stylex.props(shared.card, styles.cz5tol1).className}
    >
      <div className={stylex.props(styles.cqhn3q7).className}>
        {world.imageUrl ? (
          <>
            <div
              aria-hidden="true"
              className={stylex.props(styles.cs0v3z7).className}
            />
            <img
              src={createWSRVUrl(world.imageUrl, 128)}
              alt=""
              loading="eager"
              decoding="async"
              fetchPriority="low"
              className={stylex.props(styles.c1godsng).className}
            />
          </>
        ) : (
          <div className={stylex.props(styles.cy7gia4).className}>
            <List className={stylex.props(styles.c1kz96fl).className} />
          </div>
        )}
      </div>
      <div className={stylex.props(styles.c1r022bi).className}>
        <div className={stylex.props(styles.c1bsnn56).className}>
          <p className={stylex.props(styles.c1j7zf41).className}>{world.name}</p>
          {showCuratorBadges && world.highPriority === true && (
            <span className={stylex.props(styles.c1bxu66d).className}>
              {t('common.highPriority')}
            </span>
          )}
        </div>
        <p className={stylex.props(styles.cim92pw).className}>
          {world.authorName && onAuthorClick ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAuthorClick(world.authorName);
              }}
              className={stylex.props(styles.c1dho8q4).className}
              aria-label={t('common.byAuthor', { author: world.authorName })}
              title={t('common.byAuthor', { author: world.authorName })}
            >
              {t('common.byAuthor', { author: world.authorName })}
            </button>
          ) : (
            t('common.byAuthor', { author: world.authorName || t('common.unknown') })
          )}{' '}
          · {world.capacity} capacity · {world.platforms.map(getPlatformLabel).join(', ')}
        </p>
      </div>
      <div
        className={stylex.props(styles.c1oz0upn).className}
        onClick={(e) => e.stopPropagation()}
      >
        {world.tags.slice(0, 3).map((t) => (
          <TagBadge key={t} tag={t} />
        ))}
        {world.tags.length > 3 && (
          <span className={stylex.props(styles.c1kr1dvu).className}>+{world.tags.length - 3}</span>
        )}
      </div>
      {ratingSummary !== undefined && (
        <div className={stylex.props(styles.c1uyiu23).className}>
          <WorldRatingBar
            summary={
              ratingSummary === null
                ? { worldId: world.worldId, good: 0, bad: 0, userRating: null }
                : ratingSummary
            }
            variant="list"
          />
        </div>
      )}
      <div className={stylex.props(styles.ce0za9q).className}>
        {showCuratorBadges
          ? world.quality === 'good'
            ? '✅'
            : world.quality === 'bad'
              ? '❌'
              : '—'
          : '—'}
      </div>
    </div>
  );
});

const styles = stylex.create({
  cz5tol1: {
    "display": "flex",
    "width": "100%",
    "minWidth": "0",
    "cursor": "pointer",
    "alignItems": "center",
    "gap": "0.75rem",
    "padding": "0.75rem",
    "textAlign": "left",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "borderColor": colors["--sos-border-slate-400-slate-600"],
    },
    "@media (min-width: 640px)": {
      "gap": "1rem",
    },
    ":focus-visible": {
      "boxShadow": "0 0 0 0px #fff, 0 0 0 2px #6366f180",
    },
  },
  cqhn3q7: {
    "position": "relative",
    "height": "4rem",
    "width": "4rem",
    "overflow": "hidden",
    "borderRadius": "0.5rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
  },
  cs0v3z7: {
    "pointerEvents": "none",
    "position": "absolute",
    "top": 0,
    "right": 0,
    "bottom": 0,
    "left": 0,
    "animation": "shimmer 1.5s infinite",
  },
  c1godsng: {
    "position": "relative",
    "height": "100%",
    "width": "100%",
    "objectFit": "cover",
  },
  cy7gia4: {
    "display": "flex",
    "height": "100%",
    "width": "100%",
    "alignItems": "center",
    "justifyContent": "center",
    "color": colors["--sos-text-slate-400-slate-600"],
  },
  c1kz96fl: {
    "height": "1.5rem",
    "width": "1.5rem",
  },
  c1r022bi: {
    "minWidth": "0",
    "flex": 1,
  },
  c1bsnn56: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.375rem",
  },
  c1j7zf41: {
    "overflow": "hidden",
    "textOverflow": "ellipsis",
    "whiteSpace": "nowrap",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 600,
    "color": colors["--sos-text-slate-900-white"],
  },
  c1bxu66d: {
    "borderRadius": "0.375rem",
    "backgroundColor": "#f59e0bcc",
    "paddingLeft": "0.5rem",
    "paddingRight": "0.5rem",
    "paddingTop": "0.125rem",
    "paddingBottom": "0.125rem",
    "fontSize": "10px",
    "fontWeight": 700,
    "color": "#ffffff",
    "backdropFilter": "blur(4px)",
  },
  cim92pw: {
    "overflow": "hidden",
    "textOverflow": "ellipsis",
    "whiteSpace": "nowrap",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1dho8q4: {
    "cursor": "pointer",
    "borderRadius": "0.25rem",
    "paddingLeft": "0.25rem",
    "paddingRight": "0.25rem",
    "paddingTop": "0.375rem",
    "paddingBottom": "0.375rem",
    ":hover": {
      "color": colors["--sos-text-indigo-600-indigo-400"],
    },
    ":focus-visible": {
      "boxShadow": "0 0 0 0px #fff, 0 0 0 2px #6366f180",
    },
  },
  c1oz0upn: {
    "display": "none",
    "flexWrap": "wrap",
    "gap": "0.25rem",
    "@media (min-width: 640px)": {
      "display": "flex",
    },
  },
  c1kr1dvu: {
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-400-slate-500"],
  },
  c1uyiu23: {
    "display": "none",
    "@media (min-width: 640px)": {
      "display": "block",
    },
  },
  ce0za9q: {
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-400-slate-500"],
  },
});
