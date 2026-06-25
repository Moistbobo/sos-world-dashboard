import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useMatch } from 'react-router-dom';
import { Plus, Trash2, Pencil, List } from 'lucide-react';
import { useLists } from '../../contexts/ListsContext';
import { ListFormDialog } from '../../components/list-form-dialog/ListFormDialog';
import { ListIcon } from '../../utils/listIcon';
import { ListDetailPage } from '../list-detail';

export function ListsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lists, error, createList, updateList, deleteList, clearError } =
    useLists();
  const [formOpen, setFormOpen] = useState(false);
  const [editingList, setEditingList] = useState(
    undefined as ReturnType<typeof useLists>['lists'][number] | undefined,
  );

  const detailMatch = useMatch('/lists/:listId');
  const [renderedListId, setRenderedListId] = useState<
    string | undefined
  >(undefined);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isOverlayClosing, setIsOverlayClosing] = useState(false);

  const currentListId = detailMatch?.params.listId;
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentListId) {
      setRenderedListId(currentListId);
      setIsOverlayClosing(false);
      setIsOverlayOpen(true);
    } else if (isOverlayOpen && !isOverlayClosing) {
      setIsOverlayClosing(true);
      closeTimerRef.current = setTimeout(() => {
        setRenderedListId(undefined);
        setIsOverlayOpen(false);
        setIsOverlayClosing(false);
      }, 200);
    }

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [currentListId, isOverlayOpen, isOverlayClosing]);

  const closeOverlay = () => {
    if (isOverlayClosing) return;
    setIsOverlayClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setRenderedListId(undefined);
      setIsOverlayOpen(false);
      setIsOverlayClosing(false);
    }, 200);
  };

  const handleEdit = (
    list: ReturnType<typeof useLists>['lists'][number] | undefined,
  ) => {
    setEditingList(list);
    setFormOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(t('lists.deleteConfirm', { name }))) {
      deleteList(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('lists.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('lists.subtitle')}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingList(undefined);
            setFormOpen(true);
          }}
          className="btn-primary gap-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('lists.newList')}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">
          {t('lists.storageErrorMessage', { message: error })}
          <button onClick={clearError} className="ml-2 underline">
            {t('common.dismiss')}
          </button>
        </div>
      )}

      {lists.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <List className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p>{t('lists.emptyTitle')}</p>
          <p>{t('lists.emptySubtitle')}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {lists.map((list) => (
            <div
              key={list.id}
              onClick={() => navigate(`/lists/${list.id}`)}
              className="card flex cursor-pointer items-center gap-3 p-4 transition hover:border-slate-400 dark:hover:border-slate-600"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${list.color}20` }}
              >
                <ListIcon
                  icon={list.icon}
                  color={list.color}
                  className="h-5 w-5"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {list.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('lists.worldCount', { count: list.worldIds.length })} ·{' '}
                  {t('lists.updated', {
                    date: new Date(list.updatedAt).toLocaleDateString(),
                  })}
                </p>
              </div>
              <div
                className="flex shrink-0 gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleEdit(list)}
                  className="btn-ghost p-1.5 text-xs"
                  aria-label={t('lists.editList')}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(list.id, list.name)}
                  className="btn-ghost p-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  aria-label={t('lists.deleteList')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ListFormDialog
        open={formOpen}
        list={editingList}
        onOpenChange={setFormOpen}
        onSubmit={(input) => {
          if (editingList) {
            updateList(editingList.id, input);
          } else {
            createList(input);
          }
        }}
      />

      {(renderedListId || isOverlayOpen) && (
        <div
          onClick={closeOverlay}
          className={`fixed inset-0 z-50 overflow-auto bg-white/95 p-4 backdrop-blur-sm transition-opacity duration-200 ease-out dark:bg-slate-950/95 lg:p-6 ${
            isOverlayClosing
              ? 'pointer-events-none opacity-0'
              : 'opacity-100 animate-fadeIn'
          }`}
          aria-hidden={isOverlayClosing ? 'true' : 'false'}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mx-auto max-w-3xl"
          >
            <ListDetailPage listId={renderedListId} />
          </div>
        </div>
      )}
    </div>
  );
}
