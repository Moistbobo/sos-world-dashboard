import { openDB, type IDBPDatabase } from 'idb';
import type { WorldList } from '../types/lists';
import { LISTS_STORAGE_KEY, loadLists, saveLists } from './listsStorage';

export const LISTS_DB_NAME = 'sos-world-lists';
export const LISTS_STORE_NAME = 'lists';
const DB_VERSION = 1;

export type PersistMode = 'idb' | 'local-storage';

export interface LoadAllListsResult {
  lists: WorldList[];
  error: string | null;
  mode: PersistMode;
}

interface ListsDbSchema {
  lists: { key: string; value: WorldList };
}

function upgrade(db: IDBPDatabase<ListsDbSchema>): void {
  if (!db.objectStoreNames.contains(LISTS_STORE_NAME)) {
    db.createObjectStore(LISTS_STORE_NAME, { keyPath: 'id' });
  }
}

async function withDb<T>(
  op: (db: IDBPDatabase<ListsDbSchema>) => Promise<T>,
): Promise<T> {
  const db = await openDB<ListsDbSchema>(LISTS_DB_NAME, DB_VERSION, { upgrade });
  try {
    return await op(db);
  } finally {
    db.close();
  }
}

export function getAllLists(): Promise<WorldList[]> {
  return withDb((db) => db.getAll(LISTS_STORE_NAME));
}

export function putList(list: WorldList): Promise<void> {
  return withDb(async (db) => {
    await db.put(LISTS_STORE_NAME, list);
  });
}

export function putLists(lists: WorldList[]): Promise<void> {
  if (lists.length === 0) return Promise.resolve();
  return withDb(async (db) => {
    const tx = db.transaction(LISTS_STORE_NAME, 'readwrite');
    await Promise.all([...lists.map((list) => tx.store.put(list)), tx.done]);
  });
}

export function deleteListFromDb(id: string): Promise<void> {
  return withDb(async (db) => {
    await db.delete(LISTS_STORE_NAME, id);
  });
}

export function clearListsDb(): Promise<void> {
  return withDb((db) => db.clear(LISTS_STORE_NAME));
}

export interface ListsDiff {
  toPut: WorldList[];
  toDelete: string[];
}

export function computeListsDiff(
  prev: WorldList[],
  next: WorldList[],
): ListsDiff {
  const prevById = new Map(prev.map((list) => [list.id, list]));
  const nextIds = new Set(next.map((list) => list.id));
  const toPut = next.filter((list) => prevById.get(list.id) !== list);
  const toDelete = prev
    .filter((list) => !nextIds.has(list.id))
    .map((list) => list.id);
  return { toPut, toDelete };
}

export async function persistLists(
  prev: WorldList[],
  next: WorldList[],
): Promise<{ error: string | null; mode: PersistMode }> {
  const diff = computeListsDiff(prev, next);
  if (diff.toPut.length === 0 && diff.toDelete.length === 0) {
    return { error: null, mode: 'idb' };
  }
  try {
    if (diff.toPut.length > 0) {
      await putLists(diff.toPut);
    }
    for (const id of diff.toDelete) {
      await deleteListFromDb(id);
    }
    return { error: null, mode: 'idb' };
  } catch (err) {
    const { error } = saveLists(next);
    return {
      error: error ?? (err instanceof Error ? err.message : 'Failed to save lists'),
      mode: 'local-storage',
    };
  }
}

export async function loadAllLists(): Promise<LoadAllListsResult> {
  const hasLegacy = window.localStorage.getItem(LISTS_STORAGE_KEY) !== null;
  const legacy = hasLegacy ? loadLists() : null;

  try {
    let idbLists = await getAllLists();
    if (legacy) {
      if (legacy.lists.length > 0 && idbLists.length === 0) {
        await putLists(legacy.lists);
        idbLists = legacy.lists;
      }
      window.localStorage.removeItem(LISTS_STORAGE_KEY);
    }
    return { lists: idbLists, error: legacy?.error ?? null, mode: 'idb' };
  } catch {
    const fallback = legacy ?? loadLists();
    return {
      lists: fallback.lists,
      error: fallback.error,
      mode: 'local-storage',
    };
  }
}
