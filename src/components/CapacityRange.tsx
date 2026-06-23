import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Slider from '@radix-ui/react-slider';

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

function normalizeRange(a: number, b: number): CapacityRangeValue {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return {
    min: clamp(min, MIN_CAPACITY, MAX_CAPACITY),
    max: clamp(max, MIN_CAPACITY, MAX_CAPACITY),
  };
}

export function CapacityRange({ min, max, onChange }: CapacityRangeProps) {
  const { t } = useTranslation();
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);
  const [range, setRange] = useState<CapacityRangeValue>(() =>
    normalizeRange(min, max)
  );

  const commit = () => {
    const rawMin = minRef.current?.value ?? String(range.min);
    const rawMax = maxRef.current?.value ?? String(range.max);
    const parsedMin =
      rawMin.trim() === '' ? MIN_CAPACITY : parseCapacity(rawMin, min);
    const parsedMax =
      rawMax.trim() === '' ? MAX_CAPACITY : parseCapacity(rawMax, max);
    const next = normalizeRange(parsedMin, parsedMax);

    if (minRef.current) minRef.current.value = String(next.min);
    if (maxRef.current) maxRef.current.value = String(next.max);
    setRange(next);
    onChange(next);
  };

  const handleSliderChange = (values: number[]) => {
    const [nextMin, nextMax] = values;
    const next = { min: nextMin, max: nextMax };
    if (minRef.current) minRef.current.value = String(nextMin);
    if (maxRef.current) maxRef.current.value = String(nextMax);
    setRange(next);
  };

  const handleSliderCommit = (values: number[]) => {
    const [nextMin, nextMax] = values;
    const next = normalizeRange(nextMin, nextMax);
    if (minRef.current) minRef.current.value = String(next.min);
    if (maxRef.current) maxRef.current.value = String(next.max);
    setRange(next);
    onChange(next);
  };

  return (
    <div className="space-y-3">
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
          defaultValue={range.min}
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
          defaultValue={range.max}
          onBlur={commit}
          className="input w-20"
        />
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {t('filter.capacityUnit')}
        </span>
      </div>

      <Slider.Root
        value={[range.min, range.max]}
        min={MIN_CAPACITY}
        max={MAX_CAPACITY}
        step={1}
        minStepsBetweenThumbs={1}
        onValueChange={handleSliderChange}
        onValueCommit={handleSliderCommit}
        className="relative flex w-full touch-none select-none items-center py-2"
        aria-label={t('filter.capacity')}
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-slate-200 dark:bg-slate-700">
          <Slider.Range className="absolute h-full rounded-full bg-indigo-500" />
        </Slider.Track>
        <Slider.Thumb
          className="block h-4 w-4 rounded-full border-2 border-white bg-indigo-500 shadow transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-900"
          aria-label={t('filter.minCapacity')}
        />
        <Slider.Thumb
          className="block h-4 w-4 rounded-full border-2 border-white bg-indigo-500 shadow transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-900"
          aria-label={t('filter.maxCapacity')}
        />
      </Slider.Root>
    </div>
  );
}
