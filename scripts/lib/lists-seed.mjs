export function seedLegacyLists() {
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
  const names = [
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
  const lists = names.map((name, i) => ({
    id: `list_demo_${String(i + 1).padStart(4, '0')}`,
    name,
    icon: null,
    color: '#4f46e5',
    worldIds: [],
    createdAt: now,
    updatedAt: now,
  }));
  window.localStorage.setItem('sos-world-lists', JSON.stringify({ version: 1, lists }));
}
