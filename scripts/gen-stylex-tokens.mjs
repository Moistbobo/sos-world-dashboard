#!/usr/bin/env node
/**
 * Generates `src/styles/tokens.stylex.ts` — one CSS custom property per
 * (light, dark) color pair actually used in src/**, and prints the
 * `html.dark` override block for index.css.
 *
 * Pair extraction: a className chunk containing both `X` and `dark:X`
 * (same variant chain, e.g. `bg-slate-200 dark:bg-slate-800` or
 * `hover:bg-slate-200 dark:hover:bg-slate-700`) contributes one token
 * keyed by the pair, e.g. `--sos-bg-slate200-slate800`. Values come from
 * the Tailwind palette below so light defaults and dark overrides cannot
 * drift apart.
 *
 * Usage: node scripts/gen-stylex-tokens.mjs [--report]
 */
import { readFileSync, readdirSync, statSync, writeFile } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'src/styles/tokens.stylex.ts');
const REPORT = process.argv.includes('--report');

const PALETTE = {
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
  fuchsia: {
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
  },
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

function shade(color, num) {
  if (color === 'white' || color === 'black' || color === 'transparent') return PALETTE[color];
  if (!PALETTE[color] || !(num in PALETTE[color])) {
    throw new Error(`Unknown shade ${color}-${num}`);
  }
  return PALETTE[color][num];
}

/** Convert a hex + alpha fraction to 8-digit hex, e.g. `#e2e8f0` + 0.5 -> `#e2e8f080`. */
function withAlpha(colorHex, alpha) {
  if (colorHex === 'transparent') return 'transparent';
  const num = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${colorHex}${num}`;
}

/** Resolve a bare color utility (no variants) to { kind, hex, alpha }. */
function resolveClass(tok) {
  let m = tok.match(/^(bg|text|border|ring|fill|decoration)-([a-z]+)-(\d{2,3})(?:\/(\d{1,3}))?$/);
  if (m) {
    const [, prefix, color, numStr, alphaStr] = m;
    const alpha = alphaStr ? Number(alphaStr) / 100 : null;
    const hex = shade(color, Number(numStr));
    return { kind: prefix, hex, alpha };
  }
  m = tok.match(/^(bg|text|border|ring|fill|decoration)-(white|black|transparent)(?:\/(\d{1,3}))?$/);
  if (m) {
    const [, prefix, color, alphaStr] = m;
    const alpha = alphaStr ? Number(alphaStr) / 100 : null;
    return { kind: prefix, hex: PALETTE[color], alpha };
  }
  return null;
}

const COLOR_PREFIXES = new Set(['bg', 'text', 'border', 'ring', 'fill', 'decoration']);

function normalKey(bare) {
  return bare.replace(/[^\w-]/g, (c) => (c === '/' ? '_' : ''));
}

function varNameForPair(lightBare, darkBare) {
  const prefix = lightBare.split('-')[0];
  return `--sos-${prefix}-${normalKey(lightBare.slice(prefix.length + 1))}-${normalKey(darkBare.slice(prefix.length + 1))}`;
}

function walk(dir) {
  let out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (/\.(tsx|ts)$/.test(e) && !/\.test\./.test(e)) out.push(p);
  }
  return out;
}

function isColorClass(bare) {
  const prefix = bare.split('-')[0];
  return COLOR_PREFIXES.has(prefix) && resolveClass(bare) != null;
}

/**
 * Extracts every static class literal inside a `className=` attribute.
 * Handles: className="...", '...', `...`, {...expr...} where expr may be
 * ternaries / arrays / template literals. Each string literal inside the
 * expression is its own chunk (matching Tailwind JIT's per-literal scan),
 * so distinct ternary branches cannot cross-contaminate pairs.
 */
function classNameChunks(code) {
  const out = [];
  const balanced = (start, open, close) => {
    let depth = 0;
    for (let i = start; i < code.length; i++) {
      if (code[i] === open) depth++;
      else if (code[i] === close) {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  };
  const skipString = (i) => {
    const q = code[i];
    for (let j = i + 1; j < code.length; j++) {
      if (code[j] === '\\') {
        j++;
        continue;
      }
      if (code[j] === '`' && q === '`' && code[j - 1] === '$') continue;
      if (code[j] === q) return j;
    }
    return -1;
  };

  for (let i = 0; i < code.length; i++) {
    const m = /className=\s*/.exec(code.slice(i));
    if (!m) break;
    const attrStart = i + m.index + m[0].length;
    let end;
    if (code[attrStart] === '{') {
      end = balanced(attrStart, '{', '}');
      if (end < 0) break;
    } else if (code[attrStart] === '"' || code[attrStart] === "'" || code[attrStart] === '`') {
      end = skipString(attrStart);
      if (end < 0) break;
    } else {
      i += m.index + m[0].length;
      continue;
    }
    i = end;

    // Harvest string literals within [attrStart, end] (also the direct literal case).
    let slice = code.slice(attrStart, end + 1);
    const literalRe = /(["'`])((?:\\.|(?!\1).)*)\1/g;
    let lm;
    while ((lm = literalRe.exec(slice))) {
      const raw = lm[2];
      const unescaped = raw.replace(/\\(.)/g, '$1');
      for (const part of unescaped.split(/\$\{[^}]*\}/)) {
        const t = part.trim();
        if (t) out.push(t);
      }
    }
  }
  return out;
}

