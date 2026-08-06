import { fetchWorldsByIds } from '../api/client';
import type { WorldList } from '../types/lists';

export const EXPORT_SCHEMA_VERSION = 1;
export const SUPPORTED_SCHEMA_VERSIONS = [1];
export const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export interface ListsExport {
  version: number;
  exportedAt: string;
  lists: WorldList[];
}

export interface ImportPreviewItem {
  list: WorldList;
  status: 'new' | 'updated';
}

export interface ImportPreview {
  newCount: number;
  updatedCount: number;
  unchangedCount: number;
  totalWorlds: number;
  items: ImportPreviewItem[];
}

export interface ParsedImport {
  lists: WorldList[];
  removedWorldIds: Map<string, string[]>;
  totalRemoved: number;
  filename: string;
}

export async function prepareImport(
  result: ListsExport,
  filename: string,
  validator: (ids: string[]) => Promise<string[]> = validateWorldIds,
): Promise<ParsedImport> {
  const removedWorldIds = new Map<string, string[]>();
  let totalRemoved = 0;

  const lists: WorldList[] = [];
  for (const list of result.lists) {
    const validIds = await validator(list.worldIds);
    const removed = list.worldIds.filter((id) => !validIds.includes(id));
    if (removed.length) {
      removedWorldIds.set(list.id, removed);
      totalRemoved += removed.length;
    }
    lists.push({ ...list, worldIds: validIds });
  }

  return { lists, removedWorldIds, totalRemoved, filename };
}

export interface ImportParseResult {
  exportData: ListsExport | null;
  error: string | null;
}

export async function validateWorldIds(worldIds: string[]): Promise<string[]> {
  if (worldIds.length === 0) return [];
  try {
    const worlds = await fetchWorldsByIds(worldIds);
    const validIds = new Set(worlds.map((w) => w.worldId));
    return worldIds.filter((id) => validIds.has(id));
  } catch (err) {
    // If the API is unreachable, preserve all IDs rather than silently deleting data.
    console.warn('validateWorldIds failed, preserving all world IDs', err);
    return worldIds;
  }
}

export function serializeLists(lists: WorldList[]): string {
  const data: ListsExport = {
    version: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    lists,
  };
  return JSON.stringify(data, null, 2);
}

export function makeExportFilename(
  listName: string,
  timestamp = Date.now(),
): string {
  return `sosd-${slugifyListName(listName)}-${timestamp}.json`;
}

export function slugifyListName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export function downloadJson(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function validateWorldList(value: unknown): WorldList | null {
  if (!value || typeof value !== 'object') return null;
  const obj = value as Record<string, unknown>;
  if (typeof obj.id !== 'string' || !obj.id.trim()) return null;
  if (typeof obj.name !== 'string' || !obj.name.trim()) return null;
  if (!Array.isArray(obj.worldIds)) return null;
  if (obj.worldIds.some((id) => typeof id !== 'string')) return null;
  return {
    id: obj.id.trim(),
    name: obj.name.trim(),
    icon: typeof obj.icon === 'string' ? obj.icon.trim() || null : null,
    color:
      typeof obj.color === 'string' && obj.color.trim()
        ? obj.color.trim()
        : '#4f46e5',
    memo: typeof obj.memo === 'string' ? obj.memo.trim() || null : null,
    worldIds: obj.worldIds.filter(
      (id): id is string => typeof id === 'string',
    ),
    createdAt:
      typeof obj.createdAt === 'string'
        ? obj.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof obj.updatedAt === 'string'
        ? obj.updatedAt
        : new Date().toISOString(),
  };
}

export function parseLists(
  contents: string,
  maxBytes = MAX_IMPORT_FILE_SIZE_BYTES,
): ImportParseResult {
  if (new Blob([contents]).size > maxBytes) {
    return { exportData: null, error: 'fileTooLarge' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    return { exportData: null, error: 'invalidJson' };
  }
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !('version' in parsed) ||
    !('lists' in parsed)
  ) {
    return { exportData: null, error: 'missingVersionOrLists' };
  }
  const data = parsed as {
    version: unknown;
    lists: unknown;
    exportedAt?: unknown;
  };
  if (
    typeof data.version !== 'number' ||
    !SUPPORTED_SCHEMA_VERSIONS.includes(data.version)
  ) {
    return { exportData: null, error: 'unsupportedSchemaVersion' };
  }
  if (!Array.isArray(data.lists)) {
    return { exportData: null, error: 'listsNotArray' };
  }
  const validated = data.lists
    .map(validateWorldList)
    .filter((l): l is WorldList => l !== null);
  if (validated.length === 0) {
    return { exportData: null, error: 'noValidLists' };
  }
  return {
    exportData: {
      version: data.version,
      exportedAt:
        typeof data.exportedAt === 'string'
          ? data.exportedAt
          : new Date().toISOString(),
      lists: validated,
    },
    error: null,
  };
}

export function buildImportPreview(
  existing: WorldList[],
  incoming: WorldList[],
): ImportPreview {
  const existingById = new Map(existing.map((l) => [l.id, l]));
  let newCount = 0;
  let updatedCount = 0;
  let totalWorlds = 0;
  const items: ImportPreviewItem[] = [];
  for (const list of incoming) {
    totalWorlds += list.worldIds.length;
    if (existingById.has(list.id)) {
      updatedCount++;
      items.push({ list, status: 'updated' });
    } else {
      newCount++;
      items.push({ list, status: 'new' });
    }
  }
  const unchangedCount = existing.length - updatedCount;
  return { newCount, updatedCount, unchangedCount, totalWorlds, items };
}

export function mergeListsById(
  existing: WorldList[],
  incoming: WorldList[],
): WorldList[] {
  const now = new Date().toISOString();
  const merged = [...existing];
  for (const incomingList of incoming) {
    const index = merged.findIndex((l) => l.id === incomingList.id);
    if (index >= 0) {
      merged[index] = {
        ...incomingList,
        createdAt: merged[index].createdAt,
        updatedAt: now,
      };
    } else {
      merged.push({ ...incomingList, updatedAt: now });
    }
  }
  return merged;
}
