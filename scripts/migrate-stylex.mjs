#!/usr/bin/env node
/**
 * Codemod: rewrite static `className="..."` attributes to StyleX `style={...}`.
 *
 * For each file it:
 *   - finds every static string className,
 *   - converts each distinct class string to a StyleX style object (chunkToStyles),
 *   - emits `const styles = stylex.create({...})` and rewrites the attribute,
 *   - injects the stylex + colors imports.
 *
 * Compound classes (card/input/btn*) resolve against the shared styles module
 * src/styles/shared.ts instead of the utility mapper.
 *
 * Usage: node scripts/migrate-stylex.mjs [files...]  (defaults to all src/**)
 *   --check : report only, no writes.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { chunkToStyles } from './tw-to-stylex.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CHECK = process.argv.includes('--check');


const SHARED_CLASSES = new Set(['card', 'input', 'btn', 'btn-primary', 'btn-secondary', 'btn-ghost']);
const SHARED_KEYS = { card: 'card', input: 'input', btn: 'btn', 'btn-primary': 'btnPrimary', 'btn-secondary': 'btnSecondary', 'btn-ghost': 'btnGhost' };
const PLAIN_CSS = new Set(['group', 'sr-only', 'not-sr-only']); // kept as className (plain CSS / group hook)

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.tsx$/.test(e) && !/\.test\./.test(e)) out.push(p);
  }
  return out;
}

function pathToImport(filePath) {
  // import path for stylex and shared relative to file
  const rel = resolve(filePath).replace(ROOT + '/', '').replace(/\/[^/]+$/, '');
  const depth = rel.split('/').length;
  const up = depth === 1 ? './' : '../'.repeat(depth - 1);
  return up;
}

function importPaths(filePath) {
  const p = pathToImport(filePath);
  return {
    stylex: `${p}styles/node_modules/@stylexjs/stylex`.includes('node_modules') ? '@stylexjs/stylex' : null,
  };
}

// Full parse of className occurrences with absolute offsets.
function findClassNames(code) {
  const out = [];
  const balanced = (start, o, c) => { let d = 0; for (let i = start; i < code.length; i++) { if (code[i] === o) d++; else if (code[i] === c) { d--; if (d === 0) return i; } } return -1; };
  const skipStr = (i) => { const q = code[i]; for (let j = i + 1; j < code.length; j++) { if (code[j] === '\\') { j++; continue; } if (code[j] === q) return j; } return -1; };
  for (let i = 0; i < code.length; i++) {
    const m = /className=\s*/.exec(code.slice(i));
    if (!m) break;
    const attrStart = i + m.index; // position of `className`
    const valueStart = attrStart + m[0].length;
    let valueEnd;
    let kind;
    const ch = code[valueStart];
    if (ch === '{') { kind = 'expr'; valueEnd = balanced(valueStart, '{', '}') + 1; }
    else if (ch === '"' || ch === "'") { kind = 'static'; valueEnd = skipStr(valueStart) + 1; }
    else if (ch === '`') { kind = 'template'; valueEnd = skipStr(valueStart) + 1; }
    else { i += m.index + m[0].length; continue; }
    if (valueEnd < 1) break;
    out.push({ start: attrStart, end: valueEnd, kind, value: code.slice(valueStart, valueEnd) });
    i = valueEnd;
  }
  return out;
}

function hashName(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return 'c' + (h >>> 0).toString(36);
}

/** Serialize a StyleX object, turning { __stylexVar } into colors['...'] refs. */
function serializeStyle(obj, indent = 2) {
  const pad = ' '.repeat(indent);
  const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (v && typeof v === 'object' && v.__stylexVar) {
      lines.push(`${pad}${JSON.stringify(k)}: colors[${JSON.stringify(v.__stylexVar)}],`);
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      lines.push(`${pad}${JSON.stringify(k)}: {`);
      lines.push(serializeStyle(v, indent + 2).trimEnd());
      lines.push(`${pad}},`);
    } else {
      lines.push(`${pad}${JSON.stringify(k)}: ${JSON.stringify(v)},`);
    }
  }
  return lines.join('\n') + '\n';
}

const COLOR_NAMES = new Set([
  'amber', 'blue', 'cyan', 'emerald', 'fuchsia', 'green', 'indigo', 'lime', 'orange',
  'pink', 'purple', 'red', 'rose', 'sky', 'slate', 'teal', 'violet', 'yellow', 'white', 'black', 'gray',
]);

