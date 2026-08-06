// Captures a short video of the /tags page loading to verify WaffleChart cell animations.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'pr-assets', 'chore-173-memoize-waffle-cell-computation');

async function main() {
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: outDir, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173/tags');
  // Wait for the waffle chart container to render so the video captures the entrance animation.
  await page.locator('.grid.grid-cols-10.gap-1').first().waitFor({ timeout: 15000 });
  // Let the staggered animation play out.
  await new Promise((resolve) => setTimeout(resolve, 1500));

  await context.close();
  await browser.close();
  console.log(`Video saved to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
