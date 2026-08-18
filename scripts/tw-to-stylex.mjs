/**
 * Tailwind class -> StyleX style-object mapper.
 * Turns a className string (with variants like `dark:`, `hover:`, `sm:`) into
 * a StyleX style object: base props at the top, pseudo/at-rule variants as keys
 * (`:hover`, `:focus`, `@media (min-width: 640px)`, `:is(.group:hover *)`).
 *
 * Dark color pairs resolve through theme tokens from src/styles/tokens.stylex.ts
 * (the var flips under `html.dark`), so `bg-slate-200 dark:bg-slate-800` collapses
 * to one `colors['--sos-bg-slate200-slate800']` reference. Standalone colors
 * resolve to palette literals.
 */
import { resolveClass, withAlpha, varNameForPair } from './tw-lib.mjs';

// ---------------------------------------------------------------------------
// Scales
// ---------------------------------------------------------------------------
const SPACING = {
  0: '0', px: '1px', 0.5: '0.125rem', 1: '0.25rem', 1.5: '0.375rem', 2: '0.5rem',
  2.5: '0.625rem', 3: '0.75rem', 3.5: '0.875rem', 4: '1rem', 5: '1.25rem',
  6: '1.5rem', 7: '1.75rem', 8: '2rem', 9: '2.25rem', 10: '2.5rem', 11: '2.75rem',
  12: '3rem', 14: '3.5rem', 16: '4rem', 20: '5rem', 24: '6rem', 28: '7rem',
  32: '8rem', 36: '9rem', 40: '10rem', 44: '11rem', 48: '12rem', 52: '13rem',
  56: '14rem', 60: '15rem', 64: '16rem', 72: '18rem', 80: '20rem', 96: '24rem',
};
const FRACTIONS = { '1/2': '50%', '1/3': '33.3333%', '2/3': '66.6667%', '1/4': '25%', '3/4': '75%', '5/6': '83.3333%' };
const FONT_SIZE = {
  xs: ['0.75rem', '1rem'], sm: ['0.875rem', '1.25rem'], base: ['1rem', '1.5rem'],
  lg: ['1.125rem', '1.75rem'], xl: ['1.25rem', '1.75rem'], '2xl': ['1.5rem', '2rem'],
};
const FONT_WEIGHT = { normal: 400, medium: 500, semibold: 600, bold: 700 };
const LINE_HEIGHT = { none: 1 };
const TRACKING = { tight: '-0.025em', wider: '0.05em' };
const RADIUS = { '': '0.25rem', sm: '0.125rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' };
const SHADOW = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};
const TRANSITION = {
  '': { property: 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter' },
  all: { property: 'all' },
  colors: { property: 'color, background-color, border-color, text-decoration-color, fill, stroke' },
  opacity: { property: 'opacity' },
  shadow: { property: 'box-shadow' },
  transform: { property: 'transform' },
};
const DURATION = { 150: '0.15s', 200: '0.2s', 300: '0.3s' };
const EASE = { out: 'cubic-bezier(0, 0, 0.2, 1)' };
const CURSOR = { default: 'default', pointer: 'pointer', 'not-allowed': 'not-allowed', help: 'help' };
const Z = { 0: 0, 10: 10, 20: 20, 30: 30, 40: 40, 50: 50, '[60]': 60 };
const OPACITY = { 0: 0, 50: 0.5, 70: 0.7, 100: 1 };
const COLOR_PROPS = { bg: 'backgroundColor', text: 'color', border: 'borderColor', decoration: 'textDecorationColor', fill: 'fill' };

const PSEUDO = { hover: ':hover', focus: ':focus', 'focus-visible': ':focus-visible', active: ':active', disabled: ':disabled', 'placeholder': '::placeholder' };
const MEDIA = { sm: '@media (min-width: 640px)', md: '@media (min-width: 768px)', lg: '@media (min-width: 1024px)', xl: '@media (min-width: 1280px)' };

function colorFor(bare) {
  const r = resolveClass(bare);
  if (!r) return null;
  return r.alpha != null ? withAlpha(r.hex, r.alpha) : r.hex;
}

/** Return literal color for `ring-<color>`: force 2px ring unless overridden. */
const RING_COLOR_PREFIX = 'ring';

/**
 * Map a single variant-stripped class to a props object.
 * `pending` is a scratch object for composed values (ring width/color/offset).
 */
function mapBare(bare, pending) {
  const neg = bare.startsWith('-');
  const b = neg ? bare.slice(1) : bare;
  const dash = b.indexOf('-');
  const prefix = dash < 0 ? b : b.slice(0, dash);
  const arg = dash < 0 ? '' : b.slice(dash + 1);
  const num = Number(arg);

  // Colors (bg/text/border/decoration/fill) — only when arg is a real color
  if (COLOR_PROPS[prefix]) {
    const c = colorFor(b);
    if (c !== null) return { [COLOR_PROPS[prefix]]: c };
    // fall through (e.g. plain `border` is width, not a color)
  }

  switch (prefix) {
    case 'p': case 'px': case 'py': case 'pt': case 'pr': case 'pb': case 'pl': {
      const v = SPACING[arg];
      if (v === undefined) return null;
      const map = { p: { padding: v }, px: { paddingLeft: v, paddingRight: v }, py: { paddingTop: v, paddingBottom: v }, pt: { paddingTop: v }, pr: { paddingRight: v }, pb: { paddingBottom: v }, pl: { paddingLeft: v } };
      return map[prefix];
    }
    case 'm': case 'mx': case 'my': case 'mt': case 'mr': case 'mb': case 'ml': {
      let v = arg === 'auto' ? 'auto' : SPACING[arg];
      if (v === undefined) return null;
      if (neg) v = `-${v}`;
      const map = { m: { margin: v }, mx: { marginLeft: v, marginRight: v }, my: { marginTop: v, marginBottom: v }, mt: { marginTop: v }, mr: { marginRight: v }, mb: { marginBottom: v }, ml: { marginLeft: v } };
      return map[prefix];
    }
    case 'w': case 'h': {
      if (arg === 'full') return { [prefix === 'w' ? 'width' : 'height']: '100%' };
      if (arg === 'screen') return { [prefix === 'w' ? 'width' : 'height']: '100vh' };
      if (FRACTIONS[arg]) return { [prefix === 'w' ? 'width' : 'height']: FRACTIONS[arg] };
      if (arg.startsWith('[') && arg.endsWith(']')) return { [prefix === 'w' ? 'width' : 'height']: arg.slice(1, -1) };
      const v = SPACING[arg];
      if (v !== undefined) return { [prefix === 'w' ? 'width' : 'height']: v };
      return null;
    }
    case 'min': case 'max': {
      // min-h-*, min-w-*, max-h-*, max-w-*
      const mh = arg.match(/^h-(.+)$/);
      const mw = arg.match(/^w-(.+)$/);
      const dir = prefix === 'min' ? 'min' : 'max';
      if (mh) {
        const v = mh[1] === 'screen' ? '100vh' : mh[1] === 'full' ? '100%' : mh[1].startsWith('[') ? mh[1].slice(1, -1) : SPACING[mh[1]];
        if (v === undefined) return null;
        return { [`${dir}Height`]: v };
      }
      if (mw) {
        const v = mw[1] === 'screen' ? '100vw' : mw[1] === 'full' ? '100%' : mw[1].startsWith('[') ? mw[1].slice(1, -1) : SPACING[mw[1]];
        if (v === undefined) return null;
        return { [`${dir}Width`]: v };
      }
      if (arg === 'screen' && prefix === 'min') return { minHeight: '100vh' };
      if (arg.startsWith('[') && arg.endsWith(']')) {
        const v = arg.slice(1, -1).replace(/_/g, ' ');
        return prefix === 'min' ? { minWidth: v } : { maxWidth: v };
      }
      if (arg === '0') return prefix === 'min' ? { minWidth: 0 } : null;
      const v = SPACING[arg];
      if (v !== undefined) return prefix === 'min' ? { minHeight: v, minWidth: v } : { maxWidth: v, maxHeight: v };
      return null;
    }
    case 'flex':
      if (b === 'flex') return { display: 'flex' };
      if (b === 'flex-1') return { flex: 1 };
      if (b === 'flex-col') return { flexDirection: 'column' };
      if (b === 'flex-wrap') return { flexWrap: 'wrap' };
      if (b === 'flex-row') return { flexDirection: 'row' };
      if (b === 'grow') return { flexGrow: 1 };
      if (b === 'shrink-0') return { flexShrink: 0 };
      return null;
    case 'grid':
      if (b === 'grid') return { display: 'grid' };
      if (b.startsWith('grid-cols-')) {
        const a = b.slice('grid-cols-'.length);
        if (a.startsWith('[') && a.endsWith(']')) return { gridTemplateColumns: a.slice(1, -1).replace(/_/g, ' ') };
        if (Number(a) > 0) return { gridTemplateColumns: `repeat(${a}, minmax(0, 1fr))` };
      }
      return null;
    case 'gap': {
      const v = SPACING[arg];
      if (v !== undefined) return { gap: v };
      if (arg.startsWith('x-')) { const vv = SPACING[arg.slice(2)]; if (vv !== undefined) return { columnGap: vv }; }
      if (arg.startsWith('y-')) { const vv = SPACING[arg.slice(2)]; if (vv !== undefined) return { rowGap: vv }; }
      return null;
    }
    case 'items': return { alignItems: { start: 'flex-start', center: 'center', end: 'flex-end' }[arg] } ?? null;
    case 'justify': return { justifyContent: { start: 'flex-start', end: 'flex-end', center: 'center', between: 'space-between' }[arg] } ?? null;
    case 'self': return { alignSelf: { start: 'flex-start', end: 'flex-end', center: 'center' }[arg] } ?? null;
    case 'content': return { alignContent: { center: 'center', between: 'space-between' }[arg] } ?? null;
    case 'text': {
      if (arg === 'left' || arg === 'center' || arg === 'right') return { textAlign: arg };
      if (FONT_SIZE[arg]) return { fontSize: FONT_SIZE[arg][0], lineHeight: FONT_SIZE[arg][1] };
      if (arg.startsWith('[') && arg.endsWith(']')) return { fontSize: arg.slice(1, -1) };
      if (arg === 'uppercase') return { textTransform: 'uppercase' };
      return null;
    }
    case 'font': return FONT_WEIGHT[arg] !== undefined ? { fontWeight: FONT_WEIGHT[arg] } : null;
    case 'leading': return LINE_HEIGHT[arg] !== undefined ? { lineHeight: LINE_HEIGHT[arg] } : null;
    case 'tracking': return TRACKING[arg] !== undefined ? { letterSpacing: TRACKING[arg] } : null;
    case 'rounded': return arg in RADIUS ? { borderRadius: RADIUS[arg] } : null;
    case 'border': {
      if (arg === '') return { borderWidth: 1, borderStyle: 'solid' };
      if (arg === '2') return { borderWidth: 2, borderStyle: 'solid' };
      if (arg === 't') return { borderTopWidth: 1, borderStyle: 'solid' };
      if (arg === 'b') return { borderBottomWidth: 1, borderStyle: 'solid' };
      if (arg === 'r') return { borderRightWidth: 1, borderStyle: 'solid' };
      if (arg === 'l') return { borderLeftWidth: 1, borderStyle: 'solid' };
      if (arg === 'dashed') return { borderStyle: 'dashed' };
      return null;
    }
    case 'ring': {
      if (arg === '1' || arg === '2') { pending.ringWidth = Number(arg); return null; }
      if (arg.startsWith('offset-')) { pending.ringOffset = Number(arg.slice('offset-'.length)); return null; }
      const c = colorFor(b);
      if (c !== null) { pending.ringColor = c; return null; }
      return null;
    }
    case 'shadow':
      if (arg === 'none') return { boxShadow: 'none' };
      {
        const v = arg === '' ? SHADOW.DEFAULT : SHADOW[arg];
        if (v) return { boxShadow: v };
      }
      return null;
    case 'opacity': return OPACITY[arg] !== undefined ? { opacity: OPACITY[arg] } : null;
    case 'z': return arg in Z ? { zIndex: Z[arg] } : null;
    case 'cursor': return CURSOR[arg] !== undefined ? { cursor: CURSOR[arg] } : null;
    case 'line':
      if (arg === 'clamp-1') return { display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
      if (arg === 'clamp-2') return { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
      return null;
    case 'top': case 'right': case 'bottom': case 'left': {
      const v = arg === '0' ? '0' : arg === '1/2' ? '50%' : arg === 'full' ? '100%' : SPACING[arg];
      if (v === undefined) return null;
      return { [prefix]: v };
    }
    case 'inset': {
      if (arg === '0') return { top: 0, right: 0, bottom: 0, left: 0 };
      const v = SPACING[arg];
      if (v !== undefined) return { top: v, right: v, bottom: v, left: v };
      if (arg.startsWith('y-0')) return { top: 0, bottom: 0 };
      if (arg.startsWith('x-0')) return { left: 0, right: 0 };
      return null;
    }
    case 'overflow': return { overflow: arg === 'y-auto' ? 'auto' : arg };
    case 'whitespace': return { whiteSpace: { nowrap: 'nowrap', 'pre-wrap': 'pre-wrap' }[arg] } ?? null;
    case 'break': return arg === 'words' ? { overflowWrap: 'break-word' } : arg === 'all' ? { wordBreak: 'break-all' } : null;
    case 'duration': return DURATION[arg] !== undefined ? { transitionDuration: DURATION[arg] } : null;
    case 'ease': return EASE[arg] !== undefined ? { transitionTimingFunction: EASE[arg] } : null;
    case 'transition': return TRANSITION[arg] ? { transitionProperty: TRANSITION[arg].property } : null;
    case 'object': return arg === 'contain' || arg === 'cover' ? { objectFit: arg } : null;
    case 'aspect': return arg === 'square' ? { aspectRatio: '1 / 1' } : null;
    case 'pointer': return arg === 'events-none' ? { pointerEvents: 'none' } : null;
    case 'touch': return arg === 'none' ? { touchAction: 'none' } : null;
    case 'select': return arg === 'none' ? { userSelect: 'none' } : null;
    case 'resize': return arg === 'none' ? { resize: 'none' } : arg === '' ? { resize: 'both' } : null;
    case 'backdrop': return arg === 'blur' ? { backdropFilter: 'blur(8px)' } : arg === 'blur-sm' ? { backdropFilter: 'blur(4px)' } : null;
    case 'underline': return arg === '' ? { textDecorationLine: 'underline' } : null;
    case 'animate':
      if (arg === 'pulse') return { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' };
      if (arg === 'spin') return { animation: 'spin 1s linear infinite' };
      if (arg === 'shimmer' || arg === '[shimmer_1.5s_infinite]') return { animation: 'shimmer 1.5s infinite' };
      return null;
    case 'col': return arg === 'span-2' ? { gridColumn: 'span 2 / span 2' } : null;
    case 'translate': {
      const m = arg.match(/^([xy])-(\S+)$/);
      if (!m) return null;
      const [, axis, val] = m;
      const t = val === '1/2' ? '50%' : val === 'full' ? '100%' : val.startsWith('[') ? val.slice(1, -1) : SPACING[val];
      if (t === undefined) return null;
      if (neg) return axis === 'x' ? { transform: `translateX(-${t})` } : { transform: `translateY(-${t})` };
      return axis === 'x' ? { transform: `translateX(${t})` } : { transform: `translateY(${t})` };
    }
    case 'scale': return arg === '110' ? { transform: 'scale(1.1)' } : null;
    case 'brightness': return arg === '110' ? { filter: 'brightness(1.1)' } : null;
    case 'tabular': return arg === 'nums' ? { fontVariantNumeric: 'tabular-nums' } : null;
    case 'truncate': return arg === '' ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : null;
    case 'sr': return arg === 'only' ? { position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 } : null;
    case 'align': return arg === 'middle' ? { verticalAlign: 'middle' } : null;
    case 'inline': return b === 'inline-flex' ? { display: 'inline-flex' } : b === 'inline-block' ? { display: 'inline-block' } : null;
    case 'block': return arg === '' ? { display: 'block' } : null;
    case 'grid': return null;
    case 'hidden': return { display: 'none' };
    case 'fixed': return { position: 'fixed' };
    case 'absolute': return { position: 'absolute' };
    case 'relative': return { position: 'relative' };
    case 'sticky': return { position: 'sticky' };
    case 'contents': return { display: 'contents' };
    case 'not': return arg === 'sr-only' ? null : null; // handled via sr-only combo; ignore
    case 'antialiased': return { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' };
  }
  return null;
}

/**
 * Convert a className chunk into a StyleX style object.
 * `knownVars` is a Set of theme-var names generated in tokens.stylex.ts.
 * Dark color pairs become `{ __stylexVar: '--sos-...' }` markers so the
 * serializer can emit a `colors['--sos-...']` reference (compiles to var());
 * standalone colors stay literal. Pairs not in knownVars fall back to the
 * light literal (safe degradation for pre-token colors).
 */
export function chunkToStyles(chunk, knownVars) {
  const toks = chunk.split(/\s+/).filter(Boolean);
  const base = {};
  const variants = {}; // pseudo/@media key -> props

  // dark tokens by (prefix|variantChain) for pairing with light partners
  const darkByKey = new Map();
  for (const t of toks) {
    if (!t.startsWith('dark:')) continue;
    const parts = t.slice(5).split(':');
    const bare = parts.pop();
    const vp = parts.join(':');
    const p = bare.startsWith('-') ? bare.slice(1).split('-')[0] : bare.split('-')[0];
    darkByKey.set(`${p}|${vp}`, bare);
  }

  // space-* collects margin for sibling selector
  let space = null;
  const ringAcc = {}; // variantKey -> { width, color, offset }
  const ringTarget = (vp) => ringAcc[vp] ?? (ringAcc[vp] = {});

  const place = (variantKey, props) => {
    if (!props) return;
    if (variantKey === '') Object.assign(base, props);
    else Object.assign(variants[variantKey] ?? (variants[variantKey] = {}), props);
  };

  for (const t of toks) {
    if (t.startsWith('dark:')) continue;
    const parts = t.split(':');
    const bare = parts.pop();
    const vp = parts.join(':');

    const pending = {};
    let props = mapBare(bare, pending);

    // dark color substitution
    if (knownVars) {
      const p = bare.startsWith('-') ? bare.slice(1).split('-')[0] : bare.split('-')[0];
      const darkBare = darkByKey.get(`${p}|${vp}`);
      if (darkBare && COLOR_PROPS[p] && props && props[COLOR_PROPS[p]]) {
        const varName = varNameForPair(bare, darkBare);
        if (knownVars.has(varName)) props[COLOR_PROPS[p]] = { __stylexVar: varName };
      }
      if (pending.ringColor) {
        const darkBare = darkByKey.get(`${RING_COLOR_PREFIX}|${vp}`);
        if (darkBare) {
          const vn = varNameForPair(bare, darkBare);
          if (knownVars.has(vn)) pending.ringColor = { __stylexVar: vn };
        }
      }
    }

    // accumulate ring state per variant; emit boxShadow after loop
    if (pending.ringWidth != null || pending.ringColor || pending.ringOffset != null) {
      const acc = ringTarget(vp);
      if (pending.ringWidth != null) acc.width = pending.ringWidth;
      if (pending.ringOffset != null) acc.offset = pending.ringOffset;
      if (pending.ringColor) acc.color = pending.ringColor;
      continue;
    }

    if (pending.space) { space = { axis: pending.space.axis, value: pending.space.value }; continue; }

    // variant routing
    if (vp === '') place('', props);
    else if (PSEUDO[vp]) place(PSEUDO[vp], props);
    else if (MEDIA[vp]) place(MEDIA[vp], props);
    else if (vp === 'group-hover') place(':is(.group:hover *)', props);
    else if (vp === 'not-sr-only') place('', { position: 'static', width: 'auto', height: 'auto', margin: 0, padding: 0, overflow: 'visible', clip: 'auto', whiteSpace: 'normal' });
    else place('', props); // unknown: apply to base
  }

  // emit ring boxShadows after accumulation
  for (const [vp, acc] of Object.entries(ringAcc)) {
    const w = acc.width ?? 1;
    const off = acc.offset ?? 0;
    let color = acc.color ?? 'rgb(59 130 246 / 0.5)';
    if (color && typeof color === 'object' && color.__stylexVar) {
      color = `var(--sos-${color.__stylexVar.slice('--sos-'.length)})`;
    }
    const shadow = `0 0 0 ${off}px #fff, 0 0 0 ${off + w}px ${color}`;
    place(vp === '' ? '' : PSEUDO[vp] || MEDIA[vp] || (vp === 'group-hover' ? ':is(.group:hover *)' : vp), { boxShadow: shadow });
  }

  // space-* -> sibling selector
  if (space) {
    const marginKey = space.axis === 'x' ? 'marginLeft' : 'marginTop';
    variants['> :not(:first-child)'] = { [marginKey]: space.value };
  }

  return Object.keys(base).length || Object.keys(variants).length ? { ...base, ...variants } : null;
}