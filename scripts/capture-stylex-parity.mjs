import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { chromium } from 'playwright';
import { createServer } from './lib/screenshot.mjs';
import { seedLegacyLists } from './lib/lists-seed.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const branchName = process.env.BRANCH_NAME || 'stylex-parity';
const mode = process.argv[2] ?? 'capture'; // 'capture' | 'compare'
const baselineDir = path.resolve(__dirname, '../pr-assets/stylex-baseline');
const afterDir = path.resolve(__dirname, '../pr-assets', branchName, 'stylex-after');

const PORT = 9880;
const API_BASE_URL = `http://localhost:${PORT}`;

const mockHealth = { status: 'ok', worldCount: 7015, dbVersion: 1 };
const mockMeta = {
  qualityGood: 128,
  qualityBad: 12,
  platformDesktop: 340,
  platformAndroid: 95,
  platformiOS: 0,
};
const mockTags = {
  tags: [
    { tag: 'kino', count: 420 },
    { tag: 'chill', count: 380 },
    { tag: 'comfy', count: 310 },
    { tag: 'adventure', count: 250 },
    { tag: 'horror', count: 180 },
    { tag: 'game', count: 160 },
    { tag: 'gallery', count: 140 },
    { tag: 'meme', count: 120 },
    { tag: 'puzzle', count: 95 },
    { tag: 'driving', count: 80 },
    { tag: 'tech', count: 70 },
    { tag: 'nature', count: 55 },
    { tag: 'gamerip', count: 40 },
    { tag: 'portal', count: 30 },
    { tag: 'quest', count: 25 },
    { tag: 'pc', count: 20 },
    { tag: 'nsfw', count: 15 },
    { tag: 'relaxing', count: 10 },
    { tag: 'social', count: 8 },
    { tag: 'music', count: 5 },
    { tag: 'avatar', count: 2 },
  ],
};

const WORLD_IDS = [
  'wrld_demo_0000-0000-0000-000000000001',
  'wrld_demo_0000-0000-0000-000000000002',
  'wrld_demo_0000-0000-0000-000000000003',
  'wrld_demo_0000-0000-0000-000000000004',
  'wrld_demo_0000-0000-0000-000000000005',
  'wrld_demo_0000-0000-0000-000000000006',
];

function makeWorld(i, tags, quality = 'good') {
  return {
    worldId: WORLD_IDS[i],
    name: `Mock World ${i + 1}`,
    authorName: 'SOSContributor',
    capacity: 24,
    platforms: ['standalonewindows', 'android'],
    tags,
    imageUrl: `https://placehold.co/1200x600/6366f1/ffffff?text=World+${i + 1}`,
    vrchatUrl: `https://vrchat.com/home/world/${WORLD_IDS[i]}`,
    quality,
    createdAt: '2024-01-15T00:00:00.000Z',
    internalAddDate: '2024-06-01T00:00:00.000Z',
  };
}

const allWorlds = [
  makeWorld(0, ['kino', 'chill', 'social', 'night']),
  makeWorld(1, ['driving', 'tech', 'pc'], 'bad'),
  makeWorld(2, ['comfy', 'nature', 'relaxing']),
  makeWorld(3, ['horror', 'game', 'quest'], 'bad'),
  makeWorld(4, ['puzzle', 'gallery', 'pc']),
  makeWorld(5, ['meme', 'social', 'avatar']),
];

const apiHandlers = Object.entries({
  '/api/health': mockHealth,
  '/api/meta': mockMeta,
  '/api/tags': mockTags,
  '/api/worlds': { worlds: allWorlds, total: allWorlds.length, limit: 20, offset: 0 },
}).map(([prefix, data]) => ({
  match: (url) => {
    const path = url.split('?')[0];
    return path === prefix || path.startsWith(prefix + '/');
  },
  respond: (req, res, apiResponse) => apiResponse(res, data),
}));

const routes = [
  { name: 'dashboard', path: '/', waitForText: 'SOSContributor' },
  { name: 'worlds', path: '/worlds', waitForText: 'Mock World 1' },
  { name: 'tags', path: '/tags', waitForText: 'kino' },
  { name: 'lists', path: '/lists', waitForText: 'My Lists', initScript: seedLegacyLists },
  { name: 'settings', path: '/settings', waitForText: 'Settings' },
];

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1280, height: 900 },
];

