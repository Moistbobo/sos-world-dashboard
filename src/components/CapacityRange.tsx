import { useEffect, useRef } from 'react';
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
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);

  // Keep the inputs in sync with external prop changes (URL seeding,
  // "Clear all", browser navigation) while the user is not actively
  // editing them. We write directly to the DOM because the inputs are
  // intentionally uncontrolled: React only needs to know the final
  // committed range, which is reported on blur.
  useEffect(() => {
    if (minRef.current && document.activeElement !== minRef.current) {
      minRef.current.value = String(min);
    }
    if (maxRef.current && document.activeElement !== maxRef.current) {
      maxRef.current.value = String(max);
    }
  }, [min, max]);

  const commit = () => {
    const rawMin = minRef.current?.value ?? String(min);
    const rawMax = maxRef.current?.value ?? String(max);

    const parsedMin =
      rawMin.trim() === ''
        ? MIN_CAPACITY
        : clamp(parseCapacity(rawMin, min), MIN_CAPACITY, MAX_CAPACITY);
    const parsedMax =
      rawMax.trim() === ''
        ? MAX_CAPACITY
        : clamp(parseCapacity(rawMax, max), MIN_CAPACITY, MAX_CAPACITY);

    const newMin = Math.min(parsedMin, parsedMax);
    const newMax = Math.max(parsedMin, parsedMax);

    if (minRef.current) minRef.current.value = String(newMin);
    if (maxRef.current) maxRef.current.value = String(newMax);
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
        ref={minRef}
        id="min-capacity"
        type="number"
        min={MIN_CAPACITY}
        max={MAX_CAPACITY}
        step="1"
        defaultValue={min}
        onBlur={commit}
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
        ref={maxRef}
        id="max-capacity"
        type="number"
        min={MIN_CAPACITY}
        max={MAX_CAPACITY}
        step="1"
        defaultValue={max}
        onBlur={commit}
        className="input w-20"
      />
      <span className="text-xs text-slate-600 dark:text-slate-400">
        {t('filter.capacityUnit')}
      </span>
    </div>
  );
}