// 1. Collect every static className chunk in src/** plus @apply lists in index.css.
const chunks = [];
for (const f of walk(join(ROOT, 'src'))) {
  chunks.push(...classNameChunks(readFileSync(f, 'utf8')));
}
const css = readFileSync(join(ROOT, 'src/index.css'), 'utf8');
for (const m of css.matchAll(/@apply\s+([^;]+);/g)) {
  const t = m[1].trim();
  if (t) chunks.push(t);
}

// 2. Extract (light, dark) color pairs sharing prefix + variant chain.
//    `dark:bg-indigo-950/50` pairs with the chunk's non-dark `bg-*` token.
const seen = new Map(); // varName -> { light, dark, pair }
const skippedDark = new Set();
for (const c of chunks) {
  const toks = c
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/^[^a-z-]+|[^a-z0-9_-]+$/g, ''))
    .filter(Boolean);
  const darkToks = toks.filter((t) => t.startsWith('dark:'));
  for (const dt of darkToks) {
    const chain = dt.slice('dark:'.length); // e.g. `bg-indigo-950/50` or `hover:bg-slate-700`
    const variants = chain.split(':');
    const bare = variants.pop();
    const variantPrefix = variants.join(':');
    if (!isColorClass(bare)) {
      skippedDark.add(dt);
      continue;
    }
    // Light partner: a color token with the same prefix + variant chain but not dark.
    const prefix = bare.split('-')[0];
    const lightTok = toks.find(
      (t) =>
        !t.startsWith('dark:') &&
        t.split(':').pop().split('-')[0] === prefix &&
        t.split(':').slice(0, -1).join(':') === variantPrefix &&
        isColorClass(t.split(':').pop()),
    );
    if (!lightTok) {
      skippedDark.add(dt);
      continue;
    }
    const lightBare = lightTok.split(':').pop();
    const varName = varNameForPair(lightBare, bare);
    if (seen.has(varName)) continue;
    const l = resolveClass(lightBare);
    const d = resolveClass(bare);
    if (!l || !d) {
      skippedDark.add(dt);
      continue;
    }
    const applyAlpha = (r) => (r.alpha != null ? withAlpha(r.hex, r.alpha) : r.hex);
    seen.set(varName, { light: applyAlpha(l), dark: applyAlpha(d), pair: `${lightBare} - ${bare}` });
  }
}

if (REPORT) {
  console.log(`Chunks: ${chunks.length}`);
  console.log(`Distinct tokens: ${seen.size}`);
  console.log('\nSkipped dark tokens:');
  console.log([...skippedDark].sort().join('\n'));
  process.exit(0);
}

// 3. Emit tokens file + dark override block.
const tokenLines = [];
const darkLines = [];
for (const [name, { light, dark }] of [...seen.entries()].sort()) {
  tokenLines.push(`  '${name}': '${light}',`);
  darkLines.push(`  ${name}: ${dark};`);
}

const file = `/**
 * Generated by scripts/gen-stylex-tokens.mjs. Do not edit by hand.
 * One token per (light, dark) color pair found in src/**; the light value is
 * the default and \`.dark\` overrides in index.css flip the pair.
 */
import * as stylex from '@stylexjs/stylex';

export const colors = stylex.defineVars({
${tokenLines.join('\n')}
});
`;

writeFile(OUT, file, (err) => {
  if (err) throw err;
  console.log(`Wrote ${OUT} (${seen.size} tokens)`);
  console.log('\n/* dark override block for index.css */\n');
  console.log('html.dark {');
  console.log(darkLines.join('\n'));
  console.log('}');
});