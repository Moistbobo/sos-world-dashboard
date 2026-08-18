# StyleX Conversion Conventions (read carefully)

We are migrating this Vite+React+TS app from Tailwind CSS to StyleX.
Read this whole file before editing anything. The goal for your assigned file
is ZERO remaining Tailwind utility class names inside `className=` attributes,
while keeping the rendered pixels identical.

## Toolchain / commands
- Entire repo is `pnpm`. Do NOT hand-run `tsc`/`vite build` for my whole batch;
  the orchestrator does a global `npx tsc --noEmit` + `pnpm exec vite build` + `pnpm test` at the end.
- You MAY run `npx tsc --noEmit` to typecheck just your changes, but it checks the whole project,
  so pre-existing errors from files NOT yours may appear — ignore those, only care about ones in YOUR file.

## The core pattern (memorize)
A Tailwind className string becomes a StyleX style registered in a single
`const styles = stylex.create({...})` at the BOTTOM of the file, applied via:

```tsx
<div className={stylex.props(styles.someName).className} />
```

For a MIX of base utility classes and conditional classes you replace the whole
`className={...}` expression with ONE stylex.props call that lists all styles
(conditionals as `cond && styles.x` or ternaries):

```tsx
// before
<div className={`flex h-14 items-center px-4 ${collapsed ? 'lg:justify-center' : 'justify-between'}`}>
// after
<div className={stylex.props(styles.header, collapsed ? styles.center : styles.between).className}>
```

Multiple unconditional classes: `stylex.props(styles.card, styles.hoverable).className`
In jsdom the `.className` string is a space-joined list of hashed classes; assertions in
tests must switch from Tailwind names to `getComputedStyle`.

## Imports to add (only if the file uses them)
```tsx
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex'; // adjust ../ count for depth
import { shared } from '../../styles/shared';        // only if using shared.card/input/btn*
```
- Relative depth: from `src/components/x/Y.tsx` -> `../../styles/`; from `src/pages/x/Y.tsx` -> `../../styles/`;
  from `src/utils/x.tsx` -> `../styles/`. Count `../` so it resolves: file dir -> `src/styles/`.

## Theme / dark mode
- Dark color pairs are ALREADY generated as tokens. Use `colors['--sos-...']` ONLY where the
  original class had a `dark:` variant, e.g. `text-slate-700 dark:text-slate-200` =>
  `color: colors['--sos-text-slate-700-slate-200']`. The token maps to a CSS var that flips
  automatically under `.dark`; you do NOT write `dark:` anywhere.
- If a class has NO `dark:` partner, use the literal palette color, e.g. `color: '#64748b'`
  (slate-500), `backgroundColor: '#6366f1'` (indigo-500).
- Available pairs (tokenName: key) — use ONLY these exact names. To find the right one for
  `LIGHT dark:DARK`, the name is `--sos-<prefix>-<lightWithoutPrefix>-<darkWithoutPrefix>`
  with `/` -> `_` and spaces dropped, e.g. `bg-slate-200 dark:bg-slate-800` ->
  `--sos-bg-slate-200-slate-800`. If unsure a token exists, prefer the literal light value
  (safe degradation) — dark-only drift is acceptable for now.

## Compound classes (do NOT inline these; reference shared)
- `card` -> `shared.card`
- `input` -> `shared.input`
- `btn` -> `shared.btn`
- `btn-primary` -> `shared.btnPrimary`
- `btn-secondary` -> `shared.btnSecondary`
- `btn-ghost` -> `shared.btnGhost`
Usage: `className={stylex.props(shared.btn, shared.btnSecondary, styles.x).className}`

## Classes that STAY as literal strings (plain CSS kept in index.css, NOT Tailwind utilities)
These must remain as ordinary className strings; do NOT convert them to StyleX:
- `group` (parent marker for group-hover)
- `sr-only`, `not-sr-only`
- `animate-shimmer` (keep as `animate-shimmer` class)
- `space-x-*`, `space-y-*` (e.g. `space-y-3`) — KEEP as literal class strings.

## gradient shimmer
`bg-[linear-gradient(100deg,transparent_20%,rgba(100,116,139,0.55)_50%,transparent_80%)]`
`dark:bg-[linear-gradient(100deg,transparent_20%,rgba(255,255,255,0.12)_50%,transparent_80%)]`
Replace with:
```tsx
backgroundColor: 'transparent',
backgroundImage: 'linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.12) 50%, transparent 80%)',
```
(light stays as the rgba(100,116,139,.55) gradient; dark as the white one via a `.dark` override
if feasible — otherwise use the light gradient; progression acceptable.)

