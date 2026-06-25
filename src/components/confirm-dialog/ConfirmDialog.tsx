import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  showDontAskAgain?: boolean;
  dontAskAgainLabel?: string;
  onConfirm: (dontAskAgain: boolean) => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  showDontAskAgain = false,
  dontAskAgainLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const [dontAskAgain, setDontAskAgain] = useState(false);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-white/95 p-4 backdrop-blur-sm transition-opacity duration-200 ease-out dark:bg-slate-950/95"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button
            onClick={onCancel}
            aria-label={t('common.close')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{message}</p>

        {showDontAskAgain && (
          <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
            />
            {dontAskAgainLabel ?? t('common.dontAskAgain')}
          </label>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="btn-ghost px-3 py-1.5 text-xs">
            {cancelLabel ?? t('common.cancel')}
          </button>
          <button
            onClick={() => onConfirm(dontAskAgain)}
            className="btn-primary px-3 py-1.5 text-xs"
          >
            {confirmLabel ?? t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
