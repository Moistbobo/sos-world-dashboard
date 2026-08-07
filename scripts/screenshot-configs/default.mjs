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

const LIST_NAMES = [
  'Favorites',
  'Chill & Relax',
  'Photo Spots',
  'Party Worlds',
  'Japanese Worlds',
  'Quest Compatible',
  'To Visit',
  'Music & Clubs',
  'Cozy Spaces',
  'Horror Nights',
  'Avatar Showrooms',
  'Puzzle Games',
  'Art Galleries',
  'Social Hubs',
];

const now = new Date().toISOString();

const lists = LIST_NAMES.map((name, i) => ({
  id: `list_demo_${String(i + 1).padStart(4, '0')}`,
  name,
  icon: null,
  color: '#4f46e5',
  worldIds: [],
  createdAt: now,
  updatedAt: now,
}));

function seedLegacyLists() {
  localStorage.setItem(
    'sos-world-lists',
    JSON.stringify({ version: 1, lists }),
  );
}

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
