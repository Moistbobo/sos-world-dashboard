import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useTags } from '../hooks/useApi';
import { TagBadge } from '../components/TagBadge';

export function TagsPage() {
  const navigate = useNavigate();
  const { data, isPending, isError, error } = useTags();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const tags = data?.tags || [];
    if (!search.trim()) return tags;
    const q = search.toLowerCase();
    return tags.filter((t) => t.tag.toLowerCase().includes(q));
  }, [data, search]);

  const maxCount = data?.tags?.[0]?.count || 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Tags</h1>
          <p className="text-sm text-slate-400">Explore tag usage across tracked worlds.</p>
        </div>
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags..."
            className="input w-full pl-9"
          />
        </div>
      </div>

      {isError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          Failed to load tags: {error?.message}
        </div>
      )}

      {isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-slate-800" />
          ))}
        </div>
      )}

      {!isPending && !isError && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => {
            const pct = Math.round((t.count / maxCount) * 100);
            return (
              <button
                key={t.tag}
                onClick={() => navigate(`/worlds?tag=${encodeURIComponent(t.tag)}`)}
                className="card p-4 text-left transition hover:border-slate-400 dark:hover:border-slate-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TagBadge tag={t.tag} />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{t.count}</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-indigo-500/60 transition-all hover:bg-indigo-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
