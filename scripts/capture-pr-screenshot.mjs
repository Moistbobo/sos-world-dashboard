import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runScreenshot } from './lib/screenshot.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const configName = process.env.SCREENSHOT_CONFIG || 'default';
const configPath = path.resolve(__dirname, 'screenshot-configs', `${configName}.mjs`);

const { default: config } = await import(configPath);

runScreenshot(config);
