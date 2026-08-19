import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { ArrowLeft, Globe, Users, Calendar, ExternalLink, Hash, Star, X } from 'lucide-react';
import { useWorld } from '../../hooks/useApi';
import { TagBadge } from '../../components/tag-badge';
import { getPlatformLabel } from '../../utils/platformLabel';
import { getWorldAddDate } from '../../utils/worldAddDate';
import { createWSRVUrl } from '../../utils/worldImageUrl';
import { ShareButton } from '../../components/share-button';
import { CopyWorldId } from '../../components/copy-world-id';
import { WorldAddDate } from '../../components/world-add-date';
import { useLists } from '../../contexts/ListsContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { SaveToListDialog } from '../../components/save-to-list-dialog/SaveToListDialog';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

const SentimentSection = lazy(() =>
  import('../../components/sentiment-section').then((m) => ({ default: m.SentimentSection })),
);

interface ImageLightboxProps {
  open: boolean;
  imageUrl: string;
  imageAlt: string;
  label: string;
  closeLabel: string;
  onClose: () => void;
}

function ImageLightbox({
  open,
  imageUrl,
  imageAlt,
  label,
  closeLabel,
  onClose,
}: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useDialogFocus({ open, containerRef: dialogRef, onClose });

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className={stylex.props(styles.cl17a3u).className}
      onClick={(e) => {
        if (e.currentTarget === e.target) {
          onClose();
        }
      }}
      data-testid="world-image-lightbox"
    >
      <div ref={dialogRef} className={stylex.props(styles.c1pncdne).className}>
        <button
          type="button"
          onClick={onClose}
          className={stylex.props(styles.cs9ut25).className}
          aria-label={closeLabel}
        >
          <X className={stylex.props(styles.c1kz96fl).className} />
        </button>
        <img
          src={imageUrl}
          alt={imageAlt}
          className={stylex.props(styles.c19aej0k).className}
        />
      </div>
    </div>
  );
}

