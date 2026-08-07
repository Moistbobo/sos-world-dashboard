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

import { seedLegacyLists } from '../lib/lists-seed.mjs';

/** @type {import('../lib/screenshot.mjs').ScreenshotConfig} */
export default {
  port: 9877,
  apiMocks: {
    '/api/health': mockHealth,
    '/api/meta': mockMeta,
  },
  routes: [
    {
      name: 'lists',
      path: '/lists',
      waitForText: 'My Lists',
      initScript: seedLegacyLists,
    },
  ],
};
