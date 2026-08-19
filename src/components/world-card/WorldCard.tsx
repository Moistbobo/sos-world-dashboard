import { memo, useState } from 'react';
import { Globe, Users, Calendar, ExternalLink, Star, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RatingSummary, World } from '../../types';
import { TagBadge } from '../tag-badge';
import { getPlatformLabel } from '../../utils/platformLabel';
import { getWorldAddDate } from '../../utils/worldAddDate';
import { createWSRVUrl } from '../../utils/worldImageUrl';
import { ShareButton } from '../share-button';
import { useLists } from '../../contexts/ListsContext';
import { SaveToListDialog } from '../save-to-list-dialog/SaveToListDialog';
import { WorldRatingBar } from '../world-rating-bar';
import { WorldCurationActions } from '../world-curation-actions';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

interface WorldCardProps {
  world: World;
  onTagClick?: (tag: string) => void;
  onPlatformClick?: (platform: string) => void;
  onSelect?: (worldId: string) => void;
  onRemove?: () => void;
  onAuthorClick?: (authorName: string) => void;
  ratingSummary?: RatingSummary | null | undefined;
  showCuratorBadges?: boolean;
  canCurate?: boolean;
}

export const WorldCard = memo(function WorldCard({ world, onTagClick, onPlatformClick, onSelect, onRemove, onAuthorClick, ratingSummary, showCuratorBadges = true, canCurate = false }: WorldCardProps) {
  const { t } = useTranslation();
  const { isWorldInAnyList } = useLists();
  const [saveOpen, setSaveOpen] = useState(false);
  const isSaved = isWorldInAnyList(world.worldId);

  return (
    <div  className={`group ${stylex.props(shared.card, styles.cdpixau).className}`}>
      {onSelect && (
        <button
          type="button"
          onClick={() => onSelect(world.worldId)}
          className={stylex.props(styles.c1j6gei3).className}
          aria-label={`${t('common.details')} - ${world.name}`}
        />
      )}
      <div className={stylex.props(styles.c10zh0a4).className}>
        {world.imageUrl ? (
          <>
            <div
              aria-hidden="true"
              className={stylex.props(styles.cs0v3z7).className}
            />
            <img
              src={createWSRVUrl(world.imageUrl, 280, 65)}
              alt={world.name}
              className={stylex.props(styles.c1godsng).className}
              loading="lazy"
              decoding="async"
            />
          </>
        ) : (
          <div className={stylex.props(styles.cy7gia4).className}>
            <Globe className={stylex.props(styles.c1v8m241).className} />
          </div>
        )}
        <div className={stylex.props(styles.ch6cd5o).className}>
          {showCuratorBadges && world.quality === 'good' && (
            <span className={stylex.props(styles.c5bblv5).className}>
              {t('common.good')}
            </span>
          )}
          {showCuratorBadges && world.quality === 'bad' && (
            <span className={stylex.props(styles.cc947ab).className}>
              {t('common.bad')}
            </span>
          )}
          {showCuratorBadges && world.highPriority === true && (
            <span className={stylex.props(styles.c2mmopd).className}>
              {t('common.highPriority')}
            </span>
          )}
        </div>
        {!onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSaveOpen(true);
            }}
            className={stylex.props(styles.cxwtag5).className}
            aria-label={isSaved ? t('worldCard.savedToList') : t('worldCard.saveToList')}
            title={isSaved ? t('worldCard.savedToList') : t('worldCard.saveToList')}
          >
            <Star className={stylex.props(styles.star, isSaved ? styles.starSaved : undefined).className} />
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={stylex.props(styles.c5jpf5h).className}
            aria-label={t('lists.removeWorld')}
            title={t('lists.removeWorld')}
          >
            <X className={stylex.props(styles.c1kypdu7).className} />
          </button>
        )}
      </div>

      <div className={stylex.props(styles.cb1o7vj).className}>
        <h3 className={stylex.props(styles.c1slijp5).className} title={world.name}>
          {world.name}
        </h3>
        {world.authorName && onAuthorClick ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAuthorClick(world.authorName);
            }}
            className={stylex.props(styles.cndx0a1).className}
            aria-label={t('common.byAuthor', { author: world.authorName })}
            title={t('common.byAuthor', { author: world.authorName })}
          >
            {t('common.byAuthor', { author: world.authorName })}
          </button>
        ) : (
          <p className={stylex.props(styles.cldgat5).className}>
            {t('common.byAuthor', { author: world.authorName || t('common.unknown') })}
          </p>
        )}

        <div className={stylex.props(styles.c19emuv).className}>
          <span className={stylex.props(styles.ct25ghb).className}>
            <Users className={stylex.props(styles.c1kxlsnf).className} />
            {world.capacity}
          </span>
          <span className={stylex.props(styles.ct25ghb).className} title={world.internalAddDate ? t('worldCard.tagged') : t('worldCard.added')}>
            <Calendar className={stylex.props(styles.c1kxlsnf).className} />
            {new Date(getWorldAddDate(world)).toLocaleDateString()}
          </span>
        </div>

        <div className={stylex.props(styles.c1kjoays).className}>
          {world.platforms.map((p) => {
            const label = getPlatformLabel(p);
            return onPlatformClick ? (
              <button
                key={p}
                type="button"
                onClick={() => onPlatformClick(p)}
                title={label}
                className={stylex.props(styles.c17q12ts).className}
              >
                {label}
              </button>
            ) : (
              <span
                key={p}
                className={stylex.props(styles.c1fjcv5j).className}
              >
                {label}
              </span>
            );
          })}
        </div>

        <div className={stylex.props(styles.c1kjoays).className}>
          {world.tags.slice(0, 4).map((t) => (
            <TagBadge key={t} tag={t} onClick={onTagClick} className={stylex.props(styles.cy08p5w).className} />
          ))}
          {world.tags.length > 4 && (
            <span className={stylex.props(styles.c1kr1dvu).className}>
              {t('common.more', { count: world.tags.length - 4 })}
            </span>
          )}
        </div>

        {canCurate && <WorldCurationActions world={world} />}

        {ratingSummary !== undefined && (
          <WorldRatingBar
            summary={
              ratingSummary === null
                ? { worldId: world.worldId, good: 0, bad: 0, userRating: null }
                : ratingSummary
            }
            variant="card"
          />
        )}

        <div className={stylex.props(styles.c1a4d5bj).className}>
          {world.vrchatUrl ? (
            <a
              href={world.vrchatUrl}
              target="_blank"
              rel="noreferrer"
              className={stylex.props(shared.btnPrimary, styles.c1nxo2fe).className}
            >
              <ExternalLink className={stylex.props(styles.c1ky5l8t).className} />
              {t('worldDetail.openInVRChat')}
              <span className={stylex.props(styles.srOnly).className}> {t('common.opensInNewTab')}</span>
            </a>
          ) : (
            <span
              className={stylex.props(shared.btnPrimary, styles.c1cvi5ow).className}
              aria-disabled="true"
              title={t('worldDetail.openInVRChatUnavailable')}
            >
              <ExternalLink className={stylex.props(styles.c1ky5l8t).className} />
              {t('worldDetail.openInVRChat')}
            </span>
          )}
          <ShareButton world={world} iconOnly />
        </div>
      </div>
      <SaveToListDialog worldId={world.worldId} open={saveOpen} onOpenChange={setSaveOpen} />
    </div>
  );
});