## How to convert a Tailwind class -> StyleX property (cheatsheet)
- `flex` -> `display:'flex'`, `flex-col` -> `flexDirection:'column'`, `flex-wrap` -> `flexWrap:'wrap'`,
  `flex-1` -> `flex:1`, `inline-flex` -> `display:'inline-flex'`, `block` -> `display:'block'`,
  `grid` -> `display:'grid'`, `hidden` -> `display:'none'`
- `items-center` -> `alignItems:'center'`; `justify-center` -> `justifyContent:'center'`;
  `justify-between` -> `justifyContent:'space-between'`; `items-start`->`alignItems:'flex-start'`
- `w-4`->`width:'1rem'`, `h-4`->`height:'1rem'`, `w-8`->`width:'2rem'`, `h-8`->`height:'2rem'`,
  `h-11`->`height:'2.75rem'`, `h-14`->`height:'3.5rem'`, `w-full`->`width:'100%'`, `h-full`->`height:'100%'`
  (spacing scale: 0.5=.125rem,1=.25,1.5=.375,2=.5,2.5=.625,3=.75,3.5=.875,4=1rem,5=1.25,6=1.5,7=1.75,8=2,9=2.25,10=2.5,11=2.75,12=3,14=3.5,16=4,20=5,24=6,etc)
- `gap-2`->`gap:'0.5rem'`, `gap-3`->`gap:'0.75rem'`
- `p-4`->`padding:'1rem'`, `px-4`->`paddingLeft:'1rem',paddingRight:'1rem'`,
  `py-2`->`paddingTop:'0.5rem',paddingBottom:'0.5rem'`, `pl-2`->`paddingLeft:'0.5rem'`, `pr-2`->`paddingRight:'0.5rem'`
- `mt-2`->`marginTop:'0.5rem'`, `mb-2`->`marginBottom:'0.5rem'`, `ml-auto`->`marginLeft:'auto'`
- `rounded`->`borderRadius:'0.25rem'`, `rounded-md`->'.375rem', `rounded-lg`->'.5rem', `rounded-xl`->'.75rem', `rounded-full`->'9999px'
- `text-xs`->`fontSize:'0.75rem',lineHeight:'1rem'`, `text-sm`->`fontSize:'0.875rem',lineHeight:'1.25rem'`,
  `text-base`->`fontSize:'1rem',lineHeight:'1.5rem'`, `text-lg`->`fontSize:'1.125rem',lineHeight:'1.75rem'`,
  `text-xl`->`fontSize:'1.25rem',lineHeight:'1.75rem'`, `text-2xl`->`fontSize:'1.5rem',lineHeight:'2rem'`,
  `text-[10px]`->`fontSize:'10px'`, `text-[11px]`->`fontSize:'11px'`
