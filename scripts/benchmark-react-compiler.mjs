import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from './lib/screenshot.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const port = 9881;
const apiBaseUrl = `http://localhost:${port}`;

const WORLD_COUNT = 500;
const ITERATIONS = 5;
const WARMUP = 1;
const VIEWPORT = { width: 1280, height: 900 };

const TAGS = ['chill', 'social', 'japanese', 'night', 'cozy', 'nature', 'aurora', 'quiet', 'library', 'festival'];
const PLATFORMS = ['standalonewindows', 'android', 'ios'];
const QUALITIES = ['good', 'bad', null];

function buildWorlds() {
  const worlds = [];
  for (let i = 0; i < WORLD_COUNT; i++) {
    worlds.push({
      worldId: `wrld_bench_${String(i).padStart(4, '0')}`,
      name: `Benchmark World ${i}`,
      authorName: `Author ${i % 40}`,
      capacity: 8 + (i % 60),
      platforms: [PLATFORMS[i % PLATFORMS.length]],
      tags: [TAGS[i % TAGS.length], TAGS[(i + 3) % TAGS.length]],
      imageUrl: '',
      vrchatUrl: `https://vrchat.com/home/world/wrld_bench_${String(i).padStart(4, '0')}`,
      quality: QUALITIES[i % QUALITIES.length],
      createdAt: '2024-01-15T00:00:00.000Z',
      internalAddDate: new Date(Date.now() - (i % 200) * 86_400_000).toISOString().slice(0, 10),
    });
  }
  return worlds;
}

const allWorlds = buildWorlds();

