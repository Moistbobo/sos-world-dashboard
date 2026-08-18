import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

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
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useDialogFocus({ open, containerRef: dialogRef, onClose: onCancel });

  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      className={stylex.props(styles.c1afui6d).className}
      role="alertdialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className={stylex.props(styles.caf9swy).className}
      >
        <div className={stylex.props(styles.c1ypk39r).className}>
          <h3 className={stylex.props(styles.ca9yw8g).className}>{title}</h3>
          <button
            onClick={onCancel}
            aria-label={t('common.close')}
            className={stylex.props(styles.cvjheld).className}
          >
            <X className={stylex.props(styles.c1kypdu7).className} />
          </button>
        </div>

        <p className={stylex.props(styles.c1f5vuy7).className}>{message}</p>

        {showDontAskAgain && (
          <div className={stylex.props(styles.c1zncs).className}>
            <label className={stylex.props(styles.c1sxsaxn).className}>
              <input
                type="checkbox"
                checked={dontAskAgain}
                onChange={(e) => setDontAskAgain(e.target.checked)}
                className={stylex.props(styles.c11z2qc5).className}
              />
              {dontAskAgainLabel ?? t('lists.dontAskAgain')}
            </label>
            <p className={stylex.props(styles.c9kaceo).className}>
              {t('lists.dontAskAgainHint')}
            </p>
          </div>
        )}

        <div className={stylex.props(styles.c1f6wbgy).className}>
          <button onClick={onCancel} className={stylex.props(shared.btnGhost, styles.c1hozn4m).className}>
            {cancelLabel ?? t('common.cancel')}
          </button>
          <button
            onClick={() => onConfirm(dontAskAgain)}
            className={stylex.props(shared.btnPrimary, styles.c1gbn6df).className}
          >
            {confirmLabel ?? t('common.confirm')}
          </button>
        </div>
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
  caf9swy: {
    "width": "100%",
    "borderRadius": "0.75rem",
    "backgroundColor": colors["--sos-bg-white-slate-900"],
    "padding": "1.25rem",
    "boxShadow": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  c1ypk39r: {
    "marginBottom": "0.75rem",
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
  c1f5vuy7: {
    "marginBottom": "1rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-600-slate-300"],
  },
  c1zncs: {
    "marginBottom": "1rem",
  },
  c1sxsaxn: {
    "display": "flex",
    "cursor": "pointer",
    "alignItems": "center",
    "gap": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-600-slate-300"],
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
  c9kaceo: {
    "marginTop": "0.25rem",
    "paddingLeft": "1.5rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-400-slate-500"],
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
});
