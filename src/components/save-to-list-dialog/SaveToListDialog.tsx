import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Plus } from 'lucide-react';
import { useLists } from '../../contexts/ListsContext';
import { ListFormDialog } from '../list-form-dialog/ListFormDialog';
import { ListIcon } from '../../utils/listIcon';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

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
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useDialogFocus({ open, containerRef: dialogRef, onClose: () => onOpenChange(false) });

  if (!open) return null;

  const toggle = (listId: string) => {
    if (isWorldInList(worldId, listId)) {
      removeWorldFromList(listId, worldId);
      return;
    }
    addWorldToList(listId, worldId);
  };

  const handleInlineCreate = (input: Parameters<typeof createList>[0]) => {
    const result = createList(input);
    addWorldToList(result.list.id, worldId);
    return true;
  };

  return createPortal(
    <>
      <div
        className={stylex.props(styles.c1afui6d).className}
        role="dialog"
        aria-modal="true"
      >
        <div
          ref={dialogRef}
          className={stylex.props(styles.caf9swy).className}
        >
          <div className={stylex.props(styles.cs7r2vk).className}>
            <h3 className={stylex.props(styles.ca9yw8g).className}>
              {t('lists.saveToList')}
            </h3>
            <button
              onClick={() => onOpenChange(false)}
              aria-label={t('common.close')}
              className={stylex.props(styles.cvjheld).className}
            >
              <X className={stylex.props(styles.c1kypdu7).className} />
            </button>
          </div>

          {lists.length === 0 ? (
            <div className={stylex.props(styles.c1ap1ebo).className}>
              <p>{t('lists.noListsYet')}</p>
            </div>
          ) : (
            <div className={stylex.props(styles.c1346evp).className}>
              {lists.map((list) => (
                <label
                  key={list.id}
                  className={stylex.props(styles.c1tcrqea).className}
                >
                  <input
                    type="checkbox"
                    checked={isWorldInList(worldId, list.id)}
                    onChange={() => toggle(list.id)}
                    className={stylex.props(styles.c11z2qc5).className}
                  />
                  <ListIcon
                    icon={list.icon}
                    color={list.color}
                    className={stylex.props(styles.c1l49mhp).className}
                  />
                  <span className={stylex.props(styles.cdhbvfy).className}>
                    {list.name}
                  </span>
                  <span className={stylex.props(styles.c1kr1dvu).className}>
                    {list.worldIds.length}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className={stylex.props(styles.cfo6i3c).className}>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className={stylex.props(shared.btnGhost, styles.c16t09bg).className}
            >
              <Plus className={stylex.props(styles.c1ky5l8t).className} />
              {t('lists.createNewListInline')}
            </button>
          </div>

          <div className={stylex.props(styles.c1101byh).className}>
            <button
              onClick={() => onOpenChange(false)}
              className={stylex.props(shared.btnPrimary, styles.c1gbn6df).className}
            >
              {t('common.done')}
            </button>
          </div>
        </div>
      </div>
      <ListFormDialog
        key="new"
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={handleInlineCreate}
      />
    </>,
    document.body,
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
  caf9swy: {
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
  c1ap1ebo: {
    "paddingTop": "1.5rem",
    "paddingBottom": "1.5rem",
    "textAlign": "center",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1346evp: {
    "maxHeight": "16rem",
    "overflow": "auto",
    "paddingRight": "0.25rem",
  },
  c1tcrqea: {
    "display": "flex",
    "cursor": "pointer",
    "alignItems": "center",
    "gap": "0.75rem",
    "borderRadius": "0.5rem",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-200-slate-700"],
    "padding": "0.5rem",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "backgroundColor": colors["--sos-bg-slate-50-slate-800"],
    },
  },
  c11z2qc5: {
    "height": "1.5rem",
    "width": "1.5rem",
    "borderRadius": "0.25rem",
    "borderColor": colors["--sos-border-slate-300-slate-600"],
    "color": "#4f46e5",
    ":focus": {
      "boxShadow": "0 0 0 0px #fff, 0 0 0 1px #6366f1",
    },
  },
  c1l49mhp: {
    "height": "1.25rem",
    "width": "1.25rem",
  },
  cdhbvfy: {
    "flex": 1,
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-700-slate-200"],
  },
  c1kr1dvu: {
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-400-slate-500"],
  },
  cfo6i3c: {
    "marginTop": "1rem",
    "borderTopWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-200-slate-700"],
    "paddingTop": "0.75rem",
  },
  c16t09bg: {
    "width": "100%",
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
  c1101byh: {
    "marginTop": "1rem",
    "display": "flex",
    "justifyContent": "flex-end",
  },
  c1gbn6df: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "paddingTop": "0.5rem",
    "paddingBottom": "0.5rem",
  },
});
