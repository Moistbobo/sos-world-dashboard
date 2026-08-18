import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { World } from '../../types';
import * as stylex from '@stylexjs/stylex';
import { shared } from '../../styles/shared';

interface ShareButtonProps {
  world: World;
  iconOnly?: boolean;
}

export function ShareButton({ world, iconOnly = false }: ShareButtonProps) {
  const { t } = useTranslation();

  const hasUrl = Boolean(world.vrchatUrl);

  const handleShare = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!hasUrl) {
      toast.error(t('share.unavailable'));
      return;
    }

    try {
      await navigator.clipboard.writeText(world.vrchatUrl);
      toast.success(t('share.success'));
    } catch {
      toast.error(t('share.error'));
    }
  };

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={!hasUrl}
        className={stylex.props(shared.btnSecondary, styles.c18bgtvy).className}
        aria-label={t('share.share')}
        title={hasUrl ? t('share.share') : t('share.unavailable')}
      >
        <Share2 className={stylex.props(styles.c1kypdu7).className} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={!hasUrl}
      className={stylex.props(shared.btnSecondary, styles.c1w9kkyx).className}
      title={hasUrl ? undefined : t('share.unavailable')}
    >
      <Share2 className={stylex.props(styles.c1ky5l8t).className} />
      {t('share.share')}
    </button>
  );
}

const styles = stylex.create({
  c18bgtvy: {
    "padding": "0.625rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "position": "relative",
    "zIndex": 30,
    ":disabled": {
      "cursor": "not-allowed",
    },
  },
  c1kypdu7: {
    "height": "1.25rem",
    "width": "1.25rem",
  },
  c1w9kkyx: {
    "gap": "0.5rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    ":disabled": {
      "cursor": "not-allowed",
    },
  },
  c1ky5l8t: {
    "height": "1rem",
    "width": "1rem",
  },
});
