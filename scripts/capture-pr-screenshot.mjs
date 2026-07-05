import { execSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WORLD_ID = 'wrld_demo_0000-0000-0000-000000000001';
const WORLD_NAME = 'Moonlit Rooftop Garden';

const mockWorld = {
  worldId: WORLD_ID,
  name: WORLD_NAME,
  authorName: 'SOSContributor',
  capacity: 24,
  platforms: ['standalonewindows', 'android'],
  tags: ['chill', 'social', 'japanese', 'night'],
  imageUrl: 'https://placehold.co/1200x600/6366f1/ffffff?text=VRChat+World',
  vrchatUrl: `https://vrchat.com/home/world/${WORLD_ID}`,
  quality: 'good',
  createdAt: '2024-01-15T00:00:00.000Z',
  internalAddDate: '2024-06-01T00:00:00.000Z',
};

const mockMeta = {
  qualityGood: 128,
  qualityBad: 12,
  platformDesktop: 340,
  platformAndroid: 95,
  platformiOS: 0,
};

const mockHealth = {
  status: 'ok',
  worldCount: 7015,
  dbVersion: 1,
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

function makeWorld(id, name, tags, quality = 'good') {
  return {
    worldId: id,
    name,
    authorName: 'SOSContributor',
    capacity: 24,
    platforms: ['standalonewindows', 'android'],
    tags,
    imageUrl: 'https://placehold.co/1200x600/6366f1/ffffff?text=VRChat+World',
    vrchatUrl: `https://vrchat.com/home/world/${id}`,
    quality,
    createdAt: '2024-01-15T00:00:00.000Z',
    internalAddDate: '2024-06-01T00:00:00.000Z',
  };
}

const mockWorlds = {
  total: 6,
  limit: 20,
  offset: 0,
  worlds: [
    makeWorld('wrld_demo_0000-0000-0000-000000000001', 'Moonlit Rooftop Garden', ['chill', 'social', 'japanese', 'night'], 'good'),
    makeWorld('wrld_demo_0000-0000-0000-000000000002', 'Neon City Drive', ['driving', 'tech', 'pc'], 'good'),
    makeWorld('wrld_demo_0000-0000-0000-000000000003', 'Cozy Cottage Cove', ['comfy', 'nature', 'relaxing'], 'good'),
    makeWorld('wrld_demo_0000-0000-0000-000000000004', 'Horror Hospital', ['horror', 'game', 'quest'], 'bad'),
    makeWorld('wrld_demo_0000-0000-0000-000000000005', 'Puzzle Palace', ['puzzle', 'gallery', 'pc'], 'good'),
    makeWorld('wrld_demo_0000-0000-0000-000000000006', 'Meme Mansion', ['meme', 'social', 'avatar'], 'good'),
  ],
};

function apiResponse(res, data) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Build the app with the local mock API base URL baked in.
console.log('Building production bundle pointing at mock API...');
execSync('cross-env VITE_API_BASE_URL=http://localhost:9877 vite build', {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
});

const server = http.createServer(async (req, res) => {
  const url = req.url ?? '/';

  if (url.startsWith(`/api/worlds/${WORLD_ID}`)) {
    return apiResponse(res, mockWorld);
  }
  if (url === '/api/health') {
    return apiResponse(res, mockHealth);
  }
  if (url === '/api/meta') {
    return apiResponse(res, mockMeta);
  }
  if (url === '/api/tags') {
    return apiResponse(res, mockTags);
  }
  if (url.startsWith('/api/worlds')) {
    const parsed = new URL(url, 'http://localhost:9877');
    const worldId = parsed.pathname.match(/^\/api\/worlds\/(.+)$/)?.[1];
    if (worldId) {
      const world = mockWorlds.worlds.find((w) => w.worldId === worldId);
      return apiResponse(res, world ?? mockWorld);
    }
    return apiResponse(res, mockWorlds);
  }

  // Static files from dist/
  const distPath = path.resolve(__dirname, '../dist');
  let filePath = path.join(distPath, url.split('?')[0]);
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const contentType =
      {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
      }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    const html = await fs.readFile(path.join(distPath, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
});

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

const ROUTES = [
  { name: 'tags', path: '/tags', waitForText: null },
  { name: 'dashboard', path: '/', waitForText: null },
  { name: 'worlds', path: '/worlds', waitForText: null },
  { name: 'world-detail', path: `/worlds/${WORLD_ID}`, waitForText: WORLD_NAME },
  { name: 'lists', path: '/lists', waitForText: null },
];

async function waitForReady(page, routeName, waitForText) {
  // Give the page a moment to render skeletons/lists.
  await page.waitForTimeout(500);

  if (waitForText) {
    await page.waitForFunction((name) => document.body.innerText.includes(name), waitForText, { timeout: 10000 });
  } else {
    // Wait for at least one non-skeleton card/chart/list row to appear.
    try {
      if (routeName === 'tags') {
        await page.waitForSelector('[data-testid="waffle-chart"], .grid > div', { timeout: 10000 });
      } else if (routeName === 'dashboard') {
        await page.waitForSelector('.card, [class*="recharts"]', { timeout: 10000 });
      } else if (routeName === 'worlds') {
        await page.waitForSelector('[data-testid="world-card"], .grid > div', { timeout: 10000 });
      } else if (routeName === 'lists') {
        await page.waitForSelector('.card, button', { timeout: 10000 });
      }
    } catch {
      // Fallback: just wait for network idle to finish.
    }
  }

  // Wait for images to finish loading before applying theme.
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
}

async function captureVariant(browser, theme, route, { recordVideo, outDir }) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    recordVideo: recordVideo ? { dir: outDir, size: { width: 1280, height: 900 } } : undefined,
  });
  const page = await context.newPage();

  await page.goto(`http://localhost:9877${route.path}`, { waitUntil: 'networkidle' });
  await waitForReady(page, route.name, route.waitForText);

  // Set theme and wait for any CSS transition to settle.
  await setTheme(page, theme);
  await page.waitForTimeout(500);

  const screenshotPath = path.join(outDir, `${route.name}_${theme}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  let videoPath = null;
  if (recordVideo) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const duration = 2500;
      const start = performance.now();
      const startY = window.scrollY;
      const endY = document.body.scrollHeight - window.innerHeight;
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        window.scrollTo(0, startY + endY * progress);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    await page.waitForTimeout(3000);

    await context.close();

    // Playwright names video files automatically; rename the one generated by this context.
    const expectedFinalName = `${route.name}_${theme}.webm`;
    const videoFiles = readdirSync(outDir).filter((f) => f.endsWith('.webm'));
    videoPath = path.join(outDir, expectedFinalName);
    // Rename the most recent generic .webm if it has not already been renamed.
    const unclaimed = videoFiles.find((f) => !f.startsWith(`${route.name}_`));
    if (unclaimed) {
      await fs.rename(path.join(outDir, unclaimed), videoPath);
    }
  } else {
    await context.close();
  }

  return { screenshotPath, videoPath };
}

server.listen(9877, async () => {
  const branchName = process.env.BRANCH_NAME || 'pr-template-e2e-risk';
  const outDir = path.resolve(__dirname, '../pr-assets', branchName);
  await fs.mkdir(outDir, { recursive: true });

  const captureVideo = process.env.CAPTURE_VIDEO === '1';
  const browser = await chromium.launch({ headless: true });

  for (const route of ROUTES) {
    const light = await captureVariant(browser, 'light', route, { recordVideo: captureVideo, outDir });
    const dark = await captureVariant(browser, 'dark', route, { recordVideo: captureVideo, outDir });

    console.log(`${route.name} light screenshot:`, light.screenshotPath);
    console.log(`${route.name} dark screenshot:`, dark.screenshotPath);
    if (captureVideo) {
      console.log(`${route.name} light video:`, light.videoPath);
      console.log(`${route.name} dark video:`, dark.videoPath);
    }
  }

  await browser.close();
  server.close(() => {
    process.exit(0);
  });
});
