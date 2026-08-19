import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, List, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useLists } from '../../contexts/ListsContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ListFormDialog } from '../../components/list-form-dialog/ListFormDialog';
import { ImportDialog } from '../../components/import-dialog';
import { ConfirmDialog } from '../../components/confirm-dialog';
import type { WorldList } from '../../types/lists';
import { ListIcon } from '../../utils/listIcon';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

export function ListsPage() {
  const { t } = useTranslation();
  usePageTitle(t('lists.title'));
  const navigate = useNavigate();
  const {
    lists,
    error,
    isHydrated,
    createList,
    updateList,
    deleteList,
    clearError,
    exportList,
    importLists,
  } = useLists();
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingList, setEditingList] = useState(
    undefined as ReturnType<typeof useLists>['lists'][number] | undefined,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleEdit = (
    list: ReturnType<typeof useLists>['lists'][number] | undefined,
  ) => {
    setEditingList(list);
    setFormOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setPendingDelete({ id, name });
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      deleteList(pendingDelete.id);
    }
    setPendingDelete(null);
    setConfirmOpen(false);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
    setConfirmOpen(false);
  };

  const handleExport = useCallback(
    (e: React.MouseEvent, list: WorldList) => {
      e.stopPropagation();
      exportList(list);
    },
    [exportList],
  );

  const handleImport = useCallback(
    (incoming: WorldList[], filename: string) => {
      const result = importLists(incoming);
      if (result.ok) {
        toast.success(
          t('lists.importSuccess', {
            lists: incoming.length,
            worlds: incoming.reduce((sum, list) => sum + list.worldIds.length, 0),
            filename,
          }),
        );
      }
    },
    [importLists, t],
  );

  return (
    <div className={stylex.props(styles.stack4).className}>
      <div className={stylex.props(styles.cxc8ak4).className}>
        <div>
          <h1 className={stylex.props(styles.c1lp0kv9).className}>
            <span>{t('lists.title')}</span>
            <span
              data-testid="list-count"
              className={stylex.props(styles.c18lz1d0).className}
            >
              {t('lists.listCount', { count: lists.length })}
            </span>
          </h1>
          <p className={stylex.props(styles.c1xmut6z).className}>
            {t('lists.subtitle')}
          </p>
        </div>
        <div className={stylex.props(styles.c2ca09w).className}>
          <button
            onClick={() => setImportOpen(true)}
            className={stylex.props(shared.btnSecondary, styles.cdlocnk).className}
          >
            <Upload className={stylex.props(styles.c1ky5l8t).className} />
            {t('lists.importLists')}
          </button>
          <button
            onClick={() => {
              setEditingList(undefined);
              setFormOpen(true);
            }}
            className={stylex.props(shared.btnPrimary, styles.c19xw58i).className}
            aria-label={t('lists.newList')}
          >
            <Plus className={stylex.props(styles.c1ky5l8t).className} />
            {t('lists.newList')}
          </button>
        </div>
      </div>

      {!isHydrated ? (
        <div className={stylex.props(styles.cl3wdzx).className} aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={stylex.props(shared.card, styles.c1j7sf2k).className}>
              <div className={stylex.props(styles.c1e6iu76).className} />
              <div className={stylex.props(styles.c1pa4dxw).className}>
                <div className={stylex.props(styles.c1fbwq8c).className} />
                <div className={stylex.props(styles.c1dbpxn2).className} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <h2 className={stylex.props(styles.c1gy9eiv).className}>
            {t('lists.listsSection')}
          </h2>

          {error && (
            <div className={stylex.props(styles.c14gva1v).className}>
              {t('lists.storageErrorMessage', { message: error })}
              <button onClick={clearError} className={stylex.props(styles.c1127rjk).className}>
                {t('common.dismiss')}
              </button>
            </div>
          )}

          {lists.length === 0 ? (
            <div className={stylex.props(shared.card, styles.cgj8p3f).className}>
              <List className={stylex.props(styles.c16zf3zb).className} />
              <p>{t('lists.emptyTitle')}</p>
              <p>{t('lists.emptySubtitle')}</p>
              <button
                onClick={() => {
                  setEditingList(undefined);
                  setFormOpen(true);
                }}
                className={stylex.props(shared.btnPrimary, styles.c15tho).className}
              >
                <Plus className={stylex.props(styles.c1ky5l8t).className} />
                {t('lists.createFirstList')}
              </button>
            </div>
          ) : (
            <div className={stylex.props(styles.cl3wdzx).className}>
              {lists.map((list) => (
            <div
              key={list.id}
              onClick={() => navigate(`/lists/${list.id}`)}
              className={stylex.props(shared.card, styles.cyiv8jm).className}
            >
              <div
                className={stylex.props(styles.cctc87d).className}
                style={{ backgroundColor: `${list.color}20` }}
              >
                <ListIcon
                  icon={list.icon}
                  color={list.color}
                  className={stylex.props(styles.c1kypdu7).className}
                />
              </div>
              <div className={stylex.props(styles.c1r022bi).className}>
                <p className={stylex.props(styles.c1j7zf41).className}>
                  {list.name}
                </p>
                {list.memo && (
                  <p className={stylex.props(styles.c1maj4j9).className}>
                    {list.memo}
                  </p>
                )}
                <p className={stylex.props(styles.c6b0xl6).className}>
                  {t('lists.worldCount', { count: list.worldIds.length })} ·{' '}
                  {t('lists.updated', {
                    date: new Date(list.updatedAt).toLocaleDateString(),
                  })}
                </p>
              </div>
              <div
                className={stylex.props(styles.c1pzc2fh).className}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => handleExport(e, list)}
                  className={stylex.props(shared.btnGhost, styles.cqo2b3o).className}
                  aria-label={t('lists.exportList')}
                >
                  <Download className={stylex.props(styles.c1ky5l8t).className} />
                </button>
                <button
                  onClick={() => handleEdit(list)}
                  className={stylex.props(shared.btnGhost, styles.cqo2b3o).className}
                  aria-label={t('lists.editList')}
                >
                  <Pencil className={stylex.props(styles.c1ky5l8t).className} />
                </button>
                <button
                  onClick={() => handleDelete(list.id, list.name)}
                  className={stylex.props(shared.btnGhost, styles.c1m6dywn).className}
                  aria-label={t('lists.deleteList')}
                >
                  <Trash2 className={stylex.props(styles.c1ky5l8t).className} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={t('lists.deleteConfirmTitle')}
        message={
          pendingDelete
            ? t('lists.deleteConfirmMessage', { name: pendingDelete.name })
            : ''
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <ListFormDialog
        key={editingList?.id ?? 'new'}
        open={formOpen}
        list={editingList}
        onOpenChange={setFormOpen}
        onSubmit={(input) => {
          if (editingList) {
            updateList(editingList.id, input);
            return true;
          }
          return createList(input).ok;
        }}
      />

      <ImportDialog
        open={importOpen}
        existingLists={lists}
        onOpenChange={setImportOpen}
        onImport={handleImport}
      />
    </div>
  );
}

const styles = stylex.create({
  stack4: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cxc8ak4: {
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "space-between",
  },
  c1lp0kv9: {
    "fontSize": "1.25rem",
    "lineHeight": "1.75rem",
    "fontWeight": 700,
    "color": colors["--sos-text-slate-900-white"],
  },
  c18lz1d0: {
    "verticalAlign": "middle",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 400,
    "fontVariantNumeric": "tabular-nums",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1xmut6z: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c2ca09w: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.5rem",
  },
  cdlocnk: {
    "gap": "0.375rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
  },
  c1ky5l8t: {
    "height": "1rem",
    "width": "1rem",
  },
  c19xw58i: {
    "gap": "0.375rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
  },
  cl3wdzx: {
    "display": "grid",
    "gap": "0.75rem",
    "@media (min-width: 640px)": {
      "gridTemplateColumns": "repeat(2, minmax(0, 1fr))",
    },
    "@media (min-width: 1280px)": {
      "gridTemplateColumns": "repeat(3, minmax(0, 1fr))",
    },
  },
  c1j7sf2k: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.75rem",
    "padding": "1rem",
  },
  c1e6iu76: {
    "height": "2.5rem",
    "width": "2.5rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.5rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c1pa4dxw: {
    "flex": 1,
  },
  c1fbwq8c: {
    "height": "1rem",
    "width": "66.6667%",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.25rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c1dbpxn2: {
    "height": "0.75rem",
    "width": "33.3333%",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.25rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c1gy9eiv: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 600,
    "color": colors["--sos-text-slate-900-white"],
  },
  c14gva1v: {
    "borderRadius": "0.5rem",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": "#ef444433",
    "backgroundColor": "#ef44441a",
    "padding": "0.75rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-red-700-red-300"],
  },
  c1127rjk: {
    "marginLeft": "0.5rem",
    "textDecorationLine": "underline",
  },
  cgj8p3f: {
    "padding": "2rem",
    "textAlign": "center",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c16zf3zb: {
    "marginLeft": "auto",
    "marginRight": "auto",
    "marginBottom": "0.5rem",
    "height": "2rem",
    "width": "2rem",
    "color": colors["--sos-text-slate-300-slate-600"],
  },
  c15tho: {
    "gap": "0.375rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
  },
  cyiv8jm: {
    "display": "flex",
    "minWidth": "0",
    "cursor": "pointer",
    "alignItems": "center",
    "gap": "0.75rem",
    "padding": "1rem",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "borderColor": colors["--sos-border-slate-400-slate-600"],
    },
  },
  cctc87d: {
    "display": "flex",
    "height": "2.5rem",
    "width": "2.5rem",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "0.5rem",
  },
  c1kypdu7: {
    "height": "1.25rem",
    "width": "1.25rem",
  },
  c1r022bi: {
    "minWidth": "0",
    "flex": 1,
  },
  c1j7zf41: {
    "overflow": "hidden",
    "textOverflow": "ellipsis",
    "whiteSpace": "nowrap",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 600,
    "color": colors["--sos-text-slate-900-white"],
  },
  c1maj4j9: {
    "marginTop": "0.125rem",
    "display": "-webkit-box",
    "WebkitLineClamp": 2,
    "WebkitBoxOrient": "vertical",
    "overflow": "hidden",
    "whiteSpace": "pre-wrap",
    "overflowWrap": "break-word",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c6b0xl6: {
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1pzc2fh: {
    "display": "flex",
    "gap": "0.25rem",
  },
  cqo2b3o: {
    "padding": "0.625rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
  },
  c1m6dywn: {
    "padding": "0.625rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-red-600-red-400"],
    ":hover": {
      "backgroundColor": colors["--sos-bg-red-50-red-950_30"],
    },
  },
});
