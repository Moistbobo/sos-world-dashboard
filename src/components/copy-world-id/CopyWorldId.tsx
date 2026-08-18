import { Copy, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';

interface CopyWorldIdProps {
  worldId: string;
}

export function CopyWorldId({ worldId }: CopyWorldIdProps) {
  const { t } = useTranslation();

  async function handleCopy(event: React.MouseEvent) {
    event.stopPropagation();

    try {
      await navigator.clipboard.writeText(worldId);
      toast.success(t('worldDetail.idCopied'));
    } catch {
      toast.error(t('worldDetail.idCopyError'));
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={stylex.props(styles.c1ufdvj2).className}
      aria-label={t('worldDetail.idCopyAriaLabel', { id: worldId })}
      title={t('worldDetail.idCopyAriaLabel', { id: worldId })}
      data-testid="copy-world-id"
    >
      <Hash className={stylex.props(styles.cppbzfc).className} />
      <span>{t('worldDetail.id', { id: worldId })}</span>
      <Copy className={stylex.props(styles.cppbzfc).className} />
    </button>
  );
}

const styles = stylex.create({
  c1ufdvj2: {
    "display": "flex",
    "minHeight": "2.75rem",
    "cursor": "pointer",
    "alignItems": "center",
    "gap": "0.375rem",
    "whiteSpace": "nowrap",
    "borderRadius": "0.25rem",
    "paddingLeft": "0.375rem",
    "paddingRight": "0.375rem",
    "textAlign": "left",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke",
    ":hover": {
      "color": colors["--sos-text-indigo-600-indigo-400"],
    },
    ":focus-visible": {
      "color": colors["--sos-text-indigo-600-indigo-400"],
      "boxShadow": "0 0 0 0px #fff, 0 0 0 2px #6366f1",
    },
  },
  cppbzfc: {
    "height": "1rem",
    "width": "1rem",
    "color": colors["--sos-text-slate-400-slate-500"],
  },
});
