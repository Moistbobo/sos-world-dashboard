import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Users, Calendar, ExternalLink, Hash } from 'lucide-react';
import { useWorld } from '../hooks/useApi';
import { TagBadge } from '../components/TagBadge';

export function WorldDetailPage() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { data, isPending, isError, error } = useWorld(worldId);

  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="card h-72 animate-pulse bg-slate-200 dark:bg-slate-800" />
        <div className="card h-40 animate-pulse bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card p-8 text-center text-sm text-red-600 dark:text-red-300">
          Failed to load world: {error?.message || 'Not found'}
        </div>
      </div>
    );
  }

  const w = data;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="btn-ghost gap-1.5 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="card overflow-hidden">
        <div className="relative h-56 bg-slate-200 sm:h-72 dark:bg-slate-800">
          {w.imageUrl ? (
            <img
              src={w.imageUrl}
              alt={w.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-600">
              <Globe className="h-16 w-16" />
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">{w.name}</h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">by {w.authorName || 'Unknown author'}</p>
            </div>
            <div className="shrink-0">
              {w.quality === 'good' && (
                <span className="rounded-lg bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400 ring-1 ring-green-500/30">
                  Quality: Good
                </span>
              )}
              {w.quality === 'bad' && (
                <span className="rounded-lg bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400 ring-1 ring-red-500/30">
                  Quality: Bad
                </span>
              )}
              {w.quality == null && (
                <span className="rounded-lg bg-slate-200/40 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-300 dark:bg-slate-700/40 dark:text-slate-400 dark:ring-slate-600/30">
                  No quality rating
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-200 pt-4 text-sm text-slate-700 dark:border-slate-700/50 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              Capacity: {w.capacity}
            </div>
            <div className="flex items-center gap-1.5">
              <Hash className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              ID: {w.worldId}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              Added {new Date(w.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Platforms</p>
            <div className="flex flex-wrap gap-2">
              {w.platforms.map((p) => (
                <span
                  key={p}
                  className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tags</p>
            <div className="flex flex-wrap gap-2">
              {w.tags.map((t) => (
                <TagBadge
                  key={t}
                  tag={t}
                  onClick={(tag) => navigate(`/worlds?tag=${encodeURIComponent(tag)}`)}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <a
              href={w.vrchatUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary gap-2 text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Open in VRChat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
