const mockWorlds = [
  {
    worldId: 'wrld_demo_0000-0000-0000-000000000001',
    name: 'Moonlit Rooftop Garden',
    authorName: 'SOSContributor',
    capacity: 24,
    platforms: ['standalonewindows', 'android'],
    tags: ['chill', 'social', 'japanese', 'night'],
    imageUrl: 'https://placehold.co/1200x600/6366f1/ffffff?text=VRChat+World',
    vrchatUrl: 'https://vrchat.com/home/world/wrld_demo_0000-0000-0000-000000000001',
    quality: 'good',
    createdAt: '2024-01-15T00:00:00.000Z',
    internalAddDate: '2024-06-01T00:00:00.000Z',
  },
];

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
    { tag: 'chill', count: 42 },
    { tag: 'social', count: 35 },
    { tag: 'japanese', count: 18 },
    { tag: 'night', count: 12 },
  ],
};

function paginatedWorlds(url) {
  return {
    worlds: mockWorlds,
    total: mockWorlds.length,
    limit: 20,
    offset: 0,
  };
}

/** @type {import('../lib/screenshot.mjs').ScreenshotConfig} */
export default {
  port: 9877,
  apiMocks: {
    '/api/health': mockHealth,
    '/api/meta': mockMeta,
    '/api/tags': mockTags,
  },
  apiHandlers: [
    {
      match: (url) => url.startsWith('/api/worlds'),
      respond: (_req, res, sendJson) => sendJson(res, paginatedWorlds()),
    },
  ],
  routes: [
    {
      name: 'worlds-date-tagged',
      path: '/worlds?dayRange=7',
      waitForText: 'Moonlit Rooftop Garden',
    },
  ],
  selectors: {
    worlds: '[data-testid="world-card"], .grid > div',
  },
};
