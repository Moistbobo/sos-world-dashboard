import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Heart, MessageSquare } from 'lucide-react';
import { useRecentActivity } from '../../hooks/useSentiment';
import { formatTimestamp } from '../../utils/formatTimestamp';
import type { RecentActivityRow } from '../../types';

function ActivityIcon({ row }: { row: RecentActivityRow }) {
  if (row.type === 'comment') {
    return (
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"
      >
        <MessageSquare className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300"
    >
      <Heart className="h-4 w-4 fill-current" />
    </span>
  );
}

export function RecentActivityPanel() {
  const { t } = useTranslation();
  const enabled = import.meta.env.VITE_ENABLE_COMMUNITY_SENTIMENT === 'true';
  const { rows, isPending } = useRecentActivity(enabled);

  return (
    <div className="card" data-testid="recent-activity-panel">
      <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700/50">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t('dashboard.recentActivity')}</h2>
      </div>
      {isPending ? (
        <div aria-busy="true" data-testid="recent-activity-loading" className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          ))}
          <p className="sr-only">{t('dashboard.activityLoading')}</p>
        </div>
      ) : rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {t('dashboard.activityEmpty')}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 p-2 dark:divide-slate-800">
          {rows.map((row) => (
            <li key={`${row.type}-${row.id}`}>
              <Link
                to={`/worlds/${row.worldId}`}
                className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500 dark:hover:bg-slate-800/60"
              >
                <ActivityIcon row={row} />
                <span className="min-w-0 flex-1">
                  {row.type === 'comment' ? (
                    <>
                      <span className="block text-[13px] leading-snug text-slate-800 dark:text-slate-200">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-300">{row.username}</span>{' '}
                        <Trans
                          i18nKey="dashboard.activityCommented"
                          values={{ world: row.worldName }}
                          components={{ world: <b className="font-semibold" /> }}
                        />
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                        {row.content}
                      </span>
                    </>
                  ) : (
                    <span className="block text-[13px] leading-snug text-slate-800 dark:text-slate-200">
                      <b className="font-semibold">{row.worldName}</b>{' '}
                      {t(row.value === 'good' ? 'dashboard.activityRatedGood' : 'dashboard.activityRatedBad')}
                    </span>
                  )}
                  <span className="mt-0.5 block text-[11px] text-slate-400 dark:text-slate-500">
                    {formatTimestamp(row.createdAt)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