export function WorldDetailPage({ worldId: worldIdProp }: { worldId?: string } = {}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { worldId: paramWorldId } = useParams<{ worldId: string }>();
  const worldId = worldIdProp ?? paramWorldId;
  const { isWorldInAnyList } = useLists();
  const [saveOpen, setSaveOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { data, isPending, isError, error, isFetching } = useWorld(worldId, {
    suppressErrorToast: true,
  });
  usePageTitle(data?.name ?? t('nav.worlds'));

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [worldId]);

  function handleGoBack() {
    if (location.key === 'default') {
      navigate('/worlds');
    } else {
      navigate(-1);
    }
  }

  useEffect(() => {
    if (lightboxOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLightboxOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  if (isPending && !data) {
    return (
      <div
        data-testid="world-detail-backdrop"
        className={stylex.props(styles.c8ngqxw).className}
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            handleGoBack();
          }
        }}
      >
        <div className={stylex.props(styles.c1075k9f).className}>
          <button
            type="button"
            disabled
            className={stylex.props(shared.btnGhost, styles.c90pfes).className}
            aria-hidden="true"
          >
            <ArrowLeft className={stylex.props(styles.c1ky5l8t).className} />
            {t('common.back')}
          </button>

          <div className={stylex.props(shared.card, styles.cmj8qth).className}>
            <div className={stylex.props(styles.c1uimh9r).className} />

            <div className={stylex.props(styles.c1o6m8sh).className}>
              <div className={stylex.props(styles.coi2yba).className}>
                <div className={stylex.props(styles.c1yc0xmw).className}>
                  <div className={stylex.props(styles.c1q8yhag).className} />
                  <div className={stylex.props(styles.c17r0rim).className} />
                </div>
                <div className={stylex.props(styles.c1pmd260).className} />
              </div>

              <div className={stylex.props(styles.c1kq24i0).className}>
                <div className={stylex.props(styles.c1bsnn56).className}>
                  <Users className={stylex.props(styles.c548dqw).className} />
                  <div className={stylex.props(styles.c139nru6).className} />
                </div>
                <div className={stylex.props(styles.c1bsnn56).className}>
                  <Hash className={stylex.props(styles.c548dqw).className} />
                  <div className={stylex.props(styles.c492vy0).className} />
                </div>
                <div className={stylex.props(styles.c1bsnn56).className}>
                  <Calendar className={stylex.props(styles.c548dqw).className} />
                  <div className={stylex.props(styles.c1q7beb4).className} />
                </div>
              </div>

              <div className={stylex.props(styles.c200pa).className}>
                <p className={stylex.props(styles.c1piuixg).className}>
                  {t('worldDetail.platforms')}
                </p>
                <div className={stylex.props(styles.c1sdudaq).className}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={stylex.props(styles.c191jj1x).className}
                    />
                  ))}
                </div>
              </div>

              <div className={stylex.props(styles.c200pa).className}>
                <p className={stylex.props(styles.c1piuixg).className}>
                  {t('worldDetail.tags')}
                </p>
                <div className={stylex.props(styles.c1sdudaq).className}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={stylex.props(styles.c1iq5q3a).className}
                    />
                  ))}
                </div>
              </div>

              <div className={stylex.props(styles.c1b9np9h).className}>
                <div className={stylex.props(styles.chiakud).className} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError && !data) {
    return (
      <div
        data-testid="world-detail-backdrop"
        className={stylex.props(styles.c8ngqxw).className}
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            handleGoBack();
          }
        }}
      >
        <div className={stylex.props(styles.c1075k9f).className}>
          <button
            type="button"
            onClick={() => handleGoBack()}
            className={stylex.props(shared.btnGhost, styles.c1rozvtl).className}
          >
            <ArrowLeft className={stylex.props(styles.c1ky5l8t).className} />
            {t('common.back')}
          </button>
          <div className={stylex.props(shared.card, styles.c1mkzbzw).className}>
            {t('worldDetail.loadError', { message: error?.message || 'Not found' })}
          </div>
        </div>
      </div>
    );
  }

  const w = data;

  return (
    <div
      data-testid="world-detail-backdrop"
      className={stylex.props(styles.c8ngqxw).className}
      onClick={(e) => {
        // Only navigate when the user clicks the empty background area, not the card.
        if (e.currentTarget === e.target) {
          handleGoBack();
        }
      }}
    >
      <div className={stylex.props(styles.c1075k9f).className}>
        <button
          type="button"
          onClick={() => handleGoBack()}
          className={stylex.props(shared.btnGhost, styles.c1rozvtl).className}
        >
          <ArrowLeft className={stylex.props(styles.c1ky5l8t).className} />
          {t('common.back')}
        </button>

        <div className={stylex.props(shared.card, styles.c143jepv).className}>
          {isFetching && (
            <div
              data-testid="world-detail-loading-bar"
              className={stylex.props(styles.cm57rsd).className}
            >
              <div className={stylex.props(styles.c13iwsrr).className} />
            </div>
          )}
          {isError && (
            <div className={stylex.props(styles.cqlbvoy).className}>
              {t('worldDetail.refreshError', { message: error?.message })}
            </div>
          )}
          <div className={stylex.props(styles.cka8nrb).className}>
            {w.imageUrl ? (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className={stylex.props(styles.c3fpolx).className}
                aria-label={t('worldDetail.openImageLightbox', { name: w.name })}
              >
                <div
                  aria-hidden="true"
                  className={stylex.props(styles.cs0v3z7).className}
                />
                <img
                  src={createWSRVUrl(w.imageUrl, 1600)}
                  alt={w.name}
                  className={stylex.props(styles.c1godsng).className}
                  fetchPriority="high"
                  decoding="async"
                />
              </button>
            ) : (
              <div className={stylex.props(styles.cy7gia4).className}>
                <Globe className={stylex.props(styles.c1y2vshd).className} />
              </div>
            )}
          </div>

          {lightboxOpen && w.imageUrl && (
            <ImageLightbox
              open={lightboxOpen}
              imageUrl={createWSRVUrl(w.imageUrl, 1600)}
              imageAlt={w.name}
              label={t('worldDetail.imageLightbox', { name: w.name })}
              closeLabel={t('common.close')}
              onClose={() => setLightboxOpen(false)}
            />
          )}

          <div className={stylex.props(styles.c1o6m8sh).className}>
            <div className={stylex.props(styles.coi2yba).className}>
              <div>
                <h1 className={stylex.props(styles.c1nw3spm).className}>{w.name}</h1>
                <p className={stylex.props(styles.cdo64fu).className}>
                  {t('worldDetail.byAuthor', { author: w.authorName || t('worldDetail.unknownAuthor') })}
                </p>
              </div>
              <div className={stylex.props(styles.shrink0).className}>
                {w.quality === 'good' && (
                  <span className={stylex.props(styles.c1gewc7d).className}>
                    {t('worldDetail.qualityGood')}
                  </span>
                )}
                {w.quality === 'bad' && (
                  <span className={stylex.props(styles.cfumcml).className}>
                    {t('worldDetail.qualityBad')}
                  </span>
                )}
                {w.quality == null && (
                  <span className={stylex.props(styles.c1i7orl4).className}>
                    {t('worldDetail.noQuality')}
                  </span>
                )}
              </div>
            </div>

            <div className={stylex.props(styles.cd37pkq).className}>
              <div className={stylex.props(styles.c1bsnn56).className}>
                <Users className={stylex.props(styles.cppbzfc).className} />
                {t('worldDetail.capacity', { capacity: w.capacity })}
              </div>
              <CopyWorldId worldId={w.worldId} />
              <div className={stylex.props(styles.c1bsnn56).className}>
                <Calendar className={stylex.props(styles.cppbzfc).className} />
                <Trans
                  i18nKey={w.internalAddDate ? 'worldDetail.tagged' : 'worldDetail.added'}
                  values={{ date: new Date(getWorldAddDate(w)).toLocaleString() }}
                  components={{ date: <WorldAddDate world={w} variant="datetime" /> }}
                />
              </div>
            </div>

            <div className={stylex.props(styles.c200pa).className}>
              <p className={stylex.props(styles.c1piuixg).className}>{t('worldDetail.platforms')}</p>
              <div className={stylex.props(styles.c1sdudaq).className}>
                {w.platforms.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => navigate(`/worlds?platform=${encodeURIComponent(p)}`)}
                    className={stylex.props(styles.c15j3as4).className}
                  >
                    {getPlatformLabel(p)}
                  </button>
                ))}
              </div>
            </div>

            <div className={stylex.props(styles.c200pa).className}>
              <p className={stylex.props(styles.c1piuixg).className}>{t('worldDetail.tags')}</p>
              <div className={stylex.props(styles.c1sdudaq).className}>
                {w.tags.map((t) => (
                  <TagBadge
                    key={t}
                    tag={t}
                    onClick={(tag) => navigate(`/worlds?tag=${encodeURIComponent(tag)}`)}
                  />
                ))}
              </div>
            </div>

            <div className={stylex.props(styles.cqgki1v).className}>
              {w.vrchatUrl ? (
                <a
                  href={w.vrchatUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={stylex.props(shared.btnPrimary, styles.cmyiufa).className}
                >
                  <ExternalLink className={stylex.props(styles.c1ky5l8t).className} />
                  {t('worldDetail.openInVRChat')}
                  <span className={stylex.props(styles.srOnly).className}> {t('common.opensInNewTab')}</span>
                </a>
              ) : (
                <span
                  className={stylex.props(shared.btnPrimary, styles.c1m8n05o).className}
                  aria-disabled="true"
                  title={t('worldDetail.openInVRChatUnavailable')}
                >
                  <ExternalLink className={stylex.props(styles.c1ky5l8t).className} />
                  {t('worldDetail.openInVRChat')}
                </span>
              )}
              <ShareButton world={w} />
              <button
                type="button"
                onClick={() => setSaveOpen(true)}
                className={stylex.props(
                  shared.btnSecondary,
                  styles.btnSave,
                  isWorldInAnyList(w.worldId) ? styles.btnSaved : undefined,
                ).className}
              >
                <Star
                  className={stylex.props(
                    styles.iconStar,
                    isWorldInAnyList(w.worldId) ? styles.iconSaved : undefined,
                  ).className}
                />
                {isWorldInAnyList(w.worldId) ? t('worldDetail.savedToList') : t('worldDetail.saveToList')}
              </button>
              <SaveToListDialog worldId={w.worldId} open={saveOpen} onOpenChange={setSaveOpen} />
            </div>
            <div className={stylex.props(styles.cbduvyp).className}>
              {import.meta.env.VITE_ENABLE_COMMUNITY_SENTIMENT === 'true' ? (
                <Suspense fallback={<div className={stylex.props(styles.c1sob71r).className} />}>
                  <SentimentSection worldId={w.worldId} />
                </Suspense>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = stylex.create({
  shrink0: {
    flexShrink: 0,
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
  },
  cl17a3u: {
    "position": "fixed",
    "top": 0,
    "right": 0,
    "bottom": 0,
    "left": 0,
    "zIndex": 50,
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",
    "backgroundColor": "#000000cc",
    "backdropFilter": "blur(4px)",
  },
  c1pncdne: {
    "display": "contents",
  },
  cs9ut25: {
    "position": "absolute",
    "right": "1rem",
    "top": "1rem",
    "display": "flex",
    "height": "2.75rem",
    "width": "2.75rem",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "9999px",
    "backgroundColor": "#00000080",
    "color": "#ffffff",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "backgroundColor": "#000000b3",
    },
  },
  c1kz96fl: {
    "height": "1.5rem",
    "width": "1.5rem",
  },
  c19aej0k: {
    "maxHeight": "90vh",
    "maxWidth": "90vw",
    "objectFit": "contain",
  },
  c8ngqxw: {
    "margin": "-1rem",
    "minHeight": "calc(100vh-3.5rem)",
    "cursor": "pointer",
    "padding": "1rem",
    "@media (min-width: 1024px)": {
      "margin": "-1.5rem",
      "padding": "1.5rem",
    },
  },
  c1075k9f: {
    "marginLeft": "auto",
    "marginRight": "auto",
  },
  c90pfes: {
    "gap": "0.375rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "opacity": 0.5,
  },
  c1ky5l8t: {
    "height": "1rem",
    "width": "1rem",
  },
  cmj8qth: {
    "overflow": "hidden",
  },
  c1uimh9r: {
    "position": "relative",
    "height": "14rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
    "@media (min-width: 640px)": {
      "height": "18rem",
    },
  },
  c1o6m8sh: {
    "padding": "1.25rem",
    "@media (min-width: 640px)": {
      "padding": "1.5rem",
    },
  },
  coi2yba: {
    "display": "flex",
    "alignItems": "flex-start",
    "justifyContent": "space-between",
    "gap": "1rem",
  },
  c1yc0xmw: {
    "width": "100%",
  },
  c1q8yhag: {
    "height": "1.5rem",
    "width": "75%",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.25rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c17r0rim: {
    "height": "1rem",
    "width": "50%",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.25rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c1pmd260: {
    "height": "1.5rem",
    "width": "5rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.25rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c1kq24i0: {
    "marginTop": "1.25rem",
    "display": "flex",
    "flexWrap": "wrap",
    "gap": "1rem",
    "borderTopWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-200-slate-700_50"],
    "paddingTop": "1rem",
  },
  c1bsnn56: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.375rem",
  },
  c548dqw: {
    "height": "1rem",
    "width": "1rem",
    "color": colors["--sos-text-slate-300-slate-600"],
  },
  c139nru6: {
    "height": "1rem",
    "width": "7rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.25rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c492vy0: {
    "height": "1rem",
    "width": "10rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.25rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c1q7beb4: {
    "height": "1rem",
    "width": "12rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.25rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c200pa: {
    "marginTop": "1rem",
  },
  c1piuixg: {
    "marginBottom": "0.5rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "fontWeight": 600,
    "letterSpacing": "0.05em",
    "color": colors["--sos-text-slate-400-slate-500"],
  },
  c1sdudaq: {
    "display": "flex",
    "flexWrap": "wrap",
    "gap": "0.5rem",
  },
  c191jj1x: {
    "height": "1.5rem",
    "width": "4rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.375rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c1iq5q3a: {
    "height": "1.5rem",
    "width": "5rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "9999px",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c1b9np9h: {
    "marginTop": "1.5rem",
    "display": "flex",
    "gap": "0.75rem",
  },
  chiakud: {
    "height": "2.25rem",
    "width": "10rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.5rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c1rozvtl: {
    "gap": "0.375rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
  },
  c1mkzbzw: {
    "padding": "2rem",
    "textAlign": "center",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-red-700-red-300"],
  },
  c143jepv: {
    "overflow": "hidden",
    "position": "relative",
    "cursor": "default",
  },
  cm57rsd: {
    "position": "absolute",
    "left": "0",
    "right": "0",
    "top": "0",
    "zIndex": 10,
    "height": "0.25rem",
    "overflow": "hidden",
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
  },
  c13iwsrr: {
    "height": "100%",
    "width": "33.3333%",
    "animation": "shimmer 1.5s infinite",
    "backgroundColor": "#6366f1",
  },
  cqlbvoy: {
    "borderBottomWidth": 1,
    "borderStyle": "solid",
    "borderColor": "#ef444433",
    "backgroundColor": "#ef44441a",
    "padding": "0.75rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-red-700-red-300"],
  },
  cka8nrb: {
    "position": "relative",
    "height": "14rem",
    "overflow": "hidden",
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
    "@media (min-width: 640px)": {
      "height": "18rem",
    },
  },
  c3fpolx: {
    "height": "100%",
    "width": "100%",
    "cursor": "pointer",
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
  c1y2vshd: {
    "height": "4rem",
    "width": "4rem",
  },
  c1nw3spm: {
    "fontSize": "1.125rem",
    "lineHeight": "1.75rem",
    "fontWeight": 700,
    "color": colors["--sos-text-slate-900-white"],
    "@media (min-width: 640px)": {
      "fontSize": "1.25rem",
      "lineHeight": "1.75rem",
    },
  },
  cdo64fu: {
    "marginTop": "0.125rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1gewc7d: {
    "borderRadius": "0.5rem",
    "backgroundColor": "#22c55e26",
    "paddingLeft": "0.75rem",
    "paddingRight": "0.75rem",
    "paddingTop": "0.25rem",
    "paddingBottom": "0.25rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "fontWeight": 600,
    "color": colors["--sos-text-green-700-green-400"],
    "boxShadow": "0 0 0 0px #fff, 0 0 0 1px #22c55e4d",
  },
  cfumcml: {
    "borderRadius": "0.5rem",
    "backgroundColor": "#ef444426",
    "paddingLeft": "0.75rem",
    "paddingRight": "0.75rem",
    "paddingTop": "0.25rem",
    "paddingBottom": "0.25rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "fontWeight": 600,
    "color": colors["--sos-text-red-700-red-400"],
    "boxShadow": "0 0 0 0px #fff, 0 0 0 1px #ef44444d",
  },
  c1i7orl4: {
    "borderRadius": "0.5rem",
    "backgroundColor": colors["--sos-bg-slate-200_40-slate-700_40"],
    "paddingLeft": "0.75rem",
    "paddingRight": "0.75rem",
    "paddingTop": "0.25rem",
    "paddingBottom": "0.25rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "fontWeight": 600,
    "color": colors["--sos-text-slate-600-slate-400"],
    "boxShadow": "0 0 0 0px #fff, 0 0 0 1px var(--sos-ring-slate-300-slate-600_30)",
  },
  cd37pkq: {
    "marginTop": "1.25rem",
    "display": "flex",
    "flexWrap": "wrap",
    "gap": "1rem",
    "borderTopWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-200-slate-700_50"],
    "paddingTop": "1rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-700-slate-300"],
  },
  cppbzfc: {
    "height": "1rem",
    "width": "1rem",
    "color": colors["--sos-text-slate-400-slate-500"],
  },
  c15j3as4: {
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
  cqgki1v: {
    "marginTop": "1.5rem",
    "display": "flex",
    "flexWrap": "wrap",
    "gap": "0.75rem",
  },
  cmyiufa: {
    "gap": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
  },
  c1m8n05o: {
    "gap": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "cursor": "not-allowed",
    "opacity": 0.5,
  },
  cbduvyp: {
    "marginTop": "1.5rem",
    "borderTopWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-200-slate-700_50"],
    "paddingTop": "1.5rem",
  },
  c1sob71r: {
    "height": "6rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.5rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
  },
  btnSave: {
    "gap": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
  },
  btnSaved: {
    "color": colors["--sos-text-indigo-600-indigo-300"],
  },
  iconStar: {
    "height": "1rem",
    "width": "1rem",
  },
  iconSaved: {
    "fill": "currentColor",
  },
});
