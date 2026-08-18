import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useTags } from '../../hooks/useApi';
import { TagBadge } from '../../components/tag-badge';
import { WaffleChart } from '../../components/waffle-chart';
import { getTagColorHex } from '../../utils/tagColor';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

export function TagsPage() {
  const { t } = useTranslation();
  usePageTitle(t('tags.title'));
  const navigate = useNavigate();
  const { data, isPending, isError, error } = useTags({ suppressErrorToast: true });
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const tags = data?.tags || [];
    if (!search.trim()) return tags;
    const q = search.toLowerCase();
    return tags.filter((t) => t.tag.toLowerCase().includes(q));
  }, [data, search]);

  const maxCount = data?.tags?.[0]?.count || 1;

  const waffleData = useMemo(
    () => filtered.map((t) => ({ name: t.tag, value: t.count })),
    [filtered]
  );

  return (
    <div className="space-y-4">
      <div className={stylex.props(styles.cjqkzf8).className}>
        <div>
          <h1 className={stylex.props(styles.c1ygyk63).className}>{t('tags.title')}</h1>
          <p className={stylex.props(styles.c1xmut6z).className}>{t('tags.subtitle')}</p>
        </div>
        <div className={stylex.props(styles.ciqpx2m).className}>
          <Search className={stylex.props(styles.c1gh2g5u).className} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('tags.searchPlaceholder')}
            aria-label={t('tags.searchLabel')}
            className={stylex.props(shared.input, styles.cnvqn3h).className}
          />
        </div>
      </div>

      {isError && (
        <div
          role="status"
          className={stylex.props(styles.c1sn20ea).className}
        >
          {t('tags.loadError', { message: error?.message })}
        </div>
      )}

      {isPending && (
        <div className={stylex.props(styles.c9fwvfp).className}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={stylex.props(shared.card, styles.c1fuhe4y).className} />
          ))}
        </div>
      )}

      {!isPending && !isError && (
        <>
          <div className={stylex.props(shared.card, styles.c1yvaa6f).className}>
            <div className={stylex.props(styles.c1i7m3cy).className}>
              <WaffleChart
                data={waffleData}
                getColor={getTagColorHex}
                onSelectTag={(tag) => navigate(`/worlds?tag=${encodeURIComponent(tag)}`)}
              />
            </div>
          </div>

          <div className={stylex.props(styles.c9fwvfp).className}>
            {filtered.map((t) => {
              const pct = Math.round((t.count / maxCount) * 100);
              const handleSelect = () => navigate(`/worlds?tag=${encodeURIComponent(t.tag)}`);
              return (
                <div
                  key={t.tag}
                  role="button"
                  tabIndex={0}
                  onClick={handleSelect}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect();
                    }
                  }}
                  className={stylex.props(shared.card, styles.c2h6q4q).className}
                >
                  <div className={stylex.props(styles.cxc8ak4).className}>
                    <div className={stylex.props(styles.c2ca09w).className}>
                      <TagBadge tag={t.tag} />
                    </div>
                    <span className={stylex.props(styles.c12lfgfp).className}>{t.count}</span>
                  </div>
                  <div className={stylex.props(styles.ccya4pe).className}>
                    <div
                      className={stylex.props(styles.c10uzxd3).className}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const styles = stylex.create({
  cjqkzf8: {
    "display": "flex",
    "flexDirection": "column",
    "gap": "0.75rem",
    "@media (min-width: 640px)": {
      "flexDirection": "row",
      "alignItems": "center",
      "justifyContent": "space-between",
    },
  },
  c1ygyk63: {
    "fontSize": "1.25rem",
    "lineHeight": "1.75rem",
    "fontWeight": 700,
    "color": colors["--sos-text-slate-900-white"],
  },
  c1xmut6z: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  ciqpx2m: {
    "position": "relative",
  },
  c1gh2g5u: {
    "position": "absolute",
    "left": "0.625rem",
    "top": "50%",
    "height": "1rem",
    "width": "1rem",
    "transform": "translateY(-50%)",
    "color": "#64748b",
  },
  cnvqn3h: {
    "width": "100%",
    "paddingLeft": "2.25rem",
  },
  c1sn20ea: {
    "borderRadius": "0.5rem",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": "#ef444433",
    "backgroundColor": "#ef44441a",
    "padding": "1rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-red-700-red-300"],
  },
  c9fwvfp: {
    "display": "grid",
    "gap": "1rem",
    "@media (min-width: 640px)": {
      "gridTemplateColumns": "repeat(2, minmax(0, 1fr))",
    },
    "@media (min-width: 1024px)": {
      "gridTemplateColumns": "repeat(3, minmax(0, 1fr))",
    },
  },
  c1fuhe4y: {
    "height": "6rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
  },
  c1yvaa6f: {
    "padding": "1rem",
  },
  c1i7m3cy: {
    "marginLeft": "auto",
    "marginRight": "auto",
  },
  c2h6q4q: {
    "cursor": "pointer",
    "padding": "1rem",
    "textAlign": "left",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "borderColor": colors["--sos-border-slate-400-slate-600"],
    },
    ":focus-visible": {
      "boxShadow": "0 0 0 0px #fff, 0 0 0 2px #6366f180",
    },
  },
  cxc8ak4: {
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "space-between",
  },
  c2ca09w: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.5rem",
  },
  c12lfgfp: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 700,
    "color": colors["--sos-text-slate-900-white"],
  },
  ccya4pe: {
    "marginTop": "0.75rem",
    "height": "0.5rem",
    "width": "100%",
    "borderRadius": "9999px",
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
  },
  c10uzxd3: {
    "height": "0.5rem",
    "borderRadius": "9999px",
    "backgroundColor": "#6366f199",
    "transitionProperty": "all",
    ":hover": {
      "backgroundColor": "#818cf8",
    },
  },
});
