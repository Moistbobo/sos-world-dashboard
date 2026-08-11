import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { World } from '../../types';

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
        className="btn-secondary p-2.5 text-sm relative z-30 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={t('share.share')}
        title={hasUrl ? t('share.share') : t('share.unavailable')}
      >
        <Share2 className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={!hasUrl}
      className="btn-secondary gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      title={hasUrl ? undefined : t('share.unavailable')}
    >
      <Share2 className="h-4 w-4" />
      {t('share.share')}
    </button>
  );
}
