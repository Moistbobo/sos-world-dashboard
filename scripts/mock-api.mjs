import { createServer } from 'node:http';

const PORT = 3067;

const THUMBNAILS = [
  'https://api.vrchat.cloud/api/1/file/file_474e689a-06a3-489e-8403-3debe9a809ad/3/file',
  'https://api.vrchat.cloud/api/1/file/file_4c5850ab-f5ba-42a8-be3c-15daf0909bcd/3/file',
  'https://api.vrchat.cloud/api/1/file/file_dc1742ce-68a1-4013-a2cd-d72f410522e2/3/file',
  'https://api.vrchat.cloud/api/1/file/file_2fcdc6c4-f208-46ae-b4cf-fdf4c6f107e4/1/file',
  'https://api.vrchat.cloud/api/1/file/file_5952a9a4-f358-49ec-b815-f26301700ce0/8/file',
  'https://api.vrchat.cloud/api/1/file/file_035b4b86-5cf3-45ad-b843-84de0c3c2b34/3/file',
  'https://api.vrchat.cloud/api/1/file/file_dd69bdcf-9abd-4f04-97bd-07a744a0dd0c/1/file',
  'https://api.vrchat.cloud/api/1/file/file_96925328-222c-45ff-9b86-96d4a524eeb1/4/file',
  'https://api.vrchat.cloud/api/1/file/file_0be44a1f-093a-4f3c-a96e-6a8abf790fe1/4/file',
  'https://api.vrchat.cloud/api/1/file/file_04e42c63-0964-422a-9486-a517f2ba30c6/2/file',
  'https://api.vrchat.cloud/api/1/file/file_ac0b16f5-3b5f-4e77-9242-6135b0444d2a/7/file',
  'https://api.vrchat.cloud/api/1/file/file_5446746d-672f-4c83-8ce4-310bb08bdc81/1/file',
  'https://api.vrchat.cloud/api/1/file/file_ab7d9854-2152-4e0f-8d9c-88ad783831d7/10/file',
  'https://api.vrchat.cloud/api/1/file/file_ac5c9e26-973e-421a-84de-3f207a085c69/1/file',
  'https://api.vrchat.cloud/api/1/file/file_fad12b21-4dd8-42b4-a6c9-d15ba6e05d88/4/file',
  'https://api.vrchat.cloud/api/1/file/file_4d431920-e57e-40fd-8141-ebfdd7e203c5/3/file',
  'https://api.vrchat.cloud/api/1/file/file_1b58cb45-ad30-4719-b374-7f47eef90ee1/9/file',
  'https://api.vrchat.cloud/api/1/file/file_a2fcba78-df62-41d7-ba80-e699c9a50173/2/file',
  'https://api.vrchat.cloud/api/1/file/file_1ad27bab-090f-4b16-af5e-b7935cae977b/3/file',
  'https://api.vrchat.cloud/api/1/file/file_92f26f1f-0b3c-4082-b0dd-ecb387bec429/5/file',
];

const NAMES = [
  'Midnight Lounge', 'Neon Harbor', 'Crystal Caverns', 'Sky Temple', 'Aurora Gardens',
  'Retro Arcade', 'Zen Garden', 'Cyber Market', 'Sunset Pier', 'Forest Sanctuary',
  'Ice Palace', 'Desert Oasis', 'Starlight Observatory', 'Underground City', 'Cloud Nine',
  'Haunted Mansion', 'Tropical Lagoon', 'Industrial District', 'Floating Islands', 'Winter Village',
];

const TAGS = [
  { tag: 'chill', count: 1321 },
  { tag: 'social', count: 1104 },
  { tag: 'hangout', count: 893 },
  { tag: 'game', count: 742 },
  { tag: 'music', count: 618 },
  { tag: 'avatar', count: 505 },
];

function makeWorld(index) {
  return {
    worldId: `wrld_mock-${String(index).padStart(6, '0')}`,
    name: NAMES[index % NAMES.length],
    authorName: 'Mock Author',
    capacity: 20 + (index % 7) * 10,
    platforms: index % 3 === 0 ? ['PC'] : ['PC', 'Quest'],
    tags: [TAGS[index % TAGS.length].tag, 'chill'],
    imageUrl: THUMBNAILS[index % THUMBNAILS.length],
    vrchatUrl: 'https://vrchat.com/home/world/wrld_mock',
    quality: index % 4 === 0 ? 'bad' : 'good',
    createdAt: '2024-01-01',
    internalAddDate: '2024-01-01',
  };
}

const ALL_WORLDS = Array.from({ length: 7431 }, (_, i) => makeWorld(i));

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  });
  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    });
    res.end();
    return;
  }

  if (url.pathname === '/api/health') {
    json(res, 200, { status: 'ok' });
    return;
  }
  if (url.pathname === '/api/tags') {
    json(res, 200, { tags: TAGS });
    return;
  }
  if (url.pathname === '/api/meta') {
    json(res, 200, {
      qualityGood: 5123,
      qualityBad: 2308,
      platformDesktop: 6900,
      platformAndroid: 4200,
      platformiOS: 1500,
    });
    return;
  }
  const worldMatch = url.pathname.match(/^\/api\/worlds\/(.+)$/);
  if (worldMatch) {
    const world = ALL_WORLDS.find((w) => w.worldId === worldMatch[1]);
    if (world) {
      json(res, 200, world);
    } else {
      json(res, 404, { error: 'World not found' });
    }
    return;
  }
  if (url.pathname === '/api/worlds') {
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    json(res, 200, {
      total: ALL_WORLDS.length,
      limit,
      offset,
      worlds: ALL_WORLDS.slice(offset, offset + limit),
    });
    return;
  }
  json(res, 404, { error: `No route for ${url.pathname}` });
});

server.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}`);
});