function processFile(filePath) {
  const code = readFileSync(filePath, 'utf8');
  const attrs = findClassNames(code);
  const staticAttrs = attrs.filter((a) => a.kind === 'static');
  if (!staticAttrs.length) return null;

  // Load known theme vars for dark substitution.
  const knownVars = new Set();
  const tokenSrc = readFileSync(join(ROOT, 'src/styles/tokens.stylex.ts'), 'utf8');
  for (const m of tokenSrc.matchAll(/\s'([^']+)':\s'([^']+)',/g)) knownVars.add(m[1]);

  const styleEntries = new Map(); // classString -> { key, style, refs }
  const refs = new Map(); // className -> stylex.props(...) text

  for (const a of staticAttrs) {
    const cls = a.value.slice(1, -1); // strip quotes
    const toks = cls.split(/\s+/).filter(Boolean);
    if (!toks.length) continue;

    // Pure shared + plain classes -> direct ref, no stylex.create entry
    const sharedRefs = toks.filter((t) => SHARED_CLASSES.has(t)).map((t) => `shared.${SHARED_KEYS[t]}`);
    const plainCss = toks.filter((t) => PLAIN_CSS.has(t));
    const utilToks = toks.filter((t) => !SHARED_CLASSES.has(t) && !PLAIN_CSS.has(t) && t !== 'group');
    const groupRef = toks.includes('group');

    if (!utilToks.length) {
      // Only shared/plain: emit className={stylex.props(shared.x).className}
      // and keep plain CSS classes (group/sr-only) in className.
      const styleRefs = [...sharedRefs];
      if (!styleRefs.length && !plainCss.length) continue;
      a.replacement = styleRefs.length
        ? `className={stylex.props(${styleRefs.join(', ')}).className}`
        : '';
      const extraCls = [...plainCss, groupRef ? 'group' : null].filter(Boolean).join(' ');
      a.classNameKeep = extraCls;
      continue;
    }

    // Utility classes: create stylex entry
    const obj = chunkToStyles(utilToks.join(' '), knownVars);
    if (!obj) continue;
    const key = hashName(cls);
    if (!styleEntries.has(key)) {
      styleEntries.set(key, { key, classString: cls, style: obj });
    }
    const styleRef = `styles.${key}`;
    const refsList = [...sharedRefs, styleRef];
    // className={stylex.props(...).className} works on native elements AND
    // components whose `style` prop is tightly typed (Radix, ListIcon).
    a.replacement = `className={stylex.props(${refsList.join(', ')}).className}`;
    const extraCls = [...plainCss.filter((c) => c !== 'group'), groupRef && !plainCss.includes('group') ? 'group' : null].filter(Boolean).join(' ');
    a.classNameKeep = extraCls;
  }

  // Build rewritten code (right to left): replace each `className="..."` span
  // with the new attributes. If both a kept plain class and a stylex class are
  // needed, merge them into a single className expression.
  let out = code;
  const edits = attrs.filter((a) => a.replacement && a.kind === 'static');
  for (const a of [...edits].sort((x, y) => y.start - x.start)) {
    let newAttr;
    if (a.classNameKeep && a.replacement.includes('className=')) {
      // merge: className={`${kept} ${stylex.props(...).className}`}
      const inner = a.replacement.match(/stylex\.props\(([^)]*)\)\.className/);
      newAttr = ` className={\`${a.classNameKeep} \${stylex.props(${inner ? inner[1] : ''}).className}\`}`;
    } else {
      const classNamePart = a.classNameKeep ? ` className="${a.classNameKeep}"` : '';
      newAttr = `${classNamePart} ${a.replacement}`.trim();
    }
    out = out.slice(0, a.start) + newAttr + out.slice(a.end);
  }

  // Inject imports + styles block.
  const hasShared = [...edits].some((a) => a.replacement.includes('shared.'));
  const hasStyles = styleEntries.size > 0;
  const usesColors = [...styleEntries.values()].some((e) => JSON.stringify(e.style).includes('__stylexVar'));
  const rel = resolve(filePath).replace(ROOT + '/', '');
  const dir = rel.split('/').slice(0, -1).join('/');
  const depth = dir ? dir.split('/').length : 0;
  const up = depth > 1 ? '../'.repeat(depth - 1) : './';

  const importBlock = [];
  if (hasStyles) {
    importBlock.push(`import * as stylex from '@stylexjs/stylex';`);
    if (usesColors) importBlock.push(`import { colors } from '${up}styles/tokens.stylex';`);
  }
  if (hasShared) importBlock.push(`import { shared } from '${up}styles/shared';`);
  if (importBlock.length) {
    // Insert after the last complete import statement (handles multi-line imports).
    const lines = out.split('\n');
    let lastImportEnd = -1;
    let braceDepth = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*import\s/.test(line) || braceDepth > 0) {
        for (const ch of line) {
          if (ch === '{') braceDepth++;
          else if (ch === '}') braceDepth--;
        }
        if (braceDepth === 0 && /;\s*$/.test(line)) lastImportEnd = i;
      }
    }
    if (lastImportEnd < 0) {
      // No import found; prepend.
      lines.unshift(...importBlock, '');
    } else {
      lines.splice(lastImportEnd + 1, 0, ...importBlock);
    }
    out = lines.join('\n');
  }

  if (hasStyles) {
    const block = `\n\nconst styles = stylex.create({\n${[...styleEntries.values()]
      .map((e) => `  ${e.key}: {\n${serializeStyle(e.style, 4).trimEnd()}\n  },`)
      .join('\n')}\n});\n`;
    out = out.trimEnd() + block;
  }

  return out;
}

const targets = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const files = targets.length ? targets.filter((f) => /\.tsx$/.test(f)) : walk(join(ROOT, 'src'));

let changed = 0;
for (const f of files) {
  const abs = f.startsWith(ROOT) ? f : join(ROOT, f);
  const result = processFile(abs);
  if (!result) continue;
  changed++;
  if (CHECK) {
    console.log(`would rewrite: ${abs.replace(ROOT + '/', '')}`);
  } else {
    writeFileSync(abs, result);
    console.log(`rewrote: ${abs.replace(ROOT + '/', '')}`);
  }
}
console.log(changed ? `\n${changed} files processed.` : 'no static className found.');