import type { World } from '../types';

export type CurationQuality = 'good' | 'bad';

export type CurationAction =
  | { type: 'set-quality'; quality: CurationQuality }
  | { type: 'set-high-priority' }
  | { type: 'clear-quality' };

export type CurationState =
  | { kind: 'untagged'; quality: null; highPriority: boolean }
  | { kind: 'high-priority'; quality: null; highPriority: boolean }
  | { kind: 'quality-tagged'; quality: CurationQuality; highPriority: boolean };

export function getCurationState(world: World): CurationState {
  if (world.quality) {
    return {
      kind: 'quality-tagged',
      quality: world.quality,
      highPriority: world.highPriority === true,
    };
  }
  if (world.highPriority === true) {
    return { kind: 'high-priority', quality: null, highPriority: true };
  }
  return { kind: 'untagged', quality: null, highPriority: false };
}

export function applyCuration(world: World, action: CurationAction): World {
  switch (action.type) {
    case 'set-quality':
      // Quality dominates: a quality tag supersedes high priority both on the
      // server (the HP row is deleted) and in the cache.
      return { ...world, quality: action.quality, highPriority: false };
    case 'set-high-priority':
      return { ...world, highPriority: true };
    case 'clear-quality':
      return { ...world, quality: null, highPriority: false };
  }
}
