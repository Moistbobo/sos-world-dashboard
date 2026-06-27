import { describe, it, expect, vi } from 'vitest';
import {
  serializeLists,
  makeExportFilename,
  slugifyListName,
  parseLists,
  buildImportPreview,
  mergeListsById,
  downloadJson,
  MAX_IMPORT_FILE_SIZE_BYTES,
} from './listsImportExport';

const sampleList = {
  id: 'l1',
  name: 'Favorites',
  icon: null,
  color: '#4f46e5',
  worldIds: ['wrld_1'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('serializeLists', () => {
  it('produces a versioned JSON snapshot', () => {
    const json = serializeLists([sampleList]);
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.lists).toEqual([sampleList]);
    expect(typeof parsed.exportedAt).toBe('string');
  });
});

describe('makeExportFilename', () => {
  it('uses the sosd-name-timestamp pattern', () => {
    expect(makeExportFilename('all-lists', 1751116800000)).toBe(
      'sosd-all-lists-1751116800000.json',
    );
  });

  it('slugifies names with spaces and special characters', () => {
    expect(makeExportFilename('My Favorites!', 1)).toBe(
      'sosd-my-favorites-1.json',
    );
  });
});

describe('slugifyListName', () => {
  it('sanitizes names for safe filenames', () => {
    expect(slugifyListName('Date Spots 🌙')).toBe('date-spots');
    expect(slugifyListName('  My--List!! ')).toBe('my-list');
  });
});

describe('parseLists', () => {
  it('accepts a valid snapshot', () => {
    const json = JSON.stringify({ version: 1, lists: [sampleList] });
    const result = parseLists(json);
    expect(result.error).toBeNull();
    expect(result.exportData?.lists).toHaveLength(1);
  });

  it('rejects malformed json', () => {
    expect(parseLists('not json').error).toBe('invalidJson');
  });

  it('rejects missing version', () => {
    expect(
      parseLists(JSON.stringify({ lists: [sampleList] })).error,
    ).toBe('missingVersionOrLists');
  });

  it('rejects unsupported version', () => {
    expect(
      parseLists(JSON.stringify({ version: 99, lists: [sampleList] })).error,
    ).toBe('unsupportedSchemaVersion');
  });

  it('rejects oversized files', () => {
    const big = JSON.stringify({
      version: 1,
      lists: [{ ...sampleList, name: 'x'.repeat(MAX_IMPORT_FILE_SIZE_BYTES) }],
    });
    expect(parseLists(big).error).toBe('fileTooLarge');
  });

  it('filters invalid lists', () => {
    const json = JSON.stringify({
      version: 1,
      lists: [sampleList, { id: 'bad', worldIds: [] }],
    });
    const result = parseLists(json);
    expect(result.exportData?.lists).toHaveLength(1);
  });

  it('errors when no valid lists remain', () => {
    const json = JSON.stringify({ version: 1, lists: [{ id: 'bad' }] });
    expect(parseLists(json).error).toBe('noValidLists');
  });
});

describe('buildImportPreview', () => {
  it('counts new and updated lists', () => {
    const newList = { ...sampleList, id: 'l2', worldIds: ['wrld_2', 'wrld_3'] };
    const preview = buildImportPreview([sampleList], [sampleList, newList]);
    expect(preview.newCount).toBe(1);
    expect(preview.updatedCount).toBe(1);
    expect(preview.unchangedCount).toBe(0);
    expect(preview.totalWorlds).toBe(3);
  });
});

describe('mergeListsById', () => {
  it('overwrites existing and appends new', () => {
    const newList = { ...sampleList, id: 'l2', name: 'New' };
    const merged = mergeListsById([sampleList], [
      { ...sampleList, name: 'Updated' },
      newList,
    ]);
    expect(merged).toHaveLength(2);
    expect(merged.find((l) => l.id === 'l1')?.name).toBe('Updated');
    expect(merged.find((l) => l.id === 'l2')).toBeDefined();
  });
});

describe('downloadJson', () => {
  it('creates a temporary download link', () => {
    const createObjectURL = vi.fn(() => 'blob:mock');
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    const click = vi.fn();
    const link = { click, href: '', download: '' };
    vi.spyOn(document, 'createElement').mockReturnValue(
      link as unknown as HTMLAnchorElement,
    );
    vi.spyOn(document.body, 'appendChild').mockImplementation(
      () => null as unknown as Node,
    );
    vi.spyOn(document.body, 'removeChild').mockImplementation(
      () => null as unknown as Node,
    );

    downloadJson('test.json', '{"a":1}');

    expect(createObjectURL).toHaveBeenCalled();
    expect(link.download).toBe('test.json');
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });
});
