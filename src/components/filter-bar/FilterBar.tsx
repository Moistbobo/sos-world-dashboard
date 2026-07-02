import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, X } from 'lucide-react';
import { getEmojiForTag } from '../../utils/tagEmoji';
import { COMMON_PLATFORM_VALUES, getPlatformLabel } from '../../utils/platformLabel';
import {
  CapacityRange,
  CapacityRangeValue,
  MIN_CAPACITY,
  MAX_CAPACITY,
} from '../capacity-range';

interface FilterBarProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  selectedQuality: ('good' | 'bad')[];
  onToggleQuality: (quality: 'good' | 'bad') => void;
  onClear: () => void;
  availableTags: { tag: string; count: number }[];
  qualityCounts: { quality: 'good' | 'bad'; count: number }[];
  platformCounts: { platform: string; count: number }[];
  capacityRange: CapacityRangeValue;
  onCapacityChange: (range: CapacityRangeValue) => void;
  selectedPlatforms: string[];
  onTogglePlatform: (platform: string) => void;
  onRemovePlatform: (platform: string) => void;
}

export function FilterBar({
  selectedTags,
  onToggleTag,
  onRemoveTag,
  selectedQuality,
  onToggleQuality,
  onClear,
  availableTags,
  qualityCounts,
  platformCounts,
  capacityRange,
  onCapacityChange,
  selectedPlatforms,
  onTogglePlatform,
  onRemovePlatform,
}: FilterBarProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const tagFilters = [...availableTags].sort((a, b) => a.tag.localeCompare(b.tag));
  const qualityCountMap = new Map(qualityCounts.map((q) => [q.quality, q.count]));
  const platformCountMap = new Map(platformCounts.map((p) => [p.platform, p.count]));

  const isCapacityActive =
    capacityRange.min > MIN_CAPACITY || capacityRange.max < MAX_CAPACITY;

  const hasFilters =
    selectedTags.length > 0 ||
    selectedQuality.length > 0 ||
    isCapacityActive ||
    selectedPlatforms.length > 0;

  const activeFilterCount =
    selectedTags.length +
    selectedQuality.length +
    (isCapacityActive ? 1 : 0) +
    selectedPlatforms.length;

  return (
    <div className="card mb-4">
      <div
        data-testid="filter-bar-header"
        className="flex flex-wrap items-center gap-2 p-3 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className={`btn-ghost gap-1.5 text-xs ${expanded ? 'bg-slate-200 dark:bg-slate-800' : ''}`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {t('filter.filters')}
          {hasFilters && (
            <span className="ml-1 rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {isCapacityActive && (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30">
            <span>{capacityRange.min}–{capacityRange.max} {t('filter.capacityUnit')}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCapacityChange({ min: MIN_CAPACITY, max: MAX_CAPACITY });
              }}
              aria-label={t('filter.removeCapacity')}
              className="hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {selectedTags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30"
          >
            <span className="leading-none">{getEmojiForTag(t)}</span>
            <span>{t}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTag(t);
              }}
              className="hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {selectedPlatforms.map((p) => (
          <span
            key={p}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30"
          >
            <span>{getPlatformLabel(p)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemovePlatform(p);
              }}
              aria-label={t('filter.removePlatform')}
              className="hover:text-white"
            >
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleQuality(q);
              }}
              className="hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {hasFilters && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="btn-ghost text-xs py-1.5"
          >
            {t('filter.clearAll')}
          </button>
        )}
      </div>

      {expanded && (
        <div className="border-t border-slate-200 p-3 dark:border-slate-700/50">
          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">{t('filter.tags')}</label>
            <div className="flex flex-wrap gap-1.5 pr-1">
              {tagFilters.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => onToggleTag(t.tag)}
                  className={`rounded-md border px-2 py-1 text-xs transition ${
                    selectedTags.includes(t.tag)
                      ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300'
                      : 'border-slate-300 bg-slate-100/50 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  {getEmojiForTag(t.tag)} {t.tag} <span className="text-slate-400 dark:text-slate-500">({t.count})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">{t('filter.quality')}</label>
            <div className="flex gap-2">
              {(['good', 'bad'] as const).map((q) => {
                const count = qualityCountMap.get(q);
                return (
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
                    {count !== undefined && (
                      <span className="text-slate-400 dark:text-slate-500"> ({count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">{t('filter.platforms')}</label>
            <div className="flex flex-wrap gap-1.5 pr-1">
              {COMMON_PLATFORM_VALUES.map((p) => {
                const label = getPlatformLabel(p);
                const count = platformCountMap.get(p);
                return (
                  <button
                    key={p}
                    data-testid={`platform-toggle-${p || 'unknown'}`}
                    onClick={() => onTogglePlatform(p)}
                    className={`rounded-md border px-2 py-1 text-xs transition ${
                      selectedPlatforms.includes(p)
                        ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300'
                        : 'border-slate-300 bg-slate-100/50 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-slate-600'
                    }`}
                  >
                    {label}
                    {count !== undefined && (
                      <span className="text-slate-400 dark:text-slate-500"> ({count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">{t('filter.capacity')}</label>
            <CapacityRange
              key={`capacity-${capacityRange.min}-${capacityRange.max}`}
              min={capacityRange.min}
              max={capacityRange.max}
              onChange={onCapacityChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
