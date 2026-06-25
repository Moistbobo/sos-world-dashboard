import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { CreateListInput, WorldList } from '../../types/lists';

interface ListFormDialogProps {
  open: boolean;
  list?: WorldList;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateListInput) => void;
}

export function ListFormDialog({
  open,
  list,
  onOpenChange,
  onSubmit,
}: ListFormDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(list?.name ?? '');
  const [icon, setIcon] = useState(list?.icon ?? '');
  const [color, setColor] = useState(list?.color ?? '#4f46e5');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(list?.name ?? '');
    setIcon(list?.icon ?? '');
    setColor(list?.color ?? '#4f46e5');
    setError(null);
  }, [open, list]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('lists.nameRequired'));
      return;
    }
    onSubmit({ name: trimmed, icon: icon.trim() || null, color });
    onOpenChange(false);
  };

  const isEdit = Boolean(list);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold dark:text-white">
            {isEdit ? t('lists.editList') : t('lists.newList')}
          </h3>
          <button
            onClick={() => onOpenChange(false)}
            aria-label={t('common.close')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="list-name"
              className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              {t('lists.listName')}
            </label>
            <input
              id="list-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder={t('lists.listNamePlaceholder')}
            />
          </div>
          <div>
            <label
              htmlFor="list-icon"
              className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              {t('lists.listIcon')}
            </label>
            <input
              id="list-icon"
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="input w-full"
              placeholder={t('lists.listIconPlaceholder')}
            />
            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
              {t('lists.listIconHint')}
            </p>
          </div>
          <div>
            <label
              htmlFor="list-color"
              className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              {t('lists.listColor')}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="list-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-9 cursor-pointer rounded border border-slate-300 bg-transparent p-0.5 dark:border-slate-700"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {color}
              </span>
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary px-3 py-1.5 text-xs">
              {isEdit ? t('common.save') : t('lists.createList')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
