const WORLD_ID = 'wrld_demo_0000-0000-0000-000000000001';
const WORLD_NAME = 'Moonlit Rooftop Garden';

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

/** @type {import('../lib/screenshot.mjs').ScreenshotConfig} */
export default {
  port: 9877,
  apiMocks: {
    '/api/health': mockHealth,
    '/api/meta': mockMeta,
    '/api/tags': mockTags,
    '/api/worlds': (url) => {
      const parsed = new URL(url, 'http://localhost:9877');
      const worldId = parsed.pathname.match(/^\/api\/worlds\/(.+)$/)?.[1];
      if (worldId) {
        const world = mockWorlds.worlds.find((w) => w.worldId === worldId);
        return world ?? mockWorlds.worlds[0];
      }
      return mockWorlds;
    },
  },
  routes: [
    { name: 'tags', path: '/tags', waitForText: null },
    { name: 'dashboard', path: '/', waitForText: null },
    { name: 'worlds', path: '/worlds', waitForText: null },
    { name: 'world-detail', path: `/worlds/${WORLD_ID}`, waitForText: WORLD_NAME },
    { name: 'lists', path: '/lists', waitForText: null },
  ],
};
