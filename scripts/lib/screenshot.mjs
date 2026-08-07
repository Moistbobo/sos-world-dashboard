import { execSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function apiResponse(res, data) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function createServer(config) {
  return http.createServer(async (req, res) => {
    const url = req.url ?? '/';

    // Config can provide explicit handlers that override the generic mocks.
    if (config.apiHandlers) {
      for (const handler of config.apiHandlers) {
        if (handler.match(url)) {
          return handler.respond(req, res, apiResponse);
        }
      }
    }

    if (config.apiMocks) {
      for (const [prefix, data] of Object.entries(config.apiMocks)) {
        if (url === prefix || url.startsWith(prefix + '/')) {
          // If the mock is a function, call it with the URL.
          const response = typeof data === 'function' ? data(url) : data;
          return apiResponse(res, response);
        }
      }
    }

    // Static files from dist/
    const distPath = path.resolve(__dirname, '../../dist');
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
}

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

async function waitForReady(page, routeName, waitForText, selectors) {
  await page.waitForTimeout(500);

  if (waitForText) {
    await page.waitForFunction((name) => document.body.innerText.includes(name), waitForText, { timeout: 10000 });
  }

  const selectorList = selectors ?? {
    tags: '.grid > div',
    dashboard: '.card',
    worlds: '[data-testid="world-card"], .grid > div',
    lists: '.card, button',
  };

  const selector = selectorList[routeName];
  if (selector) {
    try {
      await page.waitForSelector(selector, { timeout: 10000 });
    } catch {
      // Fallback: rely on network idle.
    }
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
}

async function captureVariant(browser, theme, route, { recordVideo, outDir, selectors, initScript }) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    recordVideo: recordVideo ? { dir: outDir, size: { width: 1280, height: 900 } } : undefined,
  });
  const page = await context.newPage();

  if (initScript) {
    await page.addInitScript(initScript);
  }

  await page.goto(`http://localhost:9877${route.path}`, { waitUntil: 'networkidle' });
  await waitForReady(page, route.name, route.waitForText, selectors);

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

    const expectedFinalName = `${route.name}_${theme}.webm`;
    const videoFiles = readdirSync(outDir).filter((f) => f.endsWith('.webm'));
    videoPath = path.join(outDir, expectedFinalName);
    const unclaimed = videoFiles.find((f) => !f.startsWith(`${route.name}_`));
    if (unclaimed) {
      await fs.rename(path.join(outDir, unclaimed), videoPath);
    }
  } else {
    await context.close();
  }

  return { screenshotPath, videoPath };
}

export async function runScreenshot(config) {
  const port = config.port ?? 9877;
  const apiBaseUrl = `http://localhost:${port}`;

  console.log('Building production bundle pointing at mock API...');
  execSync(`cross-env VITE_API_BASE_URL=${apiBaseUrl} vite build`, {
    cwd: path.resolve(__dirname, '../..'),
    stdio: 'inherit',
  });

  const server = createServer(config).listen(port, async () => {
    const branchName = process.env.BRANCH_NAME || 'pr-template-e2e-risk';
    const outDir = path.resolve(__dirname, '../../pr-assets', branchName);
    await fs.mkdir(outDir, { recursive: true });

    const captureVideo = process.env.CAPTURE_VIDEO === '1';
    const browser = await chromium.launch({ headless: true });

    for (const route of config.routes) {
      const light = await captureVariant(browser, 'light', route, { recordVideo: captureVideo, outDir, selectors: config.selectors, initScript: route.initScript });
      const dark = await captureVariant(browser, 'dark', route, { recordVideo: captureVideo, outDir, selectors: config.selectors, initScript: route.initScript });

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
}
