import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus } from 'lucide-react';
import { useLists } from '../../contexts/ListsContext';
import { ListFormDialog } from '../list-form-dialog/ListFormDialog';
import { ListIcon } from '../../utils/listIcon';

interface SaveToListDialogProps {
  worldId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveToListDialog({
  worldId,
  open,
  onOpenChange,
}: SaveToListDialogProps) {
  const { t } = useTranslation();
  const {
    lists,
    isWorldInList,
    addWorldToList,
    removeWorldFromList,
    createList,
  } = useLists();
  const [showCreate, setShowCreate] = useState(false);

  if (!open) return null;

  const toggle = (listId: string) => {
    if (isWorldInList(worldId, listId)) {
      removeWorldFromList(listId, worldId);
    } else {
      addWorldToList(listId, worldId);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold dark:text-white">
              {t('lists.saveToList')}
            </h3>
            <button
              onClick={() => onOpenChange(false)}
              aria-label={t('common.close')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {lists.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              <p>{t('lists.noListsYet')}</p>
            </div>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {lists.map((list) => (
                <label
                  key={list.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={isWorldInList(worldId, list.id)}
                    onChange={() => toggle(list.id)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
                  />
                  <ListIcon
                    icon={list.icon}
                    color={list.color}
                    className="h-5 w-5 shrink-0"
                  />
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                    {list.name}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {list.worldIds.length}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="btn-ghost w-full gap-1.5 py-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('lists.createNewListInline')}
            </button>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => onOpenChange(false)}
              className="btn-primary px-3 py-1.5 text-xs"
            >
              {t('common.done')}
            </button>
          </div>
        </div>
      </div>
      <ListFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={(input) => {
          const list = createList(input);
          addWorldToList(list.id, worldId);
        }}
      />
    </>
  );
}
