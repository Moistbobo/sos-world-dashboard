/**
 * Shared Tailwind-class knowledge used by the token generator and the
 * codemod: palette values, class resolution, and (light, dark) var naming.
 */
export const PALETTE = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    850: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  fuchsia: { 400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf' },
  purple: { 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce' },
  cyan: { 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490' },
  sky: { 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1' },
  blue: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  emerald: { 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857' },
  rose: { 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48' },
  lime: { 400: '#a3e635', 500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f' },
  orange: { 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c' },
  yellow: { 400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207' },
  pink: { 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d' },
  teal: { 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
};

export function shade(color, num) {
  if (color === 'white' || color === 'black' || color === 'transparent') return PALETTE[color];
  if (!PALETTE[color] || !(num in PALETTE[color])) {
    throw new Error(`Unknown shade ${color}-${num}`);
  }
  return PALETTE[color][num];
}

/** Convert hex + alpha fraction to 8-digit hex: `#e2e8f0` + 0.5 -> `#e2e8f080`. */
export function withAlpha(colorHex, alpha) {
  if (colorHex === 'transparent') return 'transparent';
  const num = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${colorHex}${num}`;
}

/** Resolve a bare color utility (no variants) to { kind, hex, alpha }. */
export function resolveClass(tok) {
  let m = tok.match(/^(bg|text|border|ring|fill|decoration)-([a-z]+)-(\d{2,3})(?:\/(\d{1,3}))?$/);
  if (m) {
    const [, prefix, color, numStr, alphaStr] = m;
    return { kind: prefix, hex: shade(color, Number(numStr)), alpha: alphaStr ? Number(alphaStr) / 100 : null };
  }
  m = tok.match(/^(bg|text|border|ring|fill|decoration)-(white|black|transparent)(?:\/(\d{1,3}))?$/);
  if (m) {
    const [, prefix, color, alphaStr] = m;
    return { kind: prefix, hex: PALETTE[color], alpha: alphaStr ? Number(alphaStr) / 100 : null };
  }
  return null;
}

/** Sorted list of color prefix kinds (longest first so bg- wins over b...). */
export const COLOR_PREFIXES = ['decoration', 'border', 'ring', 'fill', 'text', 'bg'].filter((p, _, a) => a); // stable order
export const COLOR_PREFIX_SET = new Set(COLOR_PREFIXES);

export function normalKey(bare) {
  return bare.replace(/[^\w-]/g, (c) => (c === '/' ? '_' : ''));
}

/** Var name for a (lightBare, darkBare) color pair: `--sos-bg-slate200-slate800`. */
export function varNameForPair(lightBare, darkBare) {
  const prefix = lightBare.split('-')[0];
  return `--sos-${prefix}-${normalKey(lightBare.slice(prefix.length + 1))}-${normalKey(darkBare.slice(prefix.length + 1))}`;
}

export function isColorClass(bare) {
  const prefix = bare.split('-')[0];
  return COLOR_PREFIX_SET.has(prefix) && resolveClass(bare) != null;
}