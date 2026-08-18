import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Pencil, List, Download, Globe } from 'lucide-react';
import { useLists } from '../../contexts/ListsContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useListsPreferences } from '../../hooks/useListsPreferences';
import { ListFormDialog } from '../../components/list-form-dialog/ListFormDialog';
import { ListIcon } from '../../utils/listIcon';
import { useWorldsByIds } from '../../hooks/useWorldsByIds';
import { useRatingsForWorldIds } from '../../hooks/useSentiment';
import { Pagination } from '../../components/pagination';
import { WorldCard } from '../../components/world-card/WorldCard';
import { DeletedWorldCard } from '../../components/deleted-world-card';
import { ConfirmDialog } from '../../components/confirm-dialog';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

const WORLDS_PER_PAGE = 28;
const MEMO_PREVIEW_LENGTH = 128;
const SENTIMENT_ENABLED = import.meta.env.VITE_ENABLE_COMMUNITY_SENTIMENT === 'true';

export function ListDetailPage({
  listId: listIdProp,
}: {
  listId?: string;
} = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { listId: paramListId } = useParams<{ listId: string }>();
  const listId = listIdProp ?? paramListId;
  const { getList, updateList, deleteList, removeWorldFromList, exportList, isHydrated } = useLists();
  const { skipRemoveWorldConfirmation, setSkipRemoveWorldConfirmation } = useListsPreferences();
  const list = listId ? getList(listId) : undefined;
  usePageTitle(list?.name ? list.name : t('lists.title'));
  const [offset, setOffset] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRemoveWorldId, setPendingRemoveWorldId] = useState<string | null>(null);
  const [memoExpanded, setMemoExpanded] = useState(false);

  const paginatedIds = useMemo(() => {
    if (!list) return [];
    return list.worldIds.slice(offset, offset + WORLDS_PER_PAGE);
  }, [list, offset]);

  const { worlds, isPending, isError } = useWorldsByIds(paginatedIds);

  const visibleWorldIds = useMemo(
    () => worlds.filter((entry) => entry.data).map((entry) => entry.worldId),
    [worlds],
  );
  const { data: ratingSummaries } = useRatingsForWorldIds(
    SENTIMENT_ENABLED ? visibleWorldIds : [],
  );

  if (!isHydrated) {
    return (
      <div className="space-y-4">
        <div className={stylex.props(styles.caajinm).className} />
        <div className={stylex.props(shared.card, styles.c1yvaa6j).className}>
          <div className={stylex.props(styles.cbpfumt).className} />
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className={stylex.props(shared.btnGhost, styles.c1xphv85).className}
        >
          <ArrowLeft className={stylex.props(styles.c1ky5l8t).className} /> {t('common.back')}
        </button>
        <div className={stylex.props(shared.card, styles.cgj8p3f).className}>
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

  const handleRemove = (worldId: string) => {
    if (skipRemoveWorldConfirmation) {
      removeWorldFromList(list.id, worldId);
      return;
    }
    setPendingRemoveWorldId(worldId);
    setConfirmOpen(true);
  };

  const confirmRemove = (dontAskAgain: boolean) => {
    if (pendingRemoveWorldId) {
      removeWorldFromList(list.id, pendingRemoveWorldId);
    }
    if (dontAskAgain) {
      setSkipRemoveWorldConfirmation(true);
    }
    setPendingRemoveWorldId(null);
    setConfirmOpen(false);
  };

  const cancelRemove = () => {
    setPendingRemoveWorldId(null);
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(-1)}
        className={stylex.props(shared.btnGhost, styles.c1xphv85).className}
      >
        <ArrowLeft className={stylex.props(styles.c1ky5l8t).className} /> {t('common.back')}
      </button>

      <div className={stylex.props(styles.cjqkzf8).className}>
        <div className={stylex.props(styles.c19m7neu).className}>
          <div
            className={stylex.props(styles.cctc87d).className}
            style={{ backgroundColor: `${list.color}20` }}
          >
            <ListIcon icon={list.icon} color={list.color} className={stylex.props(styles.c1kypdu7).className} />
          </div>
          <div className={stylex.props(styles.chkqlb3).className}>
            <h1 className={stylex.props(styles.c1ygyk63).className}>
              {list.name}
            </h1>
            {list.memo && (
              <div className={stylex.props(styles.c15t09mw).className}>
                <p className={stylex.props(styles.cwsf3rg).className}>
                  {memoExpanded || list.memo.length <= MEMO_PREVIEW_LENGTH
                    ? list.memo
                    : `${list.memo.slice(0, MEMO_PREVIEW_LENGTH)}…`}
                </p>
                {list.memo.length > MEMO_PREVIEW_LENGTH && (
                  <button
                    type="button"
                    onClick={() => setMemoExpanded((expanded) => !expanded)}
                    className={stylex.props(shared.btnGhost, styles.c1g88gw7).className}
                  >
                    {memoExpanded
                      ? t('lists.memoViewLess')
                      : t('lists.memoViewMore')}
                  </button>
                )}
              </div>
            )}
            <p className={stylex.props(styles.c6b0xl6).className}>
              {t('lists.worldCount', { count: list.worldIds.length })}
            </p>
          </div>
        </div>
        <div className={stylex.props(styles.c1pzc2fi).className}>
          <button
            onClick={() => exportList(list)}
            className={stylex.props(shared.btnSecondary, styles.cdlocnk).className}
          >
            <Download className={stylex.props(styles.c1ky5l8t).className} /> {t('lists.exportList')}
          </button>
          <button
            onClick={() => setFormOpen(true)}
            className={stylex.props(shared.btnSecondary, styles.cdlocnk).className}
          >
            <Pencil className={stylex.props(styles.c1ky5l8t).className} /> {t('common.edit')}
          </button>
          <button
            onClick={handleDelete}
            className={stylex.props(shared.btnGhost, styles.c1acelco).className}
          >
            <Trash2 className={stylex.props(styles.c1ky5l8t).className} /> {t('common.delete')}
          </button>
        </div>
      </div>

      {list.worldIds.length === 0 ? (
        <div className={stylex.props(shared.card, styles.cgj8p3f).className}>
          <List className={stylex.props(styles.c16zf3zb).className} />
          <p>{t('lists.emptyDetailTitle')}</p>
          <p>{t('lists.emptyDetailSubtitle')}</p>
          <button
            onClick={() => navigate('/worlds')}
            className={stylex.props(shared.btnPrimary, styles.c15tho).className}
          >
            <Globe className={stylex.props(styles.c1ky5l8t).className} />
            {t('lists.browseWorlds')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className={stylex.props(styles.c1gy9eiv).className}>
            {t('lists.worldsSection')}
          </h2>
          {isPending && worlds.every((w) => !w.data) ? (
            <div className={stylex.props(styles.cqwr8yn).className}>
              {Array.from({ length: WORLDS_PER_PAGE }).map((_, i) => (
                <div
                  key={i}
                  className={stylex.props(shared.card, styles.c1461knq).className}
                />
              ))}
            </div>
          ) : (
            <div className={stylex.props(styles.cqwr8yn).className}>
              {worlds.map((entry) => {
                if (entry.data) {
                  return (
                    <WorldCard
                      key={entry.worldId}
                      world={entry.data}
                      onSelect={(id) => navigate(`/worlds/${id}`)}
                      onRemove={() => handleRemove(entry.worldId)}
                      onAuthorClick={(author) => navigate(`/worlds?search=${encodeURIComponent(author)}`)}
                      ratingSummary={ratingSummaries ? ratingSummaries.get(entry.worldId) ?? null : undefined}
                    />
                  );
                }
                if (isError) return null;
                return (
                  <DeletedWorldCard
                    key={entry.worldId}
                    worldId={entry.worldId}
                    onRemove={() => handleRemove(entry.worldId)}
                  />
                );
              })}
            </div>
          )}

          {list.worldIds.length > WORLDS_PER_PAGE && (
            <div className={stylex.props(styles.cs6j9kg).className}>
              <Pagination
                offset={offset}
                limit={WORLDS_PER_PAGE}
                total={list.worldIds.length}
                onChangeOffset={(o) => setOffset(o)}
              />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={t('lists.removeWorldConfirmTitle')}
        message={t('lists.removeWorldConfirmMessage')}
        confirmLabel={t('lists.remove')}
        cancelLabel={t('common.cancel')}
        showDontAskAgain
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />

      <ListFormDialog
        open={formOpen}
        list={list}
        onOpenChange={setFormOpen}
        onSubmit={(input) => {
          updateList(list.id, input);
          return true;
        }}
      />
    </div>
  );
}

const styles = stylex.create({
  caajinm: {
    "height": "1rem",
    "width": "6rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.25rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c1yvaa6j: {
    "padding": "2rem",
  },
  cbpfumt: {
    "marginLeft": "auto",
    "marginRight": "auto",
    "height": "2rem",
    "width": "2rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.25rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c1xphv85: {
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
  cgj8p3f: {
    "padding": "2rem",
    "textAlign": "center",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  cjqkzf8: {
    "display": "flex",
    "flexDirection": "column",
    "gap": "0.75rem",
    "@media (min-width: 640px)": {
      "flexDirection": "row",
      "alignItems": "center",
      "justifyContent": "space-between",
    },
  },
  c19m7neu: {
    "display": "flex",
    "minWidth": "0",
    "alignItems": "center",
    "gap": "0.75rem",
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
  chkqlb3: {
    "minWidth": "0",
  },
  c1ygyk63: {
    "fontSize": "1.25rem",
    "lineHeight": "1.75rem",
    "fontWeight": 700,
    "color": colors["--sos-text-slate-900-white"],
  },
  c15t09mw: {
    "marginTop": "0.25rem",
  },
  cwsf3rg: {
    "whiteSpace": "pre-wrap",
    "overflowWrap": "break-word",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-600-slate-300"],
  },
  c1g88gw7: {
    "marginTop": "0.25rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
  },
  c6b0xl6: {
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1pzc2fi: {
    "display": "flex",
    "gap": "0.5rem",
  },
  cdlocnk: {
    "gap": "0.375rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
  },
  c1acelco: {
    "gap": "0.375rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
    "color": colors["--sos-text-red-600-red-400"],
    ":hover": {
      "backgroundColor": colors["--sos-bg-red-50-red-950_30"],
    },
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
  c1gy9eiv: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 600,
    "color": colors["--sos-text-slate-900-white"],
  },
  cqwr8yn: {
    "display": "grid",
    "gap": "1rem",
    "@media (min-width: 640px)": {
      "gridTemplateColumns": "repeat(2, minmax(0, 1fr))",
    },
    "@media (min-width: 1280px)": {
      "gridTemplateColumns": "repeat(4, minmax(0, 1fr))",
    },
  },
  c1461knq: {
    "height": "16rem",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
  },
  cs6j9kg: {
    "display": "flex",
    "justifyContent": "center",
    "paddingTop": "0.5rem",
  },
});
