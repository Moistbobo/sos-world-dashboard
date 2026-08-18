import { Copy, X, Ghost } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

interface DeletedWorldCardProps {
  worldId: string;
  onRemove: () => void;
}

export function DeletedWorldCard({ worldId, onRemove }: DeletedWorldCardProps) {
  const { t } = useTranslation();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(worldId);
      toast.success(t('worldDetail.idCopied'));
    } catch {
      toast.error(t('worldDetail.idCopyError'));
    }
  }

  return (
    <div  className={`group ${stylex.props(shared.card, styles.c1yhlths).className}`}>
      <button
        type="button"
        onClick={handleCopy}
        className={stylex.props(styles.c1ujvdyh).className}
        aria-label={t('lists.deletedWorldCopyAriaLabel', { id: worldId })}
        title={t('lists.deletedWorldCopyAriaLabel', { id: worldId })}
      />
      <div className={stylex.props(styles.c1sbcg42).className}>
        <Ghost className={stylex.props(styles.c1iod3hx).className} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={stylex.props(styles.c5jpf5h).className}
          aria-label={t('lists.removeWorld')}
          title={t('lists.removeWorld')}
        >
          <X className={stylex.props(styles.c1kypdu7).className} />
        </button>
      </div>
      <div className={stylex.props(styles.cb1o7vj).className}>
        <h3 className={stylex.props(styles.c1gy9eiv).className}>
          {t('lists.deletedWorldTitle')}
        </h3>
        <p className={stylex.props(styles.c1xj6sd8).className}>
          <Copy className={stylex.props(styles.c1mhsk0p).className} />
          <span className={stylex.props(styles.c13mf9hv).className}>{worldId}</span>
        </p>
      </div>
    </div>
  );
}

const styles = stylex.create({
  c1yhlths: {
    "position": "relative",
    "display": "flex",
    "flexDirection": "column",
    "overflow": "hidden",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "borderColor": colors["--sos-border-slate-400-slate-600"],
    },
  },
  c1ujvdyh: {
    "position": "absolute",
    "top": 0,
    "right": 0,
    "bottom": 0,
    "left": 0,
    "zIndex": 20,
    "borderRadius": "0.75rem",
    ":focus-visible": {
      "boxShadow": "0 0 0 0px #fff, 0 0 0 2px #6366f180",
    },
  },
  c1sbcg42: {
    "position": "relative",
    "display": "flex",
    "height": "10rem",
    "alignItems": "center",
    "justifyContent": "center",
    "backgroundColor": colors["--sos-bg-slate-200-slate-800"],
  },
  c1iod3hx: {
    "height": "2.5rem",
    "width": "2.5rem",
    "color": colors["--sos-text-slate-400-slate-600"],
  },
  c5jpf5h: {
    "position": "absolute",
    "top": "0.5rem",
    "right": "0.5rem",
    "zIndex": 30,
    "display": "flex",
    "height": "2.75rem",
    "width": "2.75rem",
    "alignItems": "center",
    "justifyContent": "center",
    "borderRadius": "9999px",
    "backgroundColor": colors["--sos-bg-white_90-slate-800_90"],
    "color": colors["--sos-text-red-600-red-400"],
    "boxShadow": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter",
    ":hover": {
      "backgroundColor": "#ffffff",
      "color": colors["--sos-text-red-700-red-300"],
    },
  },
  c1kypdu7: {
    "height": "1.25rem",
    "width": "1.25rem",
  },
  cb1o7vj: {
    "display": "flex",
    "flex": 1,
    "flexDirection": "column",
    "padding": "1rem",
  },
  c1gy9eiv: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 600,
    "color": colors["--sos-text-slate-900-white"],
  },
  c1xj6sd8: {
    "marginTop": "0.25rem",
    "display": "flex",
    "alignItems": "center",
    "gap": "0.25rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1mhsk0p: {
    "height": "0.875rem",
    "width": "0.875rem",
  },
  c13mf9hv: {
    "wordBreak": "break-all",
  },
});
