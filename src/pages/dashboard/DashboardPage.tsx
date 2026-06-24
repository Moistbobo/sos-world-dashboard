import { Activity, Globe, Tags, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useHealth, useTags, useWorlds } from '../../hooks/useApi';
import { StatCard } from '../../components/stat-card';
import { WorldCard } from '../../components/world-card';
import { getEmojiForTag } from '../../utils/tagEmoji';

export function DashboardPage() {
  const { t } = useTranslation();
  const { data: health, isPending: healthLoading, isError: healthIsError } = useHealth();
  const { data: tagsData, isPending: tagsLoading } = useTags();
  const { data: worldsData, isPending: worldsLoading } = useWorlds({ limit: 6 });
  const navigate = useNavigate();

  const topTags = tagsData?.tags.slice(0, 10) || [];
  const latestWorlds = worldsData?.worlds || [];

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('dashboard.title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('dashboard.totalWorlds')}
          value={healthLoading ? '...' : healthIsError ? '?' : health?.worldCount ?? 0}
          icon={<Globe className="h-5 w-5" />}
        />
        <StatCard
          label={t('dashboard.uniqueTags')}
          value={tagsLoading ? '...' : topTags.length}
          icon={<Tags className="h-5 w-5" />}
        />
        <StatCard
          label={t('dashboard.dbVersion')}
          value={healthLoading ? '...' : health?.dbVersion ?? '-'}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          label={t('dashboard.latest')}
          value={latestWorlds.length > 0 ? new Date(latestWorlds[0].createdAt).toLocaleDateString() : '-'}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Worlds */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700/50">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t('dashboard.recentWorlds')}</h2>
              <button
                onClick={() => navigate('/worlds')}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {t('dashboard.viewAll')}
              </button>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {worldsLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="card h-64 animate-pulse bg-slate-200 dark:bg-slate-800" />
                  ))
                : latestWorlds.map((w) => (
                    <WorldCard
                      key={w.worldId}
                      world={w}
                      onSelect={(id) => navigate(`/worlds/${id}`)}
                    />
                  ))}
            </div>
          </div>
        </div>

        {/* Top Tags */}
        <div>
          <div className="card">
            <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700/50">
              <h2 className="text-sm font-semibold text-white">{t('dashboard.topTags')}</h2>
            </div>
            <div className="p-4 space-y-3">
              {tagsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  ))
                : topTags.map((t) => {
                    const max = topTags[0]?.count || 1;
                    const pct = Math.round((t.count / max) * 100);
                    return (
                      <button
                        key={t.tag}
                        onClick={() => navigate(`/worlds?tag=${encodeURIComponent(t.tag)}`)}
                        className="group w-full text-left"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            <span className="mr-1">{getEmojiForTag(t.tag)}</span>
                            {t.tag}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500">{t.count}</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-1.5 rounded-full bg-indigo-500/60 transition group-hover:bg-indigo-400"
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
