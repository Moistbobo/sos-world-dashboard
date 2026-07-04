const adjectives = [
  'happy', 'brave', 'clever', 'curious', 'friendly', 'gentle', 'jolly',
  'kind', 'lively', 'merry', 'proud', 'silly', 'sleepy', 'witty', 'calm',
  'eager', 'fancy', 'cheerful', 'noble', 'polite', 'sunny', 'warm', 'zesty',
  'bright', 'bold', 'graceful', 'joyful',
];

const animals = [
  'alpaca', 'badger', 'beaver', 'bison', 'camel', 'cobra', 'crane', 'dolphin',
  'eagle', 'falcon', 'ferret', 'gecko', 'hare', 'heron', 'iguana', 'koala',
  'lemur', 'llama', 'lynx', 'moose', 'otter', 'owl', 'panda', 'rabbit',
  'raven', 'salmon', 'shark', 'sloth', 'snake', 'sparrow', 'stoat', 'swan',
  'tapir', 'tiger', 'toucan', 'turtle', 'walrus', 'weasel', 'whale', 'wolf',
  'wombat', 'zebra',
];

export function generateUsername(uuid: string): string {
  if (!uuid) return 'anonymous-user';
  const digits = uuid.replace(/-/g, '');
  const first = parseInt(digits.slice(0, 16), 16);
  const second = parseInt(digits.slice(16, 32), 16);
  const adjective = adjectives[first % adjectives.length];
  const animal = animals[second % animals.length];
  return `${adjective}-${animal}`;
}
