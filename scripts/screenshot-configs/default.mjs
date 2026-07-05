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

/** @type {import('../lib/screenshot.mjs').ScreenshotConfig} */
export default {
  port: 9877,
  apiMocks: {
    '/api/health': mockHealth,
    '/api/meta': mockMeta,
    [`/api/worlds/${WORLD_ID}`]: mockWorld,
  },
  routes: [
    { name: 'world-detail', path: `/worlds/${WORLD_ID}`, waitForText: WORLD_NAME },
  ],
};
