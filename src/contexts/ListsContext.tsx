import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { CreateListInput, WorldList } from '../types/lists';
import {
  createList as makeList,
  loadLists,
  saveLists,
} from '../utils/listsStorage';
import {
  downloadJson,
  makeExportFilename,
  mergeListsById,
  serializeLists,
} from '../utils/listsImportExport';

export type AddWorldResult =
  | { ok: true }
  | { ok: false; reason: 'missing' | 'not-found' | 'max-reached' | 'already-added' };

export type ImportResult = { ok: true } | { ok: false; error: string };

interface ListsContextValue {
  lists: WorldList[];
  error: string | null;
  createList(input: CreateListInput): WorldList;
  updateList(id: string, input: Partial<CreateListInput>): WorldList | undefined;
  deleteList(id: string): boolean;
  addWorldToList(listId: string | undefined, worldId: string): AddWorldResult;
  removeWorldFromList(listId: string | undefined, worldId: string): void;
  isWorldInList(worldId: string, listId: string): boolean;
  isWorldInAnyList(worldId: string): boolean;
  getList(listId: string): WorldList | undefined;
  clearError(): void;
  exportList(list: WorldList): void;
  importLists(lists: WorldList[]): ImportResult;
}

const ListsContext = createContext<ListsContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useLists() {
  const ctx = useContext(ListsContext);
  if (!ctx) throw new Error('useLists must be used within ListsProvider');
  return ctx;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const MAX_WORLDS_PER_LIST = 250;

export function ListsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<WorldList[]>(() => loadLists().lists);
  const [error, setError] = useState<string | null>(() => loadLists().error);
  const listsRef = useRef(lists);

  useEffect(() => {
    listsRef.current = lists;
  }, [lists]);

  const commit = useCallback(
    (nextLists: WorldList[]) => {
      listsRef.current = nextLists;
      const { error: saveError } = saveLists(nextLists);
      if (saveError) {
        setError(saveError);
      } else if (error) {
        setError(null);
      }
      setLists(nextLists);
      return saveError;
    },
    [error],
  );

  const createList = useCallback(
    (input: CreateListInput) => {
      const list = makeList(input);
      commit([...listsRef.current, list]);
      return list;
    },
    [commit],
  );

  const updateList = useCallback(
    (id: string, input: Partial<CreateListInput>) => {
      let updated: WorldList | undefined;
      const next = listsRef.current.map((list) => {
        if (list.id !== id) return list;
        updated = {
          ...list,
          name: input.name?.trim() ?? list.name,
          icon:
            input.icon === undefined
              ? list.icon
              : input.icon?.trim() || null,
          color: input.color?.trim() ?? list.color,
          updatedAt: nowIso(),
        };
        return updated;
      });
      commit(next);
      return updated;
    },
    [commit],
  );

  const deleteList = useCallback(
    (id: string) => {
      const next = listsRef.current.filter((list) => list.id !== id);
      const removed = next.length !== listsRef.current.length;
      if (removed) {
        commit(next);
      }
      return removed;
    },
    [commit],
  );

  const addWorldToList = useCallback(
    (listId: string | undefined, worldId: string): AddWorldResult => {
      if (!listId || !worldId.trim()) return { ok: false, reason: 'missing' };
      const list = listsRef.current.find((l) => l.id === listId);
      if (!list) return { ok: false, reason: 'not-found' };
      if (list.worldIds.length >= MAX_WORLDS_PER_LIST) {
        return { ok: false, reason: 'max-reached' };
      }
      if (list.worldIds.includes(worldId)) return { ok: false, reason: 'already-added' };
      const next = listsRef.current.map((l) =>
        l.id === listId
          ? { ...l, worldIds: [...l.worldIds, worldId], updatedAt: nowIso() }
          : l,
      );
      commit(next);
      return { ok: true };
    },
    [commit],
  );

  const removeWorldFromList = useCallback(
    (listId: string | undefined, worldId: string) => {
      if (!listId) return;
      const next = listsRef.current.map((list) =>
        list.id === listId
          ? {
              ...list,
              worldIds: list.worldIds.filter((id) => id !== worldId),
              updatedAt: nowIso(),
            }
          : list,
      );
      commit(next);
    },
    [commit],
  );

  const worldIdSet = useMemo(() => {
    const set = new Set<string>();
    for (const list of lists) {
      for (const worldId of list.worldIds) {
        set.add(worldId);
      }
    }
    return set;
  }, [lists]);

  const isWorldInList = useCallback(
    (worldId: string, listId: string) =>
      lists.some(
        (list) => list.id === listId && list.worldIds.includes(worldId),
      ),
    [lists],
  );

  const isWorldInAnyList = useCallback(
    (worldId: string) => worldIdSet.has(worldId),
    [worldIdSet],
  );

  const getList = useCallback(
    (listId: string) => lists.find((list) => list.id === listId),
    [lists],
  );

  const clearError = useCallback(() => setError(null), []);

  const exportList = useCallback((list: WorldList) => {
    const content = serializeLists([list]);
    const filename = makeExportFilename(list.name);
    downloadJson(filename, content);
  }, []);

  const importLists = useCallback(
    (incoming: WorldList[]): ImportResult => {
      const next = mergeListsById(listsRef.current, incoming);
      const saveError = commit(next);
      if (saveError) {
        return { ok: false, error: saveError };
      }
      return { ok: true };
    },
    [commit],
  );

  const value = useMemo(
    () => ({
      lists,
      error,
      createList,
      updateList,
      deleteList,
      addWorldToList,
      removeWorldFromList,
      isWorldInList,
      isWorldInAnyList,
      getList,
      clearError,
      exportList,
      importLists,
    }),
    [
      lists,
      error,
      createList,
      updateList,
      deleteList,
      addWorldToList,
      removeWorldFromList,
      isWorldInList,
      isWorldInAnyList,
      getList,
      clearError,
      exportList,
      importLists,
    ],
  );

  return (
    <ListsContext.Provider value={value}>{children}</ListsContext.Provider>
  );
}
