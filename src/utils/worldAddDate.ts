import type { World } from '../types';

export function getWorldAddDate(world: World): string {
  return world.internalAddDate ?? world.createdAt;
}
