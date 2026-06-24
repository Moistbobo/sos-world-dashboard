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

  const handleShare = async (event: React.MouseEvent) => {
    event.stopPropagation();

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
        className="btn-secondary p-2 text-xs relative z-30"
        aria-label={t('share.share')}
        title={t('share.share')}
      >
        <Share2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="btn-secondary gap-2 text-sm"
    >
      <Share2 className="h-4 w-4" />
      {t('share.share')}
    </button>
  );
}