function setTheme(page, theme) {
  return page.evaluate((t) => {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sos-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sos-theme', 'light');
    }
  }, theme);
}

async function captureAll(outDir) {
  execSync('vite build', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env, VITE_API_BASE_URL: API_BASE_URL },
  });
  await fs.mkdir(outDir, { recursive: true });
  const server = createServer({ port: PORT, apiMocks: {}, apiHandlers }).listen(PORT);
  const browser = await chromium.launch({ headless: true });

  try {
    for (const route of routes) {
      for (const vp of viewports) {
        for (const theme of ['light', 'dark']) {
          const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
          const page = await context.newPage();
          if (route.initScript) await page.addInitScript(route.initScript);
          await page.goto(`http://localhost:${PORT}${route.path}`, { waitUntil: 'networkidle' });
          await page.waitForTimeout(500);
          if (route.waitForText) {
            await page.waitForFunction((name) => document.body.innerText.includes(name), route.waitForText, { timeout: 10000 });
          }
          await page.evaluate(() =>
            Promise.all(
              Array.from(document.images)
                .filter((img) => !img.complete)
                .map(
                  (img) =>
                    new Promise((resolve) => {
                      img.addEventListener('load', resolve, { once: true });
                      img.addEventListener('error', resolve, { once: true });
                    }),
                ),
            ),
          );
          await setTheme(page, theme);
          await page.waitForTimeout(300);
          const file = path.join(outDir, `${route.name}_${vp.name}_${theme}.png`);
          await page.screenshot({ path: file, fullPage: true });
          console.log('captured', file);
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
}

function histogram(data, width, height) {
  let light = 0;
  let dark = 0;
  let color = 0;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    if (brightness > 200) light++;
    else if (brightness < 55) dark++;
    if (r !== g || g !== b) color++;
  }
  const total = data.length / 4;
  return {
    lightPct: light / total,
    darkPct: dark / total,
    colorPct: color / total,
  };
}

async function compare() {
  const { PNG } = await import('pngjs');
  const { default: pixelmatch } = await import('pixelmatch');
  const baselineFiles = await fs.readdir(baselineDir).then((f) => f.filter((x) => x.endsWith('.png')));
  const failures = [];
  for (const file of baselineFiles) {
    const afterPath = path.join(afterDir, file);
    const baseline = PNG.sync.read(await fs.readFile(path.join(baselineDir, file)));
    const after = await fs.readFile(afterPath).then((buf) => PNG.sync.read(buf)).catch(() => null);
    if (!after) {
      failures.push({ file, reason: 'after-file-missing' });
      continue;
    }
    if (baseline.width !== after.width || baseline.height !== after.height) {
      failures.push({ file, reason: `size ${baseline.width}x${baseline.height} vs ${after.width}x${after.height}` });
      continue;
    }
    const diff = new PNG({ width: baseline.width, height: baseline.height });
    const pixels = pixelmatch(baseline.data, after.data, diff.data, baseline.width, baseline.height, { threshold: 0.1 });
    const totalPixels = baseline.width * baseline.height;
    const ratio = pixels / totalPixels;
    // Also fingerprint the images to catch large-scale differences (e.g. missing content)
    const bh = histogram(baseline.data, baseline.width, baseline.height);
    const ah = histogram(after.data, after.width, after.height);
    const hDelta = Math.abs(bh.lightPct - ah.lightPct) + Math.abs(bh.darkPct - ah.darkPct) + Math.abs(bh.colorPct - ah.colorPct);
    const status = ratio < 0.001 && hDelta < 0.1 ? 'MATCH' : 'DIFF';
    if (status === 'DIFF') {
      const diffPath = path.join(afterDir, `diff_${file}`);
      await fs.writeFile(diffPath, PNG.sync.write(diff));
      failures.push({ file, ratio: ratio.toFixed(5), hDelta: hDelta.toFixed(4), reason: `pixel-diff=${ratio.toFixed(5)} hist=${hDelta.toFixed(4)}` });
    }
  }
  if (failures.length === 0) {
    console.log('PARITY OK: all baseline screenshots match.');
  } else {
    console.log(`PARITY FAIL (${failures.length}/${baselineFiles.length}):`);
    for (const f of failures) console.log(' -', f);
    process.exitCode = 1;
  }
}

async function main() {
  if (mode === 'capture') {
    await captureAll(baselineDir);
  } else if (mode === 'after') {
    await captureAll(afterDir);
  } else {
    await compare();
  }
}

main();