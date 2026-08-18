import { useMemo } from 'react';
import { Activity, Globe, Tags, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useTags, useWorlds } from '../../hooks/useApi';
import { useHealth } from '../../hooks/useHealth';
import { useRatingsForWorldIds } from '../../hooks/useSentiment';
import { StatCard } from '../../components/stat-card';
import { WorldCard } from '../../components/world-card';
import { getEmojiForTag } from '../../utils/tagEmoji';
import { getWorldAddDate } from '../../utils/worldAddDate';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

const SENTIMENT_ENABLED = import.meta.env.VITE_ENABLE_COMMUNITY_SENTIMENT === 'true';

export function DashboardPage() {
  const { t } = useTranslation();
  usePageTitle(t('dashboard.title'));
  const { data: health, isPending: healthLoading, isError: healthIsError } = useHealth();
  const { data: tagsData, isPending: tagsLoading } = useTags();
  const { data: worldsData, isPending: worldsLoading } = useWorlds({ limit: 6 });
  const navigate = useNavigate();

  const topTags = tagsData?.tags.slice(0, 10) || [];
  const latestWorlds = useMemo(() => worldsData?.worlds ?? [], [worldsData]);
  const latestWorldIds = useMemo(() => latestWorlds.map((w) => w.worldId), [latestWorlds]);
  const { data: ratingSummaries } = useRatingsForWorldIds(
    SENTIMENT_ENABLED ? latestWorldIds : [],
  );

  const latestWorldId = latestWorlds[0]?.worldId;
  const latestAddDate = latestWorldId ? getWorldAddDate(latestWorlds[0]) : undefined;
  const latestDateLabel = useMemo(
    () => (latestAddDate ? new Date(latestAddDate).toLocaleDateString() : '-'),
    [latestAddDate],
  );
  const topTagMaxCount = topTags[0]?.count;

  return (
    <div className="space-y-6">
      <div className={stylex.props(styles.c1zncq).className}>
        <h1 className={stylex.props(styles.c1ygyk63).className}>{t('dashboard.title')}</h1>
        <p className={stylex.props(styles.c1xmut6z).className}>{t('dashboard.subtitle')}</p>
      </div>

      <div className={stylex.props(styles.c9fwvfq).className}>
        <StatCard
          label={t('dashboard.totalWorlds')}
          value={healthLoading ? '...' : healthIsError ? '?' : health?.worldCount ?? 0}
          icon={<Globe className={stylex.props(styles.c1kypdu7).className} />}
        />
        <StatCard
          label={t('dashboard.uniqueTags')}
          value={tagsLoading ? '...' : tagsData?.tags.length ?? 0}
          icon={<Tags className={stylex.props(styles.c1kypdu7).className} />}
        />
        <StatCard
          label={t('dashboard.dbVersion')}
          value={healthLoading ? '...' : health?.dbVersion ?? '-'}
          icon={<Activity className={stylex.props(styles.c1kypdu7).className} />}
        />
        <StatCard
          label={t('dashboard.latest')}
          value={latestDateLabel}
          icon={<Clock className={stylex.props(styles.c1kypdu7).className} />}
        />
      </div>

      <div className={stylex.props(styles.c9jd40s).className}>
        {/* Recent Worlds */}
        <div className={stylex.props(styles.c8sj35n).className}>
          <div className={stylex.props(shared.card).className}>
            <div className={stylex.props(styles.ckot6yd).className}>
              <h2 className={stylex.props(styles.c1gy9eiv).className}>{t('dashboard.recentWorlds')}</h2>
              <button
                onClick={() => navigate('/worlds')}
                className={stylex.props(styles.cutr4jl).className}
              >
                {t('dashboard.viewAll')}
              </button>
            </div>
            <div className={stylex.props(styles.c1nft36d).className}>
              {worldsLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={stylex.props(shared.card, styles.c1461knq).className} />
                  ))
                : latestWorlds.map((w) => (
                    <WorldCard
                      key={w.worldId}
                      world={w}
                      onSelect={(id) => navigate(`/worlds/${id}`)}
                      onTagClick={(tag) => navigate(`/worlds?tag=${encodeURIComponent(tag)}`)}
                      onPlatformClick={(platform) => navigate(`/worlds?platform=${encodeURIComponent(platform)}`)}
                      onAuthorClick={(author) => navigate(`/worlds?search=${encodeURIComponent(author)}`)}
                      ratingSummary={ratingSummaries ? ratingSummaries.get(w.worldId) ?? null : undefined}
                    />
                  ))}
            </div>
          </div>
        </div>

        {/* Top Tags */}
        <div>
          <div className={stylex.props(shared.card).className}>
            <div className={stylex.props(styles.csueyx).className}>
              <h2 className={stylex.props(styles.c1gy9eiv).className}>{t('dashboard.topTags')}</h2>
            </div>
            <div className={stylex.props(styles.cidurin).className}>
              {tagsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={stylex.props(styles.cnmf8ml).className} />
                  ))
                : topTags.map((t) => {
                    const max = topTagMaxCount || 1;
                    const pct = Math.round((t.count / max) * 100);
                    return (
                      <button
                        key={t.tag}
                        onClick={() => navigate(`/worlds?tag=${encodeURIComponent(t.tag)}`)}
                         className={`group ${stylex.props(styles.ch3pdkd).className}`}
                      >
                        <div className={stylex.props(styles.c16p3an).className}>
                          <span className={stylex.props(styles.c1ecfho3).className}>
                            <span className={stylex.props(styles.c1zz7t).className}>{getEmojiForTag(t.tag)}</span>
                            {t.tag}
                          </span>
                          <span className={stylex.props(styles.c1v0hmxx).className}>{t.count}</span>
                        </div>
                        <div className={stylex.props(styles.cbc36q6).className}>
                          <div
                            className={stylex.props(styles.c1pbehrz).className}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = stylex.create({
  c1zncq: {
    "marginBottom": "0.5rem",
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
  c9fwvfq: {
    "display": "grid",
    "gap": "1rem",
    "@media (min-width: 640px)": {
      "gridTemplateColumns": "repeat(2, minmax(0, 1fr))",
    },
    "@media (min-width: 1024px)": {
      "gridTemplateColumns": "repeat(4, minmax(0, 1fr))",
    },
  },
  c1kypdu7: {
    "height": "1.25rem",
    "width": "1.25rem",
  },
  c9jd40s: {
    "display": "grid",
    "gap": "1.5rem",
    "@media (min-width: 1024px)": {
      "gridTemplateColumns": "repeat(3, minmax(0, 1fr))",
    },
  },
  c8sj35n: {
    "@media (min-width: 1024px)": {
      "gridColumn": "span 2 / span 2",
    },
  },
  ckot6yd: {
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "space-between",
    "borderBottomWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-200-slate-700_50"],
    "paddingLeft": "1.25rem",
    "paddingRight": "1.25rem",
    "paddingTop": "0.75rem",
    "paddingBottom": "0.75rem",
  },
  c1gy9eiv: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 600,
    "color": colors["--sos-text-slate-900-white"],
  },
  cutr4jl: {
    "minHeight": "2.75rem",
    "paddingLeft": "0.5rem",
    "paddingRight": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-indigo-600-indigo-400"],
    ":hover": {
      "color": colors["--sos-text-indigo-700-indigo-300"],
    },
  },
  c1nft36d: {
    "display": "grid",
    "gap": "1rem",
    "padding": "1rem",
    "@media (min-width: 640px)": {
      "gridTemplateColumns": "repeat(2, minmax(0, 1fr))",
    },
    "@media (min-width: 1280px)": {
      "gridTemplateColumns": "repeat(3, minmax(0, 1fr))",
    },
  },
  c1461knq: {
    "height": "16rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
  },
  csueyx: {
    "borderBottomWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-200-slate-700_50"],
    "paddingLeft": "1.25rem",
    "paddingRight": "1.25rem",
    "paddingTop": "0.75rem",
    "paddingBottom": "0.75rem",
  },
  cidurin: {
    "padding": "1rem",
  },
  cnmf8ml: {
    "height": "1rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.25rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
  },
  ch3pdkd: {
    "width": "100%",
    "textAlign": "left",
  },
  c16p3an: {
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "space-between",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
  },
  c1ecfho3: {
    "fontWeight": 500,
    "color": colors["--sos-text-slate-800-slate-200"],
  },
  c1zz7t: {
    "marginRight": "0.25rem",
  },
  c1v0hmxx: {
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  cbc36q6: {
    "marginTop": "0.25rem",
    "height": "0.375rem",
    "width": "100%",
    "borderRadius": "9999px",
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
  },
  c1pbehrz: {
    "height": "0.375rem",
    "borderRadius": "9999px",
    "backgroundColor": "#6366f199",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":is(.group:hover *)": {
      "backgroundColor": "#818cf8",
    },
  },
});
