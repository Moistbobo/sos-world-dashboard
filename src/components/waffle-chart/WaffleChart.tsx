import { useMemo, useRef, useState } from 'react';
import { getEmojiForTag } from '../../utils/tagEmoji';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';

interface WaffleItem {
  name: string;
  value: number;
}

interface WaffleChartProps {
  data: WaffleItem[];
  onSelectTag?: (tag: string) => void;
  getColor?: (tag: string) => string;
}

export function WaffleChart({ data, onSelectTag, getColor }: WaffleChartProps) {
  const [hovered, setHovered] = useState<{
    name: string;
    value: number;
    pct: number;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [allAnimated, setAllAnimated] = useState(false);
  const animatedCount = useRef(0);

  // Build 100 cells using largest-remainder rounding so the waffle is always full
  // while staying as close as possible to each item's true share.
  const cells = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return [];
    const rawShares = data.map((item) => ({
      name: item.name,
      floor: Math.floor((item.value / total) * 100),
      remainder: ((item.value / total) * 100) - Math.floor((item.value / total) * 100),
    }));
    const baseCells = rawShares.reduce((sum, s) => sum + s.floor, 0);
    const cellsToDistribute = 100 - baseCells;

    const sortedByRemainder = rawShares
      .map((s, index) => ({ ...s, index }))
      .sort((a, b) => b.remainder - a.remainder);
    const extraCells = new Map<string, number>();
    for (let i = 0; i < cellsToDistribute; i++) {
      const item = sortedByRemainder[i % sortedByRemainder.length];
      extraCells.set(item.name, (extraCells.get(item.name) ?? 0) + 1);
    }

    const result: { name: string; color: string }[] = [];
    data.forEach((item) => {
      const count = rawShares.find((s) => s.name === item.name)!.floor + (extraCells.get(item.name) ?? 0);
      const color = getColor?.(item.name) ?? '#6366f1';
      for (let j = 0; j < count; j++) {
        result.push({ name: item.name, color });
      }
    });
    return result;
  }, [data, getColor]);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  if (total === 0) return null;

  // `animationend` bubbles up from every cell; commit the animation-complete
  // state once instead of firing up to 100 ready-state updates.
  const handleAnimationEnd = () => {
    animatedCount.current += 1;
    if (animatedCount.current >= cells.length) {
      setAllAnimated(true);
    }
  };

  const handleMouseEnter = (
    name: string,
    value: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    setHovered({ name, value, pct: (value / total) * 100 });
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleFocus = (
    name: string,
    value: number,
    e: React.FocusEvent<HTMLDivElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHovered({ name, value, pct: (value / total) * 100 });
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => setHovered(null);

  const handleBlur = () => setHovered(null);

  const focusedName = hovered?.name ?? null;

  return (
    <div className={stylex.props(styles.c4asjyt).className}>
      <style>
        {`
          @keyframes waffleScaleIn {
            from {
              opacity: 0;
              transform: scale(0);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>

      {/* Grid of 100 cells */}
      <div className={stylex.props(styles.c1bli1ba).className} onAnimationEnd={handleAnimationEnd}>
        {cells.map((cell, idx) => {
          const isMatch =
            focusedName !== null && cell.name === focusedName;
          const isDimmed =
            focusedName !== null && !isMatch;
          const emoji = getEmojiForTag(cell.name);

          return (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              className={stylex.props(styles.c4pf16l).className}
              style={{
                backgroundColor: cell.color,
                opacity: allAnimated ? (isDimmed ? 0.5 : 1) : 0,
                transform: allAnimated
                  ? isMatch
                    ? 'scale(1.1)'
                    : 'scale(1)'
                  : 'scale(0)',
                animation: allAnimated
                  ? undefined
                  : `waffleScaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1) ${(9 - Math.floor(idx / 10)) * 35 + (idx % 10) * 3}ms forwards`,
              }}
              onClick={() => onSelectTag?.(cell.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTag?.(cell.name);
                }
              }}
              onMouseEnter={(e) => {
                const item = data.find((d) => d.name === cell.name);
                if (item) handleMouseEnter(cell.name, item.value, e);
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onFocus={(e) => {
                const item = data.find((d) => d.name === cell.name);
                if (item) handleFocus(cell.name, item.value, e);
              }}
              onBlur={handleBlur}
            >
              {/* Emoji badge — rendered unconditionally so it scales in with the parent cell */}
              <span className={stylex.props(styles.c1d2oxqh).className}>{emoji}</span>
            </div>
          );
        })}
      </div>

      {/* Custom tooltip */}
      {hovered && (
        <div
          className={stylex.props(styles.cx45rgu).className}
          style={{
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 12,
          }}
        >
          <div className={stylex.props(styles.creg0xd).className}>{hovered.name}</div>
          <div className={stylex.props(styles.c1v0hm78).className}>
            {hovered.value} ({hovered.pct.toFixed(1)}%)
          </div>
        </div>
      )}

      {/* Legend */}
      <div className={stylex.props(styles.c1bqih94).className}>
        {data.map((item) => (
          <div
            key={item.name}
            className={stylex.props(styles.c1jctewx).className}
          >
            <span
              className={stylex.props(styles.crrrl3q).className}
              style={{ backgroundColor: getColor?.(item.name) ?? '#6366f1' }}
            />
            <span className={stylex.props(styles.czn4v4v).className}>{getEmojiForTag(item.name)}</span>
            <span className={stylex.props(styles.ctvybfo).className}>{item.name}</span>
            <span className={stylex.props(styles.c1v0hmxx).className}>({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = stylex.create({
  c4asjyt: {
    "position": "relative",
    "userSelect": "none",
  },
  c1bli1ba: {
    "display": "grid",
    "gridTemplateColumns": "repeat(10, minmax(0, 1fr))",
    "gap": "0.25rem",
  },
  c4pf16l: {
    "display": "flex",
    "aspectRatio": "1 / 1",
    "cursor": "pointer",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "0.125rem",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":focus-visible": {
      "boxShadow": "0 0 0 0px #fff, 0 0 0 2px #6366f180",
    },
  },
  c1d2oxqh: {
    "pointerEvents": "none",
    "fontSize": "0.875rem",
    "lineHeight": 1,
  },
  cx45rgu: {
    "pointerEvents": "none",
    "position": "fixed",
    "zIndex": 50,
    "borderRadius": "0.375rem",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-300-slate-600"],
    "backgroundColor": colors["--sos-bg-white-slate-800"],
    "paddingLeft": "0.75rem",
    "paddingRight": "0.75rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-900-white"],
    "boxShadow": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  creg0xd: {
    "fontWeight": 600,
  },
  c1v0hm78: {
    "color": colors["--sos-text-slate-500-slate-300"],
  },
  c1bqih94: {
    "marginTop": "1rem",
    "display": "flex",
    "flexWrap": "wrap",
    "columnGap": "1rem",
    "rowGap": "0.5rem",
  },
  c1jctewx: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.375rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-700-slate-300"],
  },
  crrrl3q: {
    "display": "inline-block",
    "height": "0.75rem",
    "width": "0.75rem",
    "borderRadius": "0.125rem",
  },
  czn4v4v: {
    "lineHeight": 1,
  },
  ctvybfo: {
    "maxWidth": "120px",
    "overflow": "hidden",
    "textOverflow": "ellipsis",
    "whiteSpace": "nowrap",
  },
  c1v0hmxx: {
    "color": colors["--sos-text-slate-500-slate-400"],
  },
});
