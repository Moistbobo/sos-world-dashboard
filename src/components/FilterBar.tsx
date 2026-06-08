import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface FilterBarProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  selectedQuality: ('good' | 'bad')[];
  onToggleQuality: (quality: 'good' | 'bad') => void;
  onClear: () => void;
  availableTags: { tag: string; count: number }[];
}

export function FilterBar({
  selectedTags,
  onToggleTag,
  onRemoveTag,
  selectedQuality,
  onToggleQuality,
  onClear,
  availableTags,
}: FilterBarProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  const filteredTags = availableTags.filter((t) =>
    t.tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const hasFilters = selectedTags.length > 0 || selectedQuality.length > 0;

  return (
    <div className="card mb-4">
      <div className="flex flex-wrap items-center gap-2 p-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`btn-ghost gap-1.5 text-xs ${expanded ? 'bg-slate-200 dark:bg-slate-800' : ''}`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {t('filter.filters')}
          {hasFilters && (
            <span className="ml-1 rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {selectedTags.length + selectedQuality.length}
            </span>
          )}
        </button>

        {selectedTags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30"
          >
            {t}
            <button onClick={() => onRemoveTag(t)} className="hover:text-white">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {selectedQuality.map((q) => (
          <span
            key={q}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
              q === 'good'
                ? 'bg-green-500/20 text-green-300 ring-green-500/30'
                : 'bg-red-500/20 text-red-300 ring-red-500/30'
            }`}
          >
            {q}
            <button onClick={() => onToggleQuality(q)} className="hover:text-white">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {hasFilters && (
          <button onClick={onClear} className="btn-ghost text-xs py-1.5">
            {t('filter.clearAll')}
          </button>
        )}
      </div>

      {expanded && (
        <div className="border-t border-slate-200 p-3 dark:border-slate-700/50">
          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">{t('filter.quality')}</label>
            <div className="flex gap-2">
              {(['good', 'bad'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => onToggleQuality(q)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    selectedQuality.includes(q)
                      ? q === 'good'
                        ? 'border-green-500/40 bg-green-500/15 text-green-300'
                        : 'border-red-500/40 bg-red-500/15 text-red-300'
                      : 'border-slate-300 bg-slate-100/50 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  {q === 'good' ? t('filter.good') : t('filter.bad')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">{t('filter.tags')}</label>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder={t('filter.searchTagsPlaceholder')}
                className="input w-full pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto scrollbar-thin pr-1">
              {filteredTags.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => onToggleTag(t.tag)}
                  className={`rounded-md border px-2 py-1 text-xs transition ${
                    selectedTags.includes(t.tag)
                      ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300'
                      : 'border-slate-300 bg-slate-100/50 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  {t.tag} <span className="text-slate-400 dark:text-slate-500">({t.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