- `font-normal`->`fontWeight:400`, `font-medium`->`fontWeight:500`, `font-semibold`->`fontWeight:600`, `font-bold`->`fontWeight:700`
- `text-center`->`textAlign:'center'`, `text-left`->`textAlign:'left'`, `text-right`->`textAlign:'right'`, `uppercase`->`textTransform:'uppercase'`
- `relative`->`position:'relative'`, `absolute`->`position:'absolute'`, `fixed`->`position:'fixed'`, `sticky`->`position:'sticky'`
- `inset-0`->`top:0,right:0,bottom:0,left:0`; `top-2`->`top:'0.5rem'`; `left-1/2`->`left:'50%'`; `-translate-x-1/2`->`transform:'translateX(-50%)'`; `-translate-y-1/2`->`transform:'translateY(-50%)'`
- `pointer-events-none`->`pointerEvents:'none'`; `cursor-pointer`->`cursor:'pointer'`; `cursor-not-allowed`->`cursor:'not-allowed'`
- `truncate`->`overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'`
- `overflow-hidden`->`overflow:'hidden'`; `overflow-y-auto`->`overflowY:'auto'`; `overflow-auto`->`overflow:'auto'`
- `whitespace-nowrap`->`whiteSpace:'nowrap'`; `whitespace-pre-wrap`->`whiteSpace:'pre-wrap'`; `break-words`->`overflowWrap:'break-word'`
- `border`->`borderWidth:1,borderStyle:'solid'`; `border-2`->`borderWidth:2,borderStyle:'solid'`; `border-t`->`borderTopWidth:1,borderStyle:'solid'`; `border-b`->`borderBottomWidth:1,borderStyle:'solid'`
- `border-slate-200`(no dark) -> `borderColor:'#e2e8f0'`; `border-slate-300`->'#cbd5e1'; `border-white`->'#ffffff'
- `text-slate-400`->'#94a3b8', `text-slate-500`->'#64748b', `text-slate-600`->'#475569', `text-slate-700`->'#334155', `text-slate-800`->'#1e293b', `text-slate-900`->'#0f172a', `text-white`->'#ffffff', `text-indigo-600`->'#4f46e5', `text-red-500`->'#ef4444', `text-red-600`->'#dc2626', `text-emerald-600`->'#059669', `text-rose-600`->'#e11d48', `text-amber-700`->'#b45309', `text-green-700`->'#15803d'
- `bg-white`->`backgroundColor:'#ffffff'`, `bg-slate-100`->'#f1f5f9', `bg-slate-200`->'#e2e8f0', `bg-slate-300`->'#cbd5e1', `bg-slate-50`->'#f8fafc', `bg-slate-900`->'#0f172a', `bg-indigo-500`->'#6366f1', `bg-indigo-600`->'#4f46e5', `bg-transparent`->'transparent'
- `transition`->`transitionProperty:'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter',transitionDuration:'0.15s',transitionTimingFunction:'cubic-bezier(0.4,0,0.2,1)'`
- `transition-colors`->`transitionProperty:'color, background-color, border-color, text-decoration-color, fill, stroke',transitionDuration:'0.15s',transitionTimingFunction:'cubic-bezier(0.4,0,0.2,1)'`
- `transition-opacity`->`transitionProperty:'opacity',...`
- `duration-200`->`transitionDuration:'0.2s'`
- `opacity-0`->`opacity:0`, `opacity-50`->`opacity:0.5`, `opacity-100`->`opacity:1`
- `z-10`->`zIndex:10`, etc. `z-[60]`->`zIndex:60`
- `shadow-sm`->`boxShadow:'0 1px 2px 0 rgb(0 0 0 / 0.05)'`; `shadow`->`boxShadow:'0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'`; `shadow-md`->`boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'`; `shadow-lg`->`boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'`
- `ring-1`->`boxShadow:'0 0 0 1px rgb(0 0 0 / 0.05)'`; `ring-2`->`boxShadow:'0 0 0 2px var(--ring-color, rgb(99 102 241 / 0.5))'`; a `ring-<color>` plus `ring-2` combine to `boxShadow:'0 0 0 2px <color>'`; `ring-offset-2` adds `0 0 0 2px #fff`
- `animate-pulse`->`animation:'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite'`; `animate-spin`->`animation:'spin 1s linear infinite'`
- `line-clamp-1`->`display:'-webkit-box',WebkitLineClamp:1,WebkitBoxOrient:'vertical',overflow:'hidden'`; `line-clamp-2`-> same with 2
- `grow`->`flexGrow:1`; `shrink-0`->`flexShrink:0`
- `select-none`->`userSelect:'none'`; `touch-none`->`touchAction:'none'`
- `antialiased`->`WebkitFontSmoothing:'antialiased',MozOsxFontSmoothing:'grayscale'`
- `underline`->`textDecorationLine:'underline'`; `decoration-dotted`->`textDecorationStyle:'dotted'`; `underline-offset-4`->`textUnderlineOffset:'4px'`
- `tabular-nums`->`fontVariantNumeric:'tabular-nums'`
- `align-middle`->`verticalAlign:'middle'`; `object-contain`->`objectFit:'contain'`; `object-cover`->`objectFit:'cover'`

## Pseudo variants (hover/focus/etc.)
Inside a style object, use nested pseudo keys, e.g.:
```tsx
{
  color: colors['--sos-text-slate-600-slate-300'],
  ':hover': { color: colors['--sos-text-indigo-600-indigo-400'], backgroundColor: '#e2e8f0' },
  ':focus-visible': { boxShadow: '0 0 0 2px #6366f1', outline: 'none' },
  ':disabled': { opacity: 0.5, cursor: 'not-allowed' },
}
```
group-hover on a child: `':is(.group:hover *)': { transform: 'scale(1.1)', opacity: 1 }`
media: `'@media (min-width: 640px)': { ... }`, `(min-width: 1024px)`, `(min-width: 1280px)`.

## Rules for `stylex.create` at file bottom
- One `const styles = stylex.create({ name: {...}, name2: {...} })` at BOTTOM after all component code.
- Only include styles actually used. Delete unused ones.
- Object keys go in the same order as you read classes (nice for review); it's not required.

## Verified: this compiles and passes `tsc`. Match these EXACTLY.
- After editing, the file must parse. If you hit a `tsc` error IN YOUR FILE, fix it.
- Do not leave `className="..."` with Tailwind utility classes. Pure custom/handwritten classes
  like `data-testid`, or className strings that are only `group`/`sr-only`/`space-y-3`/`animate-shimmer`
  are fine to keep.
- Keep existing attribute order and JSX structure otherwise identical.

## What to return
Report back: the file(s) you edited, and a list of any className you could NOT convert
(should be empty ideally), plus any token you had to fall back to a literal for.