function filterWorlds(url) {
  const u = new URL(url, 'http://x');
  const search = (u.searchParams.get('search') ?? '').trim().toLowerCase();
  const tags = u.searchParams.getAll('tag');
  const qualities = u.searchParams.getAll('quality');
  const platforms = u.searchParams.getAll('platform');
  const minCapacity = Number(u.searchParams.get('minCapacity'));
  const maxCapacity = Number(u.searchParams.get('maxCapacity'));
  const dayRange = Number(u.searchParams.get('dayRange'));

  return allWorlds.filter((w) => {
    if (search) {
      const haystack = `${w.name} ${w.authorName}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (tags.length && !tags.every((t) => w.tags.includes(t))) return false;
    if (qualities.length && (w.quality === null || !qualities.includes(w.quality))) return false;
    if (platforms.length && !platforms.every((p) => w.platforms.includes(p))) return false;
    if (Number.isFinite(minCapacity) && w.capacity < minCapacity) return false;
    if (Number.isFinite(maxCapacity) && w.capacity > maxCapacity) return false;
    if (Number.isFinite(dayRange) && dayRange > 0) {
      const cutoff = Date.now() - dayRange * 86_400_000;
      const added = new Date(w.internalAddDate).getTime();
      if (!Number.isFinite(added) || added < cutoff) return false;
    }
    return true;
  });
}

const config = {
  port,
  apiHandlers: [
    {
      match: (url) => url.startsWith('/api/worlds'),
      respond: (req, res, sendJson) => {
        const u = new URL(req.url, 'http://x');
        const limit = Number(u.searchParams.get('limit') ?? 20);
        const offset = Number(u.searchParams.get('offset') ?? 0);
        const items = filterWorlds(req.url);
        sendJson(res, { total: items.length, limit, offset, worlds: items.slice(offset, offset + limit) });
      },
    },
  ],
  apiMocks: {
    '/api/health': { status: 'ok', worldCount: WORLD_COUNT, dbVersion: 1 },
    '/api/meta': { qualityGood: 167, qualityBad: 166, platformDesktop: 167, platformAndroid: 167, platformiOS: 166 },
    '/api/tags': { tags: TAGS.map((tag) => ({ tag, count: 100 })) },
  },
};

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function summarize(iterations) {
  const keys = Object.keys(iterations[0]);
  const out = {};
  for (const key of keys) {
    const values = iterations.map((it) => it[key]).filter((v) => typeof v === 'number' && Number.isFinite(v));
    out[key] = values.length ? median(values) : null;
  }
  return out;
}

function fmt(ms) {
  if (ms === null || ms === undefined) return 'n/a';
  return `${ms.toFixed(2)}ms`;
}

function pct(a, b) {
  if (a === null || a === undefined || b === null || b === undefined || !b) return 'n/a';
  return `${(((a - b) / b) * 100).toFixed(1)}%`;
}

function build(compilerEnabled) {
  const env = [
    `VITE_REACT_COMPILER=${compilerEnabled ? 'true' : 'false'}`,
    'VITE_BENCHMARK_PROFILER=true',
    `VITE_API_BASE_URL=${apiBaseUrl}`,
    'VITE_ENABLE_COMMUNITY_SENTIMENT=false',
    'VITE_SUPABASE_URL=https://example.supabase.co',
    'VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_dummy',
  ].join(' ');
  execSync(`cross-env ${env} vite build`, { cwd: root, stdio: 'inherit' });
}

async function measureBundle() {
  const assetsDir = path.join(root, 'dist', 'assets');
  const files = await fs.readdir(assetsDir);
  const js = files.filter((f) => f.endsWith('.js'));
  const sizes = {};
  for (const f of js) {
    const stat = await fs.stat(path.join(assetsDir, f));
    sizes[f] = stat.size;
  }
  return sizes;
}

function installProfilerCapture(page) {
  return page.addInitScript(() => {
    window.__benchmarkProfiles = [];
  });
}

async function waitForCards(page, count) {
  await page.waitForFunction(
    (n) => document.querySelectorAll('h3').length >= n,
    count,
    { timeout: 15000 },
  );
}

async function scenarioInitialMount(page) {
  const t0 = performance.now();
  await page.goto(`${apiBaseUrl}/worlds`, { waitUntil: 'domcontentloaded' });
  await waitForCards(page, 8);
  const wall = performance.now() - t0;
  const profiles = await page.evaluate(() => window.__benchmarkProfiles);
  const mount = profiles.filter((p) => p.phase === 'mount');
  return {
    wall,
    actualDuration: mount.reduce((s, p) => s + p.actualDuration, 0),
    baseDuration: mount.reduce((s, p) => s + p.baseDuration, 0),
    commits: mount.length,
  };
}

async function scenarioFilterToggle(page) {
  await page.goto(`${apiBaseUrl}/worlds`, { waitUntil: 'domcontentloaded' });
  await waitForCards(page, 8);
  await page.evaluate(() => { window.__benchmarkProfiles = []; });

  const t0 = performance.now();
  await page.getByRole('button', { name: /filters/i }).click();
  await page.getByRole('button', { name: /chill\s+\(\d+\)/ }).click();
  await page.waitForFunction(
    () => document.body.innerText.includes('Benchmark World 0'),
    { timeout: 15000 },
  );
  const wall = performance.now() - t0;
  const profiles = await page.evaluate(() => window.__benchmarkProfiles);
  return {
    wall,
    actualDuration: profiles.reduce((s, p) => s + p.actualDuration, 0),
    baseDuration: profiles.reduce((s, p) => s + p.baseDuration, 0),
    commits: profiles.length,
  };
}

async function scenarioSearch(page) {
  await page.goto(`${apiBaseUrl}/worlds`, { waitUntil: 'domcontentloaded' });
  await waitForCards(page, 8);
  await page.evaluate(() => { window.__benchmarkProfiles = []; });

  const t0 = performance.now();
  const search = page.getByPlaceholder(/search/i);
  await search.click();
  await search.fill('Benchmark World 42');
  await page.waitForFunction(
    () => document.body.innerText.includes('Benchmark World 42'),
    { timeout: 15000 },
  );
  const wall = performance.now() - t0;
  const profiles = await page.evaluate(() => window.__benchmarkProfiles);
  return {
    wall,
    actualDuration: profiles.reduce((s, p) => s + p.actualDuration, 0),
    baseDuration: profiles.reduce((s, p) => s + p.baseDuration, 0),
    commits: profiles.length,
  };
}

async function scenarioViewSwitch(page) {
  await page.goto(`${apiBaseUrl}/worlds`, { waitUntil: 'domcontentloaded' });
  await waitForCards(page, 8);
  await page.evaluate(() => { window.__benchmarkProfiles = []; });

  const t0 = performance.now();
  await page.getByRole('button', { name: /list view/i }).click();
  await page.waitForFunction(
    () => document.querySelectorAll('button.card').length >= 8,
    { timeout: 15000 },
  );
  const wall = performance.now() - t0;
  const profiles = await page.evaluate(() => window.__benchmarkProfiles);
  return {
    wall,
    actualDuration: profiles.reduce((s, p) => s + p.actualDuration, 0),
    baseDuration: profiles.reduce((s, p) => s + p.baseDuration, 0),
    commits: profiles.length,
  };
}

async function scenarioScroll(page) {
  await page.goto(`${apiBaseUrl}/worlds`, { waitUntil: 'domcontentloaded' });
  await waitForCards(page, 8);
  await page.evaluate(() => { window.__benchmarkProfiles = []; });

  const frameStats = await page.evaluate(async () => {
    return await new Promise((resolve) => {
      const frames = [];
      let last = performance.now();
      let rafId;
      const sample = (now) => {
        frames.push(now - last);
        last = now;
        rafId = requestAnimationFrame(sample);
      };
      rafId = requestAnimationFrame(sample);

      const duration = 2500;
      const start = performance.now();
      const startY = window.scrollY;
      const endY = document.body.scrollHeight - window.innerHeight;
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        window.scrollTo(0, startY + endY * progress);
        if (progress < 1) requestAnimationFrame(step);
        else {
          cancelAnimationFrame(rafId);
          resolve(frames);
        }
      };
      requestAnimationFrame(step);
    });
  });

  const profiles = await page.evaluate(() => window.__benchmarkProfiles);
  const longFrames = frameStats.filter((f) => f > 50).length;
  return {
    frames: frameStats.length,
    longFrames,
    avgFrame: frameStats.reduce((s, f) => s + f, 0) / frameStats.length,
    actualDuration: profiles.reduce((s, p) => s + p.actualDuration, 0),
    commits: profiles.length,
  };
}

async function scenarioPaginationMount(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('sos-worlds-scroll-mode', 'pagination');
  });
  const t0 = performance.now();
  await page.goto(`${apiBaseUrl}/worlds`, { waitUntil: 'domcontentloaded' });
  await waitForCards(page, 8);
  const wall = performance.now() - t0;
  const profiles = await page.evaluate(() => window.__benchmarkProfiles);
  const mount = profiles.filter((p) => p.phase === 'mount');
  return {
    wall,
    actualDuration: mount.reduce((s, p) => s + p.actualDuration, 0),
    baseDuration: mount.reduce((s, p) => s + p.baseDuration, 0),
    commits: mount.length,
  };
}

const SCENARIOS = {
  'initial-mount': scenarioInitialMount,
  'filter-toggle': scenarioFilterToggle,
  'search-typing': scenarioSearch,
  'view-switch': scenarioViewSwitch,
  scroll: scenarioScroll,
  'pagination-mount': scenarioPaginationMount,
};

async function runArm(browser, label) {
  const results = {};
  for (const [name, fn] of Object.entries(SCENARIOS)) {
    const iterations = [];
    for (let i = 0; i < WARMUP + ITERATIONS; i++) {
      const context = await browser.newContext({ viewport: VIEWPORT });
      const page = await context.newPage();
      await installProfilerCapture(page);
      try {
        const result = await fn(page);
        if (i >= WARMUP) iterations.push(result);
      } finally {
        await context.close();
      }
    }
    results[name] = summarize(iterations);
    const wall = results[name].wall === null ? 'n/a' : fmt(results[name].wall);
    const actual = results[name].actualDuration === null ? 'n/a' : fmt(results[name].actualDuration);
    console.log(`  ${label} ${name}: wall=${wall} actual=${actual} commits=${results[name].commits}`);
  }
  return results;
}

function printTable(baseline, compiler) {
  const rows = [];
  for (const name of Object.keys(SCENARIOS)) {
    const b = baseline[name];
    const c = compiler[name];
    rows.push({
      scenario: name,
      'wall (ms)': `${fmt(b.wall)} → ${fmt(c.wall)} (${pct(c.wall, b.wall)})`,
      'actualDuration (ms)': `${fmt(b.actualDuration)} → ${fmt(c.actualDuration)} (${pct(c.actualDuration, b.actualDuration)})`,
      'commits': `${b.commits} → ${c.commits}`,
    });
  }
  console.log('\n=== React Compiler benchmark: baseline vs compiler ===\n');
  console.table(rows);
}

async function main() {
  const branchName = process.env.BRANCH_NAME || 'chore/enable-react-compiler';
  const outDir = path.resolve(root, 'pr-assets', branchName);
  await fs.mkdir(outDir, { recursive: true });

  console.log('=== Building baseline (compiler OFF) ===');
  build(false);
  const baselineBundle = await measureBundle();
  const server1 = createServer(config).listen(port);
  await new Promise((resolve) => server1.once('listening', resolve));

  const browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
  const baseline = await runArm(browser, 'baseline');

  await new Promise((resolve) => server1.close(resolve));
  console.log('=== Building compiler (compiler ON) ===');
  build(true);
  const compilerBundle = await measureBundle();
  const server2 = createServer(config).listen(port);
  await new Promise((resolve) => server2.once('listening', resolve));

  const compiler = await runArm(browser, 'compiler');
  await browser.close();
  await new Promise((resolve) => server2.close(resolve));

  printTable(baseline, compiler);

  const report = {
    branch: branchName,
    generatedAt: new Date().toISOString(),
    worldCount: WORLD_COUNT,
    iterations: ITERATIONS,
    viewport: VIEWPORT,
    baseline,
    compiler,
    bundle: {
      baseline: baselineBundle,
      compiler: compilerBundle,
    },
  };
  const reportPath = path.join(outDir, 'benchmark-react-compiler.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
