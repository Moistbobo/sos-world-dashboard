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
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

const PRESET_DAY_RANGES = [1, 7, 14, 30, 90, 180];

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
  dayRange: number | null;
  onDayRangeChange: (dayRange: number | null) => void;
  showCurator?: boolean;
  highPriority: boolean;
  onToggleHighPriority: () => void;
  highPriorityCount?: number;
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
  dayRange,
  onDayRangeChange,
  showCurator,
  highPriority,
  onToggleHighPriority,
  highPriorityCount,
}: FilterBarProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [customDayRangeInput, setCustomDayRangeInput] = useState(() =>
    PRESET_DAY_RANGES.includes(dayRange ?? -1) ? '' : String(dayRange ?? '')
  );

  const tagFilters = [...availableTags].sort((a, b) => a.tag.localeCompare(b.tag));
  const qualityCountMap = new Map(qualityCounts.map((q) => [q.quality, q.count]));
  const platformCountMap = new Map(platformCounts.map((p) => [p.platform, p.count]));

  const isCapacityActive =
    capacityRange.min > MIN_CAPACITY || capacityRange.max < MAX_CAPACITY;

  const isDayRangeActive = dayRange !== null;

  const hasFilters =
    selectedTags.length > 0 ||
    selectedQuality.length > 0 ||
    isCapacityActive ||
    selectedPlatforms.length > 0 ||
    isDayRangeActive ||
    highPriority;

  const activeFilterCount =
    selectedTags.length +
    selectedQuality.length +
    (isCapacityActive ? 1 : 0) +
    selectedPlatforms.length +
    (isDayRangeActive ? 1 : 0) +
    (highPriority ? 1 : 0);

  return (
    <div className={stylex.props(shared.card, styles.c1u0gah8).className}>
      <div
        data-testid="filter-bar-header"
        className={stylex.props(styles.c1afwb62).className}
        onClick={() => setExpanded((v) => !v)}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className={stylex.props(
            shared.btnGhost,
            styles.expandBtn,
            expanded ? styles.expandActive : undefined,
          ).className}
        >
          <SlidersHorizontal className={stylex.props(styles.c1ky5l8t).className} />
          {t('filter.filters')}
          {hasFilters && (
            <span className={stylex.props(styles.c1rp1rbr).className}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {isCapacityActive && (
          <span className={stylex.props(styles.crgeiew).className}>
            <span>{capacityRange.min}–{capacityRange.max} {t('filter.capacityUnit')}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCapacityChange({ min: MIN_CAPACITY, max: MAX_CAPACITY });
              }}
              aria-label={t('filter.removeCapacity')}
              className={stylex.props(styles.c16dlrc0).className}
            >
              <X className={stylex.props(styles.c1ky5l8t).className} />
            </button>
          </span>
        )}

        {isDayRangeActive && (
          <span className={stylex.props(styles.crgeiew).className}>
            <span>🏷️ {t('filter.lastNDays', { count: dayRange })}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDayRangeChange(null);
              }}
              aria-label={t('filter.removeDateTagged')}
              className={stylex.props(styles.c16dlrc0).className}
            >
              <X className={stylex.props(styles.c1ky5l8t).className} />
            </button>
          </span>
        )}

        {selectedTags.map((tag) => (
          <span
            key={tag}
            className={stylex.props(styles.crgeiew).className}
          >
            <span className={stylex.props(styles.czn4v4v).className}>{getEmojiForTag(tag)}</span>
            <span>{tag}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTag(tag);
              }}
              aria-label={t('filter.removeTag', { tag })}
              className={stylex.props(styles.c16dlrc0).className}
            >
              <X className={stylex.props(styles.c1ky5l8t).className} />
            </button>
          </span>
        ))}

        {selectedPlatforms.map((p) => (
          <span
            key={p}
            className={stylex.props(styles.crgeiew).className}
          >
            <span>{getPlatformLabel(p)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemovePlatform(p);
              }}
              aria-label={t('filter.removePlatform')}
              className={stylex.props(styles.c16dlrc0).className}
            >
              <X className={stylex.props(styles.c1ky5l8t).className} />
            </button>
          </span>
        ))}

        {showCurator &&
          selectedQuality.map((q) => (
          <span
            key={q}
            className={stylex.props(
              styles.chip,
              q === 'good' ? styles.chipGood : styles.chipBad,
            ).className}
          >
            {q === 'good' ? t('filter.good') : t('filter.bad')}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleQuality(q);
              }}
              className={stylex.props(
                styles.chipClose,
                q === 'good' ? styles.chipCloseGood : styles.chipCloseBad,
              ).className}
            >
                <X className={stylex.props(styles.c1ky5l8t).className} />
              </button>
            </span>
          ))}

        {showCurator && highPriority && (
          <span className={stylex.props(styles.c1avio2q).className}>
            <span>{t('filter.highPriority')}</span>
            {highPriorityCount !== undefined && (
              <span className={stylex.props(styles.cnk7lcr).className}>({highPriorityCount})</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleHighPriority();
              }}
              aria-label={t('filter.removeHighPriority')}
              className={stylex.props(styles.c1fr6lmp).className}
            >
              <X className={stylex.props(styles.c1ky5l8t).className} />
            </button>
          </span>
        )}

        {hasFilters && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className={stylex.props(shared.btnGhost, styles.c1hozn4m).className}
          >
            {t('filter.clearAll')}
          </button>
        )}
      </div>

      {expanded && (
        <div className={stylex.props(styles.c1s6r8n8).className}>
          <div className={stylex.props(styles.c1zncr).className}>
            <label className={stylex.props(styles.cxhut7v).className}>{t('filter.tags')}</label>
            <div className={stylex.props(styles.cf8m110).className}>
              {tagFilters.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => onToggleTag(t.tag)}
                  className={stylex.props(
                    styles.chipToggle,
                    selectedTags.includes(t.tag) ? styles.chipActive : styles.chipInactive,
                  ).className}
                >
                  {getEmojiForTag(t.tag)} {t.tag} <span className={stylex.props(styles.c1afe19h).className}>({t.count})</span>
                </button>
              ))}
            </div>
          </div>

          <div className={stylex.props(styles.c1zncr).className}>
            <label className={stylex.props(styles.cxhut7v).className}>{t('filter.platforms')}</label>
            <div className={stylex.props(styles.cf8m110).className}>
              {COMMON_PLATFORM_VALUES.map((p) => {
                const label = getPlatformLabel(p);
                const count = platformCountMap.get(p);
                return (
                  <button
                    key={p}
                    data-testid={`platform-toggle-${p || 'unknown'}`}
                    onClick={() => onTogglePlatform(p)}
                    className={stylex.props(
                      styles.chipToggle,
                      selectedPlatforms.includes(p) ? styles.chipActive : styles.chipInactive,
                    ).className}
                  >
                    {label}
                    {count !== undefined && (
                      <span className={stylex.props(styles.c1afe19h).className}> ({count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={stylex.props(styles.c1zncr).className}>
            <label className={stylex.props(styles.cxhut7v).className}>{t('filter.capacity')}</label>
            <CapacityRange
              key={`capacity-${capacityRange.min}-${capacityRange.max}`}
              min={capacityRange.min}
              max={capacityRange.max}
              onChange={onCapacityChange}
            />
          </div>

          <div className={stylex.props(styles.c1zncr).className}>
            <label className={stylex.props(styles.cxhut7v).className}>{t('filter.dateTagged')}</label>
            <div className={stylex.props(styles.cf8m110).className}>
              {PRESET_DAY_RANGES.map((days) => {
                const selected = dayRange === days;
                return (
                  <button
                    key={days}
                    data-testid={`day-range-preset-${days}`}
                    onClick={() => onDayRangeChange(days)}
                    className={stylex.props(
                      styles.chipToggle,
                      selected ? styles.chipActive : styles.chipInactive,
                    ).className}
                  >
                    {t('filter.lastNDays', { count: days })}
                  </button>
                );
              })}
              <button
                data-testid="day-range-preset-all"
                onClick={() => onDayRangeChange(null)}
                className={stylex.props(
                  styles.chipToggle,
                  !isDayRangeActive ? styles.chipActive : styles.chipInactive,
                ).className}
              >
                {t('filter.allTime')}
              </button>
            </div>
            <div className={stylex.props(styles.cd1h6q8).className}>
              <label
                htmlFor="custom-day-range"
                className={stylex.props(styles.c1cin6mw).className}
              >
                {t('filter.custom')}:
              </label>
              <input
                id="custom-day-range"
                type="number"
                min={1}
                placeholder={t('filter.days')}
                value={customDayRangeInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomDayRangeInput(value);
                  if (value === '') {
                    onDayRangeChange(null);
                    return;
                  }
                  const parsed = Number(value);
                  if (Number.isFinite(parsed) && parsed > 0) {
                    onDayRangeChange(parsed);
                  }
                }}
                className={stylex.props(shared.input, styles.clyywa6).className}
                aria-label={t('filter.custom')}
              />
              <span className={stylex.props(styles.c6b0xl6).className}>{t('filter.days')}</span>
            </div>
          </div>

          {showCurator && (
            <div className={stylex.props(styles.c1zncr).className}>
              <label className={stylex.props(styles.cxhut7v).className}>{t('filter.curator')}</label>
              <div className={stylex.props(styles.c1sdudaq).className}>
                {(['good', 'bad'] as const).map((q) => {
                  const count = qualityCountMap.get(q);
                  return (
                    <button
                      key={q}
                      onClick={() => onToggleQuality(q)}
                      className={stylex.props(
                        styles.chipToggle,
                        styles.chipToggleLg,
                        selectedQuality.includes(q)
                          ? q === 'good'
                            ? styles.chipQualityGood
                            : styles.chipQualityBad
                          : styles.chipInactive,
                      ).className}
                    >
                      {q === 'good' ? t('filter.good') : t('filter.bad')}
                      {count !== undefined && (
                        <span className={stylex.props(styles.c1afe19h).className}> ({count})</span>
                      )}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={onToggleHighPriority}
                  aria-pressed={highPriority}
                  className={stylex.props(
                    styles.chipToggle,
                    highPriority ? styles.chipPriority : styles.chipInactive,
                  ).className}
                >
                  {t('filter.highPriority')}
                  {highPriorityCount !== undefined && (
                    <span className={stylex.props(styles.c1afe19h).className}>
                      {' '}
                      ({highPriorityCount})
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = stylex.create({
  c1u0gah8: {
    "marginBottom": "1rem",
  },
  c1afwb62: {
    "display": "flex",
    "flexWrap": "wrap",
    "alignItems": "center",
    "gap": "0.5rem",
    "padding": "0.75rem",
    "cursor": "pointer",
  },
  c1ky5l8t: {
    "height": "1rem",
    "width": "1rem",
  },
  c1rp1rbr: {
    "marginLeft": "0.25rem",
    "borderRadius": "9999px",
    "backgroundColor": "#6366f1",
    "paddingLeft": "0.5rem",
    "paddingRight": "0.5rem",
    "paddingTop": "0.125rem",
    "paddingBottom": "0.125rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "fontWeight": 700,
    "color": "#ffffff",
  },
  crgeiew: {
    "display": "inline-flex",
    "alignItems": "center",
    "gap": "0.375rem",
    "borderRadius": "9999px",
    "backgroundColor": "#6366f133",
    "paddingLeft": "0.875rem",
    "paddingRight": "0.875rem",
    "paddingTop": "0.625rem",
    "paddingBottom": "0.625rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "color": colors["--sos-text-indigo-700-indigo-300"],
    "boxShadow": "0 0 0 0px #fff, 0 0 0 1px #6366f14d",
  },
  c16dlrc0: {
    "display": "flex",
    "height": "1.5rem",
    "width": "1.5rem",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "9999px",
    ":hover": {
      "color": colors["--sos-text-indigo-900-white"],
    },
  },
  czn4v4v: {
    "lineHeight": 1,
  },
  c1avio2q: {
    "display": "inline-flex",
    "alignItems": "center",
    "gap": "0.375rem",
    "borderRadius": "9999px",
    "backgroundColor": "#f59e0b33",
    "paddingLeft": "0.875rem",
    "paddingRight": "0.875rem",
    "paddingTop": "0.625rem",
    "paddingBottom": "0.625rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "color": colors["--sos-text-amber-700-amber-300"],
    "boxShadow": "0 0 0 0px #fff, 0 0 0 1px #f59e0b4d",
  },
  cnk7lcr: {
    "opacity": 0.7,
  },
  c1fr6lmp: {
    "display": "flex",
    "height": "1.5rem",
    "width": "1.5rem",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "9999px",
    ":hover": {
      "color": colors["--sos-text-amber-900-amber-100"],
    },
  },
  c1hozn4m: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
  },
  c1s6r8n8: {
    "borderTopWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-200-slate-700_50"],
    "padding": "0.75rem",
  },
  c1zncr: {
    "marginBottom": "0.75rem",
  },
  cxhut7v: {
    "marginBottom": "0.375rem",
    "display": "block",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "fontWeight": 500,
    "color": colors["--sos-text-slate-700-slate-300"],
  },
  cf8m110: {
    "display": "flex",
    "flexWrap": "wrap",
    "gap": "0.5rem",
    "paddingRight": "0.25rem",
  },
  c1afe19h: {
    "color": colors["--sos-text-slate-400-slate-500"],
  },
  cd1h6q8: {
    "marginTop": "0.5rem",
    "display": "flex",
    "alignItems": "center",
    "gap": "0.5rem",
  },
  c1cin6mw: {
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "fontWeight": 500,
    "color": colors["--sos-text-slate-600-slate-400"],
  },
  clyywa6: {
    "width": "6rem",
  },
  c6b0xl6: {
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1sdudaq: {
    "display": "flex",
    "flexWrap": "wrap",
    "gap": "0.5rem",
  },
  expandBtn: {
    "gap": "0.375rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
  },
  expandActive: {
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
  },
  chip: {
    "display": "inline-flex",
    "alignItems": "center",
    "gap": "0.375rem",
    "borderRadius": "9999px",
    "paddingLeft": "0.875rem",
    "paddingRight": "0.875rem",
    "paddingTop": "0.625rem",
    "paddingBottom": "0.625rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "boxShadow": "0 0 0 1px var(--chip-ring, transparent)",
  },
  chipGood: {
    "backgroundColor": "#22c55e33",
    "color": colors["--sos-text-green-700-green-300"],
    "--chip-ring": "#22c55e4d",
  },
  chipBad: {
    "backgroundColor": "#ef444433",
    "color": colors["--sos-text-red-700-red-300"],
    "--chip-ring": "#ef44444d",
  },
  chipClose: {
    "display": "flex",
    "height": "1.5rem",
    "width": "1.5rem",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "9999px",
  },
  chipCloseGood: {
    ":hover": {
      "color": colors["--sos-text-green-900-green-200"],
    },
  },
  chipCloseBad: {
    ":hover": {
      "color": colors["--sos-text-red-900-red-200"],
    },
  },
  chipToggle: {
    "minHeight": "3rem",
    "borderRadius": "0.5rem",
    "borderStyle": "solid",
    "borderWidth": 1,
    "paddingLeft": "0.875rem",
    "paddingRight": "0.875rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    "transitionDuration": "0.15s",
    "transitionTimingFunction": "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  chipToggleLg: {
    "fontWeight": 500,
    "paddingLeft": "1rem",
    "paddingRight": "1rem",
  },
  chipActive: {
    "borderColor": "#6366f166",
    "backgroundColor": "#6366f126",
    "color": colors["--sos-text-indigo-700-indigo-300"],
  },
  chipInactive: {
    "borderColor": colors["--sos-border-slate-300-slate-700"],
    "backgroundColor": colors["--sos-bg-slate-100_50-slate-800_50"],
    "color": colors["--sos-text-slate-600-slate-400"],
    ":hover": {
      "borderColor": "#94a3b8",
    },
  },
  chipQualityGood: {
    "borderColor": "#22c55e66",
    "backgroundColor": "#22c55e26",
    "color": colors["--sos-text-green-700-green-300"],
  },
  chipQualityBad: {
    "borderColor": "#ef444466",
    "backgroundColor": "#ef444426",
    "color": colors["--sos-text-red-700-red-300"],
  },
  chipPriority: {
    "borderColor": "#f59e0b66",
    "backgroundColor": "#f59e0b26",
    "color": colors["--sos-text-amber-700-amber-300"],
  },
});
