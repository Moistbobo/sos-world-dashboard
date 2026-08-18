import { useTranslation } from 'react-i18next';
import type { World } from '../../types';
import { getWorldAddDate } from '../../utils/worldAddDate';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';

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
      className={`${stylex.props(styles.root).className}${className ? ` ${className}` : ''}`}
      title={t('worldAddDate.tooltip')}
    >
      {formatted}
    </span>
  );
}

const styles = stylex.create({
  root: {
    cursor: 'help',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textUnderlineOffset: '4px',
    textDecorationColor: colors['--sos-decoration-slate-400-slate-500'],
  },
});