import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadLists, saveLists, createList } from './listsStorage';

beforeEach(() => {
  window.localStorage.clear();
  vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('00000000-0000-0000-0000-000000000001');
});

describe('loadLists', () => {
  it('returns empty lists when storage is empty', () => {
    expect(loadLists()).toEqual({ lists: [], error: null });
  });

  it('loads versioned lists', () => {
    const snapshot = {
      version: 1,
      lists: [
        {
          id: 'l1',
          name: 'Favorites',
          icon: null,
          color: '#4f46e5',
          worldIds: ['wrld_1'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    };
    window.localStorage.setItem('sos-world-lists', JSON.stringify(snapshot));
    expect(loadLists()).toEqual({ lists: snapshot.lists, error: null });
  });

  it('migrates an unversioned array', () => {
    const lists = [
      {
        id: 'l1',
        name: 'Old',
        icon: 'Star',
        color: '#fff',
        worldIds: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];
    window.localStorage.setItem('sos-world-lists', JSON.stringify(lists));
    expect(loadLists()).toEqual({ lists, error: null });
  });

  it('returns an error when storage is corrupted', () => {
    window.localStorage.setItem('sos-world-lists', 'not-json');
    const result = loadLists();
    expect(result.lists).toEqual([]);
    expect(result.error).toContain('Failed to read lists');
  });
});

describe('saveLists', () => {
  it('writes a versioned snapshot', () => {
    const lists = [createList({ name: 'Favorites' })];
    expect(saveLists(lists)).toEqual({ error: null });
    expect(JSON.parse(window.localStorage.getItem('sos-world-lists')!).version).toBe(1);
  });

  it('returns an error on quota exceeded', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(saveLists([createList({ name: 'Favorites' })])).toEqual({
      error: 'QuotaExceededError',
    });
  });
});

describe('createList', () => {
  it('creates a list with defaults', () => {
    const list = createList({ name: 'Date spots' });
    expect(list.name).toBe('Date spots');
    expect(list.icon).toBeNull();
    expect(list.color).toBe('#4f46e5');
    expect(list.worldIds).toEqual([]);
    expect(list.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('stores a trimmed memo', () => {
    const list = createList({ name: 'Date spots', memo: '  cozy worlds  ' });
    expect(list.memo).toBe('cozy worlds');
  });

  it('stores null when memo is absent or blank', () => {
    expect(createList({ name: 'A' }).memo).toBeNull();
    expect(createList({ name: 'B', memo: '' }).memo).toBeNull();
    expect(createList({ name: 'C', memo: '   ' }).memo).toBeNull();
  });
});
