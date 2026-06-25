import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  Pencil,
  XCircle,
  List,
} from 'lucide-react';
import { useLists } from '../../contexts/ListsContext';
import { ListFormDialog } from '../../components/list-form-dialog/ListFormDialog';
import { ListIcon } from '../../utils/listIcon';
import { useWorldsByIds } from '../../hooks/useWorldsByIds';

export function ListDetailPage({
  listId: listIdProp,
}: {
  listId?: string;
} = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { listId: paramListId } = useParams<{ listId: string }>();
  const listId = listIdProp ?? paramListId;
  const { getList, updateList, deleteList, removeWorldFromList } = useLists();
  const list = listId ? getList(listId) : undefined;
  const { worlds, isPending } = useWorldsByIds(list?.worldIds ?? []);
  const [formOpen, setFormOpen] = useState(false);

  if (!list) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost gap-1.5 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </button>
        <div className="card p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {t('lists.listNotFound')}
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(t('lists.deleteConfirm', { name: list.name }))) {
      deleteList(list.id);
      navigate('/lists');
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="btn-ghost gap-1.5 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> {t('common.back')}
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${list.color}20` }}
          >
            <ListIcon icon={list.icon} color={list.color} className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {list.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('lists.worldCount', { count: list.worldIds.length })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFormOpen(true)}
            className="btn-secondary gap-1.5 text-xs"
          >
            <Pencil className="h-3.5 w-3.5" /> {t('common.edit')}
          </button>
          <button
            onClick={handleDelete}
            className="btn-ghost gap-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-3.5 w-3.5" /> {t('common.delete')}
          </button>
        </div>
      </div>

      {list.worldIds.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <List className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p>{t('lists.emptyDetailTitle')}</p>
          <p>{t('lists.emptyDetailSubtitle')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {isPending && worlds.every((w) => !w.data) ? (
            <div className="card h-20 animate-pulse bg-slate-200 dark:bg-slate-800" />
          ) : (
            worlds.map((entry) => (
              <div
                key={entry.worldId}
                className="card flex items-center justify-between p-4"
              >
                <div className="min-w-0 flex-1">
                  {entry.data ? (
                    <>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {entry.data.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('common.byAuthor', {
                          author: entry.data.authorName || t('common.unknown'),
                        })}{' '}
                        · {entry.worldId}
                      </p>
                    </>
                  ) : entry.isError ? (
                    <>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {entry.worldId}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-300">
                        {t('lists.loadWorldError')}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {entry.worldId}
                    </p>
                  )}
                </div>
                <button
                  onClick={() =>
                    removeWorldFromList(list.id, entry.worldId)
                  }
                  className="btn-ghost gap-1.5 text-xs"
                  aria-label={t('lists.removeWorld')}
                >
                  <XCircle className="h-3.5 w-3.5" /> {t('lists.remove')}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <ListFormDialog
        open={formOpen}
        list={list}
        onOpenChange={setFormOpen}
        onSubmit={(input) => updateList(list.id, input)}
      />
    </div>
  );
}
