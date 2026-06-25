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
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { CreateListInput, WorldList } from '../types/lists';
import {
  createList as makeList,
  loadLists,
  saveLists,
} from '../utils/listsStorage';

interface ListsContextValue {
  lists: WorldList[];
  error: string | null;
  createList(input: CreateListInput): WorldList;
  updateList(id: string, input: Partial<CreateListInput>): WorldList | undefined;
  deleteList(id: string): boolean;
  addWorldToList(listId: string | undefined, worldId: string): void;
  removeWorldFromList(listId: string | undefined, worldId: string): void;
  isWorldInList(worldId: string, listId: string): boolean;
  isWorldInAnyList(worldId: string): boolean;
  getList(listId: string): WorldList | undefined;
  clearError(): void;
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

export function ListsProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
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
        toast.error(t('lists.storageError'));
      } else if (error) {
        setError(null);
      }
      setLists(nextLists);
    },
    [t, error],
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
    (listId: string | undefined, worldId: string) => {
      if (!listId) return;
      const next = listsRef.current.map((list) =>
        list.id === listId && !list.worldIds.includes(worldId)
          ? {
              ...list,
              worldIds: [...list.worldIds, worldId],
              updatedAt: nowIso(),
            }
          : list,
      );
      commit(next);
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

  const isWorldInList = useCallback(
    (worldId: string, listId: string) =>
      lists.some(
        (list) => list.id === listId && list.worldIds.includes(worldId),
      ),
    [lists],
  );

  const isWorldInAnyList = useCallback(
    (worldId: string) => lists.some((list) => list.worldIds.includes(worldId)),
    [lists],
  );

  const getList = useCallback(
    (listId: string) => lists.find((list) => list.id === listId),
    [lists],
  );

  const clearError = useCallback(() => setError(null), []);

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
    ],
  );

  return (
    <ListsContext.Provider value={value}>{children}</ListsContext.Provider>
  );
}
