import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { CreateListInput, WorldList } from '../../types/lists';
import {
  validateListMemo,
  MAX_LIST_MEMO_LENGTH,
} from '../../utils/listMemoValidation';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

const MAX_MEMO_HEIGHT_PX = 144;

interface ListFormDialogProps {
  open: boolean;
  list?: WorldList;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateListInput) => boolean;
}

export function ListFormDialog({
  open,
  list,
  onOpenChange,
  onSubmit,
}: ListFormDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(list?.name ?? '');
  const [color, setColor] = useState(list?.color ?? '#4f46e5');
  const [memo, setMemo] = useState(list?.memo ?? '');
  const [error, setError] = useState<string | null>(null);
  const memoRef = useRef<HTMLTextAreaElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useDialogFocus({ open, containerRef: dialogRef, onClose: () => onOpenChange(false) });

  const autoGrow = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_MEMO_HEIGHT_PX)}px`;
  }, []);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('lists.nameRequired'));
      return;
    }
    const memoResult = validateListMemo(memo);
    if (!memoResult.valid) {
      setError(t('lists.memoTooLong'));
      return;
    }
    const ok = onSubmit({ name: trimmed, color, memo });
    if (!ok) return;
    if (!list) {
      setName('');
      setColor('#4f46e5');
      setMemo('');
    }
    setError(null);
    onOpenChange(false);
  };

  const handleMemoChange = (value: string) => {
    setMemo(value);
    const memoResult = validateListMemo(value);
    if (!memoResult.valid) {
      setError(t('lists.memoTooLong'));
    } else if (error === t('lists.memoTooLong')) {
      setError(null);
    }
    const el = memoRef.current;
    if (el) {
      autoGrow(el);
    }
  };

  const memoLength = memo.trim().length;
  const isEdit = Boolean(list);

  return createPortal(
    <div className={stylex.props(styles.c1pncdne).className}>
      <div
        onClick={() => onOpenChange(false)}
        className={stylex.props(styles.c1afui6d).className}
        role="dialog"
        aria-modal="true"
      >
        <div
          ref={dialogRef}
          onClick={(e) => e.stopPropagation()}
          className={stylex.props(styles.caf9swy).className}
        >
          <div className={stylex.props(styles.cs7r2vk).className}>
            <h3 className={stylex.props(styles.ca9yw8g).className}>
              {isEdit ? t('lists.editList') : t('lists.newList')}
            </h3>
            <button
              onClick={() => onOpenChange(false)}
              aria-label={t('common.close')}
              className={stylex.props(styles.cvjheld).className}
            >
              <X className={stylex.props(styles.c1kypdu7).className} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="list-name"
                className={stylex.props(styles.c17kobyq).className}
              >
                {t('lists.listName')}
              </label>
              <input
                id="list-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={stylex.props(shared.input, styles.cic22wr).className}
                placeholder={t('lists.listNamePlaceholder')}
              />
            </div>
            <div>
              <label
                htmlFor="list-color"
                className={stylex.props(styles.c17kobyq).className}
              >
                {t('lists.listColor')}
              </label>
              <div className={stylex.props(styles.c2ca09w).className}>
                <input
                  id="list-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className={stylex.props(styles.ceize5s).className}
                />
                <span className={stylex.props(styles.c6b0xl6).className}>
                  {color}
                </span>
              </div>
            </div>
            <div>
              <label
                htmlFor="list-memo"
                className={stylex.props(styles.c17kobyq).className}
              >
                {t('lists.listMemo')}
              </label>
              <textarea
                id="list-memo"
                ref={(el) => {
                  memoRef.current = el;
                  autoGrow(el);
                }}
                value={memo}
                onChange={(e) => handleMemoChange(e.target.value)}
                placeholder={t('lists.listMemoPlaceholder')}
                maxLength={MAX_LIST_MEMO_LENGTH + 1}
                rows={3}
                className={stylex.props(shared.input, styles.c1pegsey).className}
              />
              <span
                className={stylex.props(
                  styles.memoCount,
                  memoLength > MAX_LIST_MEMO_LENGTH ? styles.memoCountOver : undefined,
                ).className}
              >
                {t('lists.memoCount', { count: memoLength })}
              </span>
            </div>
            {error && (
              <p className={stylex.props(styles.ciyy9h6).className}>{error}</p>
            )}
            <div className={stylex.props(styles.c1m6tdyv).className}>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className={stylex.props(shared.btnGhost, styles.c1hozn4m).className}
              >
                {t('common.cancel')}
              </button>
              <button type="submit" className={stylex.props(shared.btnPrimary, styles.c1gbn6df).className}>
                {isEdit ? t('common.save') : t('lists.createList')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const styles = stylex.create({
  c1pncdne: {
    "display": "contents",
  },
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
  c17kobyq: {
    "marginBottom": "0.25rem",
    "display": "block",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "fontWeight": 500,
    "color": colors["--sos-text-slate-700-slate-300"],
  },
  cic22wr: {
    "width": "100%",
  },
  c2ca09w: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.5rem",
  },
  ceize5s: {
    "height": "2.75rem",
    "width": "2.75rem",
    "cursor": "pointer",
    "borderRadius": "0.25rem",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-300-slate-700"],
    "backgroundColor": "transparent",
    "padding": "0.25rem",
  },
  c6b0xl6: {
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1pegsey: {
    "width": "100%",
    "resize": "none",
    "overflow": "auto",
  },
  ciyy9h6: {
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-red-600-red-300"],
  },
  c1m6tdyv: {
    "display": "flex",
    "justifyContent": "flex-end",
    "gap": "0.5rem",
    "paddingTop": "0.5rem",
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
  memoCount: {
    "display": "block",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "marginTop": "0.25rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  memoCountOver: {
    "color": "#ef4444",
  },
});
