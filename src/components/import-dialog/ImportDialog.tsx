import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, FileJson, Loader2, AlertTriangle } from 'lucide-react';
import type { WorldList } from '../../types/lists';
import {
  buildImportPreview,
  parseLists,
  prepareImport,
  validateWorldIds,
  type ImportPreview,
} from '../../utils/listsImportExport';
import { ListIcon } from '../../utils/listIcon';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

interface ImportDialogProps {
  open: boolean;
  existingLists: WorldList[];
  onOpenChange: (open: boolean) => void;
  onImport: (lists: WorldList[], filename: string) => void;
}

type Phase = 'transfer' | 'preview' | 'error';

export function ImportDialog({
  open,
  existingLists,
  onOpenChange,
  onImport,
}: ImportDialogProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('transfer');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [errorKey, setErrorKey] = useState<string>('');
  const [removedWorldIds, setRemovedWorldIds] = useState<
    Map<string, string[]>
  >(new Map());
  const [totalRemoved, setTotalRemoved] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const reset = useCallback(() => {
    setPhase('transfer');
    setPreview(null);
    setFilename('');
    setErrorKey('');
    setRemovedWorldIds(new Map());
    setTotalRemoved(0);
    setDragActive(false);
    setIsValidating(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onOpenChange(false);
  }, [onOpenChange, reset]);

  useDialogFocus({ open, containerRef: dialogRef, onClose: handleClose });

  const processFile = useCallback(
    async (file: File) => {
      setFilename(file.name);
      let text: string;
      try {
        text = await file.text();
      } catch {
        setErrorKey('lists.importError.readFailed');
        setPhase('error');
        return;
      }
      const result = parseLists(text);
      if (result.error || !result.exportData) {
        setErrorKey(`lists.importError.${result.error}`);
        setPhase('error');
        return;
      }
      setIsValidating(true);
      try {
        const prepared = await prepareImport(
          result.exportData,
          file.name,
          validateWorldIds,
        );
        setRemovedWorldIds(prepared.removedWorldIds);
        setTotalRemoved(prepared.totalRemoved);
        setPreview(buildImportPreview(existingLists, prepared.lists));
        setPhase('preview');
      } catch {
        setErrorKey('lists.importError.unknown');
        setPhase('error');
      } finally {
        setIsValidating(false);
      }
    },
    [existingLists],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = '';
    },
    [processFile],
  );

  const handleImport = useCallback(() => {
    if (!preview) return;
    onImport(
      preview.items.map((item) => item.list),
      filename,
    );
    handleClose();
  }, [preview, onImport, filename, handleClose]);

  if (!open) return null;

  return (
    <div
      onClick={handleClose}
      className={stylex.props(styles.c1afui6d).className}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className={stylex.props(styles.c14gz0bj).className}
      >
        <div className={stylex.props(styles.cs7r2vk).className}>
          <h3 className={stylex.props(styles.ca9yw8g).className}>
            {phase === 'preview'
              ? t('lists.importPreview')
              : phase === 'error'
                ? t('lists.couldNotImport')
                : t('lists.transferYourLists')}
          </h3>
          <button
            onClick={handleClose}
            aria-label={t('common.close')}
            className={stylex.props(styles.cvjheld).className}
          >
            <X className={stylex.props(styles.c1kypdu7).className} />
          </button>
        </div>

        {phase === 'transfer' && (
          <>
            <p className={stylex.props(styles.cuks99r).className}>
              {t('lists.transferYourListsHint')}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={stylex.props(shared.btnSecondary, styles.c40lysn).className}
            >
              <Upload className={stylex.props(styles.c1ky5l8t).className} />
              {t('lists.importFromFile')}
            </button>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={[
                'rounded-xl border-2 border-dashed p-6 text-center text-sm transition',
                dragActive
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50',
                'text-slate-500 dark:text-slate-400',
              ].join(' ')}
            >
              {isValidating ? (
                <>
                  <Loader2 className={stylex.props(styles.cflrtis).className} />
                  <p>{t('lists.validatingWorlds')}</p>
                </>
              ) : (
                <>
                  <FileJson className={stylex.props(styles.c1b9vhei).className} />
                  <p>{t('lists.dragAndDropJson')}</p>
                </>
              )}
            </div>
          </>
        )}

        {phase === 'preview' && preview && (
          <>
            <p className={stylex.props(styles.c1biv05s).className}>
              {t('lists.importSummary', {
                new: preview.newCount,
                updated: preview.updatedCount,
                unchanged: preview.unchangedCount,
                worlds: preview.totalWorlds,
                removed: totalRemoved,
              })}
            </p>

            {totalRemoved > 0 && (
              <div className={stylex.props(styles.c1g37e10).className}>
                <AlertTriangle className={stylex.props(styles.c1521gle).className} />
                <p>
                  {t('lists.removedWorldsWarning', {
                    count: totalRemoved,
                  })}
                </p>
              </div>
            )}

            <div className={stylex.props(styles.c19115da).className}>
              {preview.items.map((item) => (
                <div
                  key={item.list.id}
                  className={stylex.props(styles.c4reyg2).className}
                >
                  <div
                    className={stylex.props(styles.c1u2ke4p).className}
                    style={{ backgroundColor: `${item.list.color}20` }}
                  >
                    <ListIcon
                      icon={item.list.icon}
                      color={item.list.color}
                      className={stylex.props(styles.c1ky5l8t).className}
                    />
                  </div>
                  <div className={stylex.props(styles.c1r022bi).className}>
                    <p className={stylex.props(styles.ca35a7z).className}>
                      {item.list.name}
                    </p>
                    <p className={stylex.props(styles.c6b0xl6).className}>
                      {t('lists.worldCount', {
                        count: item.list.worldIds.length,
                      })}
                      {removedWorldIds.has(item.list.id) &&
                        ` · ${t('lists.removedWorldsForList', {
                          count: removedWorldIds.get(item.list.id)?.length ?? 0,
                        })}`}
                    </p>
                  </div>
                  <span
                    className={[
                      'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                      item.status === 'new'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
                    ].join(' ')}
                  >
                    {item.status === 'new'
                      ? t('lists.importRowNew')
                      : t('lists.importRowUpdated')}
                  </span>
                </div>
              ))}
            </div>
            <div className={stylex.props(styles.c1f6wbgy).className}>
              <button
                onClick={handleClose}
                className={stylex.props(shared.btnGhost, styles.c1hozn4m).className}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleImport}
                className={stylex.props(shared.btnPrimary, styles.c1gbn6df).className}
              >
                {t('lists.importListsButton', {
                  count: preview.items.length,
                })}
              </button>
            </div>
          </>
        )}

        {phase === 'error' && (
          <>
            <p className={stylex.props(styles.c1w3ylu8).className}>
              {t('lists.invalidBackupDescription')}
            </p>
            <p className={stylex.props(styles.ck4pa24).className}>
              {t(errorKey || 'lists.importError.unknown')}
            </p>
            <div className={stylex.props(styles.c1f6wbgy).className}>
              <button
                onClick={handleClose}
                className={stylex.props(shared.btnGhost, styles.c1hozn4m).className}
              >
                {t('common.close')}
              </button>
              <button
                onClick={() => {
                  reset();
                  fileInputRef.current?.click();
                }}
                className={stylex.props(shared.btnPrimary, styles.c19xw58i).className}
              >
                <Upload className={stylex.props(styles.c1ky5l8t).className} />
                {t('lists.tryAnotherFile')}
              </button>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleInputChange}
          className={stylex.props(styles.c1ew92ne).className}
          aria-label={t('lists.importFromFile')}
        />
      </div>
    </div>
  );
}

