import { useTranslation } from 'react-i18next';
import type { World } from '../../types';
import { getWorldAddDate } from '../../utils/worldAddDate';

interface WorldAddDateProps {
  world: World;
  variant?: 'date' | 'datetime';
  className?: string;
}

export function WorldAddDate({ world, variant = 'date', className = '' }: WorldAddDateProps) {
  const { t } = useTranslation();
  const raw = getWorldAddDate(world);
  const formatted =
    variant === 'datetime' ? new Date(raw).toLocaleString() : new Date(raw).toLocaleDateString();

  return (
    <span
      className={`underline decoration-dotted underline-offset-4 decoration-slate-400 dark:decoration-slate-500 cursor-help ${className}`}
      title={t('worldAddDate.tooltip')}
    >
      {formatted}
    </span>
  );
}
