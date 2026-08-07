import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { WorldList } from '../types/lists';
import { LISTS_STORAGE_KEY } from './listsStorage';
import {
  clearListsDb,
  computeListsDiff,
  deleteListFromDb,
  getAllLists,
  loadAllLists,
  persistLists,
  putList,
  putLists,
} from './listsDb';


function makeList(id: string, name = `List ${id}`): WorldList {
  return {
    id,
    name,
    icon: null,
    color: '#4f46e5',
    worldIds: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };
}

function seedLegacy(lists: WorldList[]): void {
  window.localStorage.setItem(
    LISTS_STORAGE_KEY,
    JSON.stringify({ version: 1, lists }),
  );
}

let idbOpenSpy: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  window.localStorage.clear();
  await clearListsDb();
  idbOpenSpy?.mockRestore();
  idbOpenSpy = vi.spyOn(indexedDB, 'open');
});

describe('CRUD', () => {
  it('round-trips lists through putLists and getAllLists', async () => {
    const lists = [makeList('l1'), makeList('l2')];
    await putLists(lists);
    expect(await getAllLists()).toEqual(lists);
  });

  it('upserts a list by id with putList', async () => {
    await putList(makeList('l1'));
    await putList({ ...makeList('l1'), name: 'renamed' });
    const stored = await getAllLists();
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('renamed');
  });

  it('deletes a list by id', async () => {
    await putLists([makeList('l1'), makeList('l2')]);
    await deleteListFromDb('l1');
    expect((await getAllLists()).map((l) => l.id)).toEqual(['l2']);
  });

  it('clears the store', async () => {
    await putLists([makeList('l1')]);
    await clearListsDb();
    expect(await getAllLists()).toEqual([]);
  });
});

describe('computeListsDiff', () => {
  it('returns an empty diff for identical lists', () => {
    const lists = [makeList('l1')];
    expect(computeListsDiff(lists, lists)).toEqual({ toPut: [], toDelete: [] });
  });

  it('flags added and changed lists as toPut', () => {
    const prev = [makeList('l1')];
    const added = makeList('l2');
    const changed = { ...prev[0], name: 'renamed' };
    expect(computeListsDiff(prev, [changed, added])).toEqual({
      toPut: [changed, added],
      toDelete: [],
    });
  });

  it('flags removed lists as toDelete', () => {
    const prev = [makeList('l1'), makeList('l2')];
    expect(computeListsDiff(prev, [prev[0]])).toEqual({
      toPut: [],
      toDelete: ['l2'],
    });
  });

  it('handles adds, changes and deletes together', () => {
    const prev = [makeList('l1'), makeList('l2')];
    const changed = { ...prev[1], name: 'renamed' };
    expect(computeListsDiff(prev, [changed, makeList('l3')])).toEqual({
      toPut: [changed, makeList('l3')],
      toDelete: ['l1'],
    });
  });
});

describe('persistLists', () => {
  it('no-ops when there is no change', async () => {
    const prev = [makeList('l1')];
    await putLists(prev);
    const result = await persistLists(prev, [prev[0]]);
    expect(result).toEqual({ error: null, mode: 'idb' });
    expect(await getAllLists()).toEqual(prev);
  });

  it('writes added and changed lists and deletes removed ones', async () => {
    const prev = [makeList('l1'), makeList('l2')];
    await putLists(prev);
    const changed = { ...prev[0], name: 'renamed' };
    const added = makeList('l3');
    const result = await persistLists(prev, [changed, added]);
    expect(result).toEqual({ error: null, mode: 'idb' });
    const stored = await getAllLists();
    expect(stored.map((l) => l.id).sort()).toEqual(['l1', 'l3']);
    expect(stored.find((l) => l.id === 'l1')?.name).toBe('renamed');
  });

  it('falls back to legacy storage when the IDB write fails', async () => {
    const prev = [makeList('l1')];
    await putLists(prev);
    idbOpenSpy.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const result = await persistLists(prev, [{ ...prev[0], name: 'renamed' }]);
    expect(result.error).toBe('boom');
    expect(result.mode).toBe('local-storage');
    const snapshot = JSON.parse(
      window.localStorage.getItem(LISTS_STORAGE_KEY) ?? '{}',
    ) as { lists: WorldList[] };
    expect(snapshot.lists[0].name).toBe('renamed');
  });
});

describe('loadAllLists migration', () => {
  it('copies legacy lists into an empty IndexedDB and removes the legacy key', async () => {
    const legacy = [makeList('l1')];
    seedLegacy(legacy);
    const result = await loadAllLists();
    expect(result).toEqual({ lists: legacy, error: null, mode: 'idb' });
    expect(await getAllLists()).toEqual(legacy);
    expect(window.localStorage.getItem(LISTS_STORAGE_KEY)).toBeNull();
  });

  it('keeps existing IndexedDB lists and still removes the legacy key when both exist', async () => {
    const idbLists = [makeList('idb-1')];
    await putLists(idbLists);
    seedLegacy([makeList('legacy-1')]);
    const result = await loadAllLists();
    expect(result.lists).toEqual(idbLists);
    expect(await getAllLists()).toEqual(idbLists);
    expect(window.localStorage.getItem(LISTS_STORAGE_KEY)).toBeNull();
  });

  it('preserves the legacy key and falls back to legacy read when the IDB write fails', async () => {
    const legacy = [makeList('l1')];
    seedLegacy(legacy);
    idbOpenSpy.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const result = await loadAllLists();
    expect(result.mode).toBe('local-storage');
    expect(result.lists).toEqual(legacy);
    expect(window.localStorage.getItem(LISTS_STORAGE_KEY)).not.toBeNull();
  });

  it('does not resurrect deleted lists after a crash between write and key removal', async () => {
    const legacy = [makeList('l1')];
    seedLegacy(legacy);
    const first = await loadAllLists();
    expect(first.lists).toEqual(legacy);
    expect(await getAllLists()).toEqual(legacy);
    expect(window.localStorage.getItem(LISTS_STORAGE_KEY)).toBeNull();

    seedLegacy(legacy);
    const second = await loadAllLists();
    expect(second.lists).toEqual(legacy);
    expect(window.localStorage.getItem(LISTS_STORAGE_KEY)).toBeNull();

    await clearListsDb();
    const third = await loadAllLists();
    expect(third.lists).toEqual([]);
  });

  it('treats corrupt legacy JSON as empty without crashing', async () => {
    window.localStorage.setItem(LISTS_STORAGE_KEY, 'not-json');
    const result = await loadAllLists();
    expect(result.lists).toEqual([]);
    expect(result.error).toContain('Failed to read lists');
    expect(result.mode).toBe('idb');
    expect(window.localStorage.getItem(LISTS_STORAGE_KEY)).toBeNull();
  });

  it('falls back to legacy read when IndexedDB is unavailable and preserves the key', async () => {
    const legacy = [makeList('l1')];
    seedLegacy(legacy);
    idbOpenSpy.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const result = await loadAllLists();
    expect(result.mode).toBe('local-storage');
    expect(result.lists).toEqual(legacy);
    expect(window.localStorage.getItem(LISTS_STORAGE_KEY)).not.toBeNull();
  });
});
