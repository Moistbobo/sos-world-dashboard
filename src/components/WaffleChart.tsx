import { useState } from 'react';
import { getEmojiForTag } from '../utils/tagEmoji';

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
  const [readySet, setReadySet] = useState<Set<number>>(new Set());

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  // Build 100 cells, proportional to each item's share
  let remaining = 100;
  const cells: { name: string; color: string }[] = [];

  data.forEach((item) => {
    const color = getColor?.(item.name) ?? '#6366f1';
    const cellsForItem =
      data.indexOf(item) === data.length - 1
        ? remaining
        : Math.max(1, Math.round((item.value / total) * 100));
    remaining -= cellsForItem;
    for (let j = 0; j < cellsForItem; j++) {
      cells.push({
        name: item.name,
        color,
      });
    }
  });

  const markReady = (idx: number) => {
    setReadySet((prev) => {
      if (prev.has(idx)) return prev;
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  };

  const handleMouseEnter = (
    name: string,
    value: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    setHovered({ name, value, pct: (value / total) * 100 });
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => setHovered(null);

  const focusedName = hovered?.name ?? null;

  return (
    <div className="relative select-none">
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
      <div className="grid grid-cols-10 gap-1">
        {cells.map((cell, idx) => {
          const isMatch =
            focusedName !== null && cell.name === focusedName;
          const isDimmed =
            focusedName !== null && !isMatch;
          const ready = readySet.has(idx);
          const emoji = getEmojiForTag(cell.name);

          return (
            <div
              key={idx}
              className="flex aspect-square cursor-pointer items-center justify-center rounded-sm transition"
              style={{
                backgroundColor: cell.color,
                opacity: ready ? (isDimmed ? 0.5 : 1) : 0,
                transform: ready
                  ? isMatch
                    ? 'scale(1.1)'
                    : 'scale(1)'
                  : 'scale(0)',
                animation: ready
                  ? undefined
                  : `waffleScaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1) ${(9 - Math.floor(idx / 10)) * 35 + (idx % 10) * 3}ms forwards`,
              }}
              onAnimationEnd={() => markReady(idx)}
              onClick={() => onSelectTag?.(cell.name)}
              onMouseEnter={(e) => {
                const item = data.find((d) => d.name === cell.name);
                if (item) handleMouseEnter(cell.name, item.value, e);
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Emoji badge — always visible once animated */}
              {ready && (
                <span className="pointer-events-none text-sm leading-none">{emoji}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom tooltip */}
      {hovered && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-white shadow-lg"
          style={{
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 12,
          }}
        >
          <div className="font-semibold">{hovered.name}</div>
          <div className="text-slate-300">
            {hovered.value} ({hovered.pct.toFixed(1)}%)
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-1.5 text-xs text-slate-300"
          >
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: getColor?.(item.name) ?? '#6366f1' }}
            />
            <span className="leading-none">{getEmojiForTag(item.name)}</span>
            <span className="max-w-[120px] truncate">{item.name}</span>
            <span className="text-slate-500">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
