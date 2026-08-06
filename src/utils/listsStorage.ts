import type { CreateListInput, WorldList } from '../types/lists';

export const LISTS_STORAGE_KEY = 'sos-world-lists';
const SCHEMA_VERSION = 1;

interface ListsSnapshot {
  version: number;
  lists: WorldList[];
}

export function generateListId(): string {
  return crypto.randomUUID();
}

export function createList(input: CreateListInput): WorldList {
  const now = new Date().toISOString();
  return {
    id: generateListId(),
    name: input.name.trim(),
    icon: input.icon?.trim() || null,
    color: input.color?.trim() || '#4f46e5',
    memo: input.memo?.trim() || null,
    worldIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

function migrate(raw: unknown): WorldList[] {
  if (Array.isArray(raw)) return raw as WorldList[];
  if (
    raw &&
    typeof raw === 'object' &&
    'lists' in raw &&
    Array.isArray((raw as ListsSnapshot).lists)
  ) {
    return (raw as ListsSnapshot).lists;
  }
  return [];
}

export function loadLists(): { lists: WorldList[]; error: string | null } {
  try {
    const raw = window.localStorage.getItem(LISTS_STORAGE_KEY);
    if (!raw) return { lists: [], error: null };
    const parsed = JSON.parse(raw) as unknown;
    return { lists: migrate(parsed), error: null };
  } catch (err) {
    return {
      lists: [],
      error: err instanceof Error ? `Failed to read lists: ${err.message}` : 'Failed to read lists',
    };
  }
}

export function saveLists(lists: WorldList[]): { error: string | null } {
  try {
    const snapshot: ListsSnapshot = { version: SCHEMA_VERSION, lists };
    window.localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(snapshot));
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Failed to save lists',
    };
  }
}
