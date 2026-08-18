import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Slider from '@radix-ui/react-slider';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit();
      (e.currentTarget as HTMLInputElement).blur();
    }
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

  const ticks = [MIN_CAPACITY, 20, 40, 60, MAX_CAPACITY];

  return (
    <div className="space-y-3">
      <div className={stylex.props(styles.c1e541q8).className}>
        <label
          htmlFor="min-capacity"
          className={stylex.props(styles.c1x3qsbc).className}
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
          onKeyDown={handleKeyDown}
          className={stylex.props(shared.input, styles.clyywa2).className}
        />
        <span className={stylex.props(styles.caaa1ne).className}>
          {t('filter.capacityTo')}
        </span>
        <label
          htmlFor="max-capacity"
          className={stylex.props(styles.c1x3qsbc).className}
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
          onKeyDown={handleKeyDown}
          className={stylex.props(shared.input, styles.clyywa2).className}
        />
      </div>

      <div className="space-y-2">
        <div
          className={stylex.props(styles.c1xu3u0s).className}
          aria-hidden="true"
        >
          {ticks.map((tick) => {
            const pct =
              ((tick - MIN_CAPACITY) / (MAX_CAPACITY - MIN_CAPACITY)) * 100;
            return (
              <div
                key={tick}
                className={stylex.props(styles.cpda5wx).className}
                style={{ left: `${pct}%` }}
              >
                <span className={stylex.props(styles.cgzjovr).className}>
                  {tick}
                </span>
              </div>
            );
          })}
          {ticks.map((tick) => {
            const pct =
              ((tick - MIN_CAPACITY) / (MAX_CAPACITY - MIN_CAPACITY)) * 100;
            return (
              <div
                key={`${tick}-desktop`}
                className={stylex.props(styles.c11w14of).className}
                style={{ left: `${pct * 0.6}%` }}
              >
                <span className={stylex.props(styles.cgzjovr).className}>
                  {tick}
                </span>
              </div>
            );
          })}
        </div>

        <Slider.Root
          value={[range.min, range.max]}
          min={MIN_CAPACITY}
          max={MAX_CAPACITY}
          step={1}
          minStepsBetweenThumbs={1}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          className={stylex.props(styles.csbju4s).className}
          aria-label={t('filter.capacity')}
        >
          <Slider.Track className={stylex.props(styles.csqnh6u).className}>
            <Slider.Range className={stylex.props(styles.c3a1i2c).className} />
          </Slider.Track>
          <Slider.Thumb
            className={stylex.props(styles.c1byd02j).className}
            aria-label={t('filter.minCapacity')}
          />
          <Slider.Thumb
            className={stylex.props(styles.c1byd02j).className}
            aria-label={t('filter.maxCapacity')}
          />
        </Slider.Root>
      </div>
    </div>
  );
}

const styles = stylex.create({
  c1e541q8: {
    "display": "grid",
    "gridTemplateColumns": "auto 1fr",
    "alignItems": "center",
    "columnGap": "0.5rem",
    "rowGap": "0.25rem",
    "@media (min-width: 640px)": {
      "display": "flex",
      "flexWrap": "wrap",
      "alignItems": "center",
      "gap": "0.5rem",
    },
  },
  c1x3qsbc: {
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "fontWeight": 500,
    "color": colors["--sos-text-slate-700-slate-300"],
  },
  clyywa2: {
    "width": "5rem",
  },
  caaa1ne: {
    "display": "none",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-600-slate-400"],
  },
  c1xu3u0s: {
    "position": "relative",
    "height": "1.25rem",
  },
  cpda5wx: {
    "position": "absolute",
    "bottom": "0",
    "display": "flex",
    "transform": "translateX(-50%)",
    "flexDirection": "column",
    "alignItems": "center",
    "@media (min-width: 640px)": {
      "display": "none",
    },
  },
  cgzjovr: {
    "fontSize": "10px",
    "fontWeight": 500,
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c11w14of: {
    "position": "absolute",
    "bottom": "0",
    "display": "none",
    "transform": "translateX(-50%)",
    "flexDirection": "column",
    "alignItems": "center",
    "@media (min-width: 640px)": {
      "display": "flex",
    },
  },
  csbju4s: {
    "position": "relative",
    "display": "flex",
    "width": "100%",
    "touchAction": "none",
    "userSelect": "none",
    "alignItems": "center",
    "@media (min-width: 640px)": {
      "width": "60%",
    },
  },
  csqnh6u: {
    "position": "relative",
    "marginLeft": "1rem",
    "marginRight": "1rem",
    "height": "0.5rem",
    "borderRadius": "9999px",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c3a1i2c: {
    "position": "absolute",
    "height": "100%",
    "borderRadius": "9999px",
    "backgroundColor": "#6366f1",
  },
  c1byd02j: {
    "display": "block",
    "height": "2rem",
    "width": "2rem",
    "borderRadius": "9999px",
    "borderWidth": 2,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-white-slate-900"],
    "backgroundColor": "#6366f1",
    "boxShadow": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "backgroundColor": "#4f46e5",
    },
    ":disabled": {
      "pointerEvents": "none",
      "opacity": 0.5,
    },
    ":focus": {
      "boxShadow": "0 0 0 0px #fff, 0 0 0 2px #818cf8",
    },
  },
});