const styles = stylex.create({
  c1afui6d: {
    "position": "fixed",
    "top": 0,
    "right": 0,
    "bottom": 0,
    "left": 0,
    "zIndex": 50,
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",
    "overflow": "auto",
    "backgroundColor": colors["--sos-bg-white_95-slate-950_95"],
    "padding": "1rem",
    "backdropFilter": "blur(4px)",
    "transitionProperty": "opacity",
    "transitionDuration": "0.2s",
    "transitionTimingFunction": "cubic-bezier(0, 0, 0.2, 1)",
  },
  c14gz0bj: {
    "width": "100%",
    "borderRadius": "0.75rem",
    "backgroundColor": colors["--sos-bg-white-slate-900"],
    "padding": "1.25rem",
    "boxShadow": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  cs7r2vk: {
    "marginBottom": "1rem",
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "space-between",
  },
  ca9yw8g: {
    "fontSize": "1rem",
    "lineHeight": "1.5rem",
    "fontWeight": 600,
    "color": colors["--sos-text-slate-900-white"],
  },
  cvjheld: {
    "display": "flex",
    "height": "2.75rem",
    "width": "2.75rem",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "0.5rem",
    "color": "#94a3b8",
    ":hover": {
      "color": colors["--sos-text-slate-600-slate-200"],
    },
  },
  c1kypdu7: {
    "height": "1.25rem",
    "width": "1.25rem",
  },
  cuks99r: {
    "marginBottom": "1rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c40lysn: {
    "marginBottom": "1rem",
    "width": "100%",
    "gap": "0.375rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
  },
  c1ky5l8t: {
    "height": "1rem",
    "width": "1rem",
  },
  cflrtis: {
    "marginLeft": "auto",
    "marginRight": "auto",
    "marginBottom": "0.5rem",
    "height": "1.5rem",
    "width": "1.5rem",
    "animation": "spin 1s linear infinite",
  },
  c1b9vhei: {
    "marginLeft": "auto",
    "marginRight": "auto",
    "marginBottom": "0.5rem",
    "height": "1.5rem",
    "width": "1.5rem",
  },
  c1biv05s: {
    "marginBottom": "0.75rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1g37e10: {
    "marginBottom": "0.75rem",
    "display": "flex",
    "alignItems": "flex-start",
    "gap": "0.5rem",
    "borderRadius": "0.5rem",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-amber-200-amber-900_50"],
    "backgroundColor": colors["--sos-bg-amber-50-amber-950_30"],
    "padding": "0.5rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-amber-800-amber-300"],
  },
  c1521gle: {
    "marginTop": "0.125rem",
    "height": "0.875rem",
    "width": "0.875rem",
  },
  c19115da: {
    "marginBottom": "1rem",
    "maxHeight": "14rem",
    "overflow": "auto",
    "paddingRight": "0.25rem",
  },
  c4reyg2: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.75rem",
    "borderRadius": "0.5rem",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-200-slate-700"],
    "padding": "0.5rem",
  },
  c1u2ke4p: {
    "display": "flex",
    "height": "2rem",
    "width": "2rem",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "0.375rem",
  },
  c1r022bi: {
    "minWidth": "0",
    "flex": 1,
  },
  ca35a7z: {
    "overflow": "hidden",
    "textOverflow": "ellipsis",
    "whiteSpace": "nowrap",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 500,
    "color": colors["--sos-text-slate-900-white"],
  },
  c6b0xl6: {
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1f6wbgy: {
    "display": "flex",
    "justifyContent": "flex-end",
    "gap": "0.5rem",
  },
  c1hozn4m: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
  },
  c1gbn6df: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
  },
  c1w3ylu8: {
    "marginBottom": "0.75rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-600-slate-300"],
  },
  ck4pa24: {
    "marginBottom": "1rem",
    "borderRadius": "0.5rem",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-red-200-red-900_50"],
    "backgroundColor": colors["--sos-bg-red-50-red-950_30"],
    "padding": "0.75rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-red-700-red-300"],
  },
  c19xw58i: {
    "gap": "0.375rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
  },
  c1ew92ne: {
    "display": "none",
  },
});
