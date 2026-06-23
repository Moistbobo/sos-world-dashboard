import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const MIN_CAPACITY = 1;
export const MAX_CAPACITY = 80;

export interface CapacityRangeValue {
  min: number;
  max: number;
}

interface CapacityRangeProps {
  min: number;
  max: number;
  onChange: (range: CapacityRangeValue) => void;
}

function clamp(value: number, floor: number, ceiling: number): number {
  return Math.max(floor, Math.min(ceiling, value));
}

function parseCapacity(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function CapacityRange({ min, max, onChange }: CapacityRangeProps) {
  const { t } = useTranslation();
  const [minInput, setMinInput] = useState(String(min));
  const [maxInput, setMaxInput] = useState(String(max));

  const handleBlur = () => {
    let newMin = clamp(parseCapacity(minInput, min), MIN_CAPACITY, MAX_CAPACITY);
    let newMax = clamp(parseCapacity(maxInput, max), MIN_CAPACITY, MAX_CAPACITY);

    if (newMin > newMax) {
      [newMin, newMax] = [newMax, newMin];
    }

    setMinInput(String(newMin));
    setMaxInput(String(newMax));
    onChange({ min: newMin, max: newMax });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label
        htmlFor="min-capacity"
        className="text-xs font-medium text-slate-700 dark:text-slate-300"
      >
        {t('filter.minCapacity')}
      </label>
      <input
        id="min-capacity"
        type="number"
        value={minInput}
        onChange={(e) => setMinInput(e.target.value)}
        onBlur={handleBlur}
        className="input w-20"
      />
      <span className="text-xs text-slate-600 dark:text-slate-400">
        {t('filter.capacityTo')}
      </span>
      <label
        htmlFor="max-capacity"
        className="text-xs font-medium text-slate-700 dark:text-slate-300"
      >
        {t('filter.maxCapacity')}
      </label>
      <input
        id="max-capacity"
        type="number"
        value={maxInput}
        onChange={(e) => setMaxInput(e.target.value)}
        onBlur={handleBlur}
        className="input w-20"
      />
      <span className="text-xs text-slate-600 dark:text-slate-400">
        {t('filter.capacityUnit')}
      </span>
    </div>
  );
}