const styles = stylex.create({
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
  },
  cdpixau: {
    "position": "relative",
    "overflow": "hidden",
    "display": "flex",
    "flexDirection": "column",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    "cursor": "pointer",
    ":hover": {
      "borderColor": colors["--sos-border-slate-400-slate-600"],
    },
  },
  c1j6gei3: {
    "position": "absolute",
    "top": 0,
    "right": 0,
    "bottom": 0,
    "left": 0,
    "zIndex": 20,
    "borderRadius": "0.75rem",
    ":focus-visible": {
      "boxShadow": "0 0 0 0px #fff, 0 0 0 2px #6366f180",
    },
  },
  c10zh0a4: {
    "position": "relative",
    "height": "10rem",
    "overflow": "hidden",
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
  c1v8m241: {
    "height": "2.5rem",
    "width": "2.5rem",
  },
  ch6cd5o: {
    "position": "absolute",
    "top": "0.5rem",
    "left": "0.5rem",
    "zIndex": 10,
    "display": "flex",
    "gap": "0.25rem",
  },
  c5bblv5: {
    "borderRadius": "0.375rem",
    "backgroundColor": "#22c55ecc",
    "paddingLeft": "0.5rem",
    "paddingRight": "0.5rem",
    "paddingTop": "0.125rem",
    "paddingBottom": "0.125rem",
    "fontSize": "10px",
    "fontWeight": 700,
    "color": "#ffffff",
    "backdropFilter": "blur(4px)",
  },
  cc947ab: {
    "borderRadius": "0.375rem",
    "backgroundColor": "#ef4444cc",
    "paddingLeft": "0.5rem",
    "paddingRight": "0.5rem",
    "paddingTop": "0.125rem",
    "paddingBottom": "0.125rem",
    "fontSize": "10px",
    "fontWeight": 700,
    "color": "#ffffff",
    "backdropFilter": "blur(4px)",
  },
  c2mmopd: {
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
  cxwtag5: {
    "position": "absolute",
    "top": "0.5rem",
    "right": "0.5rem",
    "zIndex": 30,
    "display": "flex",
    "height": "2.75rem",
    "width": "2.75rem",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "9999px",
    "backgroundColor": colors["--sos-bg-white_90-slate-800_90"],
    "color": colors["--sos-text-slate-600-slate-300"],
    "boxShadow": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "backgroundColor": "#ffffff",
      "color": colors["--sos-text-indigo-600-indigo-300"],
    },
  },
  c5jpf5h: {
    "position": "absolute",
    "top": "0.5rem",
    "right": "0.5rem",
    "zIndex": 30,
    "display": "flex",
    "height": "2.75rem",
    "width": "2.75rem",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "9999px",
    "backgroundColor": colors["--sos-bg-white_90-slate-800_90"],
    "color": colors["--sos-text-red-600-red-400"],
    "boxShadow": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "backgroundColor": "#ffffff",
      "color": colors["--sos-text-red-700-red-300"],
    },
  },
  c1kypdu7: {
    "height": "1.25rem",
    "width": "1.25rem",
  },
  cb1o7vj: {
    "display": "flex",
    "flex": 1,
    "flexDirection": "column",
    "padding": "1rem",
  },
  c1slijp5: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 600,
    "color": colors["--sos-text-slate-900-white"],
    "display": "-webkit-box",
    "WebkitLineClamp": 1,
    "WebkitBoxOrient": "vertical",
    "overflow": "hidden",
  },
  cndx0a1: {
    "position": "relative",
    "zIndex": 30,
    "marginTop": "0.125rem",
    "marginLeft": "-0.25rem",
    "marginRight": "-0.25rem",
    "alignSelf": "flex-start",
    "borderRadius": "0.25rem",
    "paddingLeft": "0.25rem",
    "paddingRight": "0.25rem",
    "paddingTop": "0.375rem",
    "paddingBottom": "0.375rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "color": colors["--sos-text-indigo-600-indigo-400"],
    },
    ":focus-visible": {
      "boxShadow": "0 0 0 0px #fff, 0 0 0 2px #6366f180",
    },
  },
  cldgat5: {
    "marginTop": "0.125rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c19emuv: {
    "marginTop": "0.75rem",
    "display": "flex",
    "flexWrap": "wrap",
    "alignItems": "center",
    "gap": "0.5rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  ct25ghb: {
    "display": "inline-flex",
    "alignItems": "center",
    "gap": "0.25rem",
  },
  c1kxlsnf: {
    "height": "0.75rem",
    "width": "0.75rem",
  },
  c1kjoays: {
    "marginTop": "0.75rem",
    "display": "flex",
    "flexWrap": "wrap",
    "gap": "0.25rem",
  },
  c17q12ts: {
    "position": "relative",
    "zIndex": 30,
    "borderRadius": "0.375rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
    "paddingLeft": "0.625rem",
    "paddingRight": "0.625rem",
    "paddingTop": "0.375rem",
    "paddingBottom": "0.375rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "fontWeight": 500,
    "color": colors["--sos-text-slate-700-slate-200"],
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "filter": "brightness(1.1)",
    },
  },
  c1fjcv5j: {
    "borderRadius": "0.375rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
    "paddingLeft": "0.625rem",
    "paddingRight": "0.625rem",
    "paddingTop": "0.375rem",
    "paddingBottom": "0.375rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "fontWeight": 500,
    "color": colors["--sos-text-slate-700-slate-200"],
  },
  cy08p5w: {
    "position": "relative",
    "zIndex": 30,
  },
  c1kr1dvu: {
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-400-slate-500"],
  },
  c1a4d5bj: {
    "marginTop": "auto",
    "paddingTop": "0.75rem",
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",
    "gap": "0.5rem",
  },
  c1nxo2fe: {
    "gap": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "position": "relative",
    "zIndex": 30,
  },
  c1ky5l8t: {
    "height": "1rem",
    "width": "1rem",
  },
  c1cvi5ow: {
    "gap": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "position": "relative",
    "zIndex": 30,
    "cursor": "not-allowed",
    "opacity": 0.5,
  },
  star: {
    "height": "1.25rem",
    "width": "1.25rem",
  },
  starSaved: {
    "fill": "currentColor",
    "color": "#6366f1",
  },
});
