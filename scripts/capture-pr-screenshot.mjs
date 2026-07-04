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

async function captureVariant(browser, theme, { recordVideo, outDir }) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    recordVideo: recordVideo ? { dir: outDir, size: { width: 1280, height: 900 } } : undefined,
  });
  const page = await context.newPage();

  await page.goto(`http://localhost:9877/worlds/${WORLD_ID}`, { waitUntil: 'networkidle' });

  // Wait for the real world name to appear instead of skeleton placeholders.
  await page.waitForFunction((name) => document.body.innerText.includes(name), WORLD_NAME, { timeout: 10000 });

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

  // Set theme and wait for any CSS transition to settle.
  await setTheme(page, theme);
  await page.waitForTimeout(500);

  const screenshotPath = path.join(outDir, `world-detail_${theme}.png`);
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
    const expectedFinalName = `world-detail_${theme}.webm`;
    const expectedTempPrefix = 'video';
    const videoFiles = readdirSync(outDir).filter((f) => f.endsWith('.webm'));
    videoPath = path.join(outDir, expectedFinalName);
    // Rename the most recent generic .webm if it has not already been renamed.
    const unclaimed = videoFiles.find((f) => !f.startsWith('world-detail_'));
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

  const light = await captureVariant(browser, 'light', { recordVideo: captureVideo, outDir });
  const dark = await captureVariant(browser, 'dark', { recordVideo: captureVideo, outDir });

  await browser.close();
  server.close(() => {
    console.log('Light screenshot:', light.screenshotPath);
    console.log('Dark screenshot:', dark.screenshotPath);
    if (captureVideo) {
      console.log('Light video:', light.videoPath);
      console.log('Dark video:', dark.videoPath);
    }
    process.exit(0);
  });
});
