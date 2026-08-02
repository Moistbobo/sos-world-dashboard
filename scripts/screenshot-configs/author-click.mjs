const WORLD_IDS = [
  'wrld_demo_0000-0000-0000-000000000001',
  'wrld_demo_0000-0000-0000-000000000002',
  'wrld_demo_0000-0000-0000-000000000003',
  'wrld_demo_0000-0000-0000-000000000004',
  'wrld_demo_0000-0000-0000-000000000005',
  'wrld_demo_0000-0000-0000-000000000006',
];

const NAMES = [
  'Moonlit Rooftop Garden',
  'Aurora Borealis Cabin',
  'Quiet Library Loft',
  'Floating Lantern Festival',
  'Cozy Rainy Cafe',
  'Stargazer\'s Atrium',
];

const AUTHORS = [
  'SOSContributor',
  'AuroraBuilder',
  'SOSContributor',
  'LanternMage',
  'SOSContributor',
  'Stargazer',
];

const TAGS = [
  ['chill', 'social', 'japanese', 'night'],
  ['nature', 'aurora', 'cozy'],
  ['chill', 'quiet', 'library'],
  ['festival', 'japanese', 'night'],
  ['chill', 'cafe', 'rain'],
  ['night', 'cozy', 'stars'],
];

function buildWorlds() {
  return WORLD_IDS.map((id, i) => ({
    worldId: id,
    name: NAMES[i],
    authorName: AUTHORS[i],
    capacity: 20 + i * 4,
    platforms: ['standalonewindows', 'android'],
    tags: TAGS[i],
    imageUrl: `https://placehold.co/1200x600/6366f1/ffffff?text=${encodeURIComponent(NAMES[i])}`,
    vrchatUrl: `https://vrchat.com/home/world/${id}`,
    quality: 'good',
    createdAt: '2024-01-15T00:00:00.000Z',
    internalAddDate: '2024-06-01T00:00:00.000Z',
  }));
}

const allWorlds = buildWorlds();

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
    { tag: 'chill', count: 412 },
    { tag: 'social', count: 305 },
    { tag: 'japanese', count: 198 },
    { tag: 'night', count: 187 },
    { tag: 'cozy', count: 165 },
    { tag: 'nature', count: 122 },
    { tag: 'aurora', count: 41 },
    { tag: 'quiet', count: 33 },
    { tag: 'library', count: 17 },
    { tag: 'festival', count: 25 },
  ],
};

/** @type {import('../lib/screenshot.mjs').ScreenshotConfig} */
export default {
  port: 9877,
  apiMocks: {
    '/api/health': mockHealth,
    '/api/meta': mockMeta,
    '/api/tags': mockTags,
    '/api/worlds?limit=6': { worlds: allWorlds, total: allWorlds.length, limit: 6, offset: 0 },
    '/api/worlds': { worlds: allWorlds, total: allWorlds.length, limit: 20, offset: 0 },
  },
  routes: [
    { name: 'dashboard-author-clickable', path: '/', waitForText: 'SOSContributor' },
    { name: 'worlds-filtered-by-author', path: '/worlds?search=SOSContributor' },
  ],
};
