import {
  Star,
  Heart,
  Music,
  Moon,
  PartyPopper,
  Gamepad2,
  Briefcase,
  Home,
  Plane,
  Camera,
  Coffee,
  type LucideIcon,
} from 'lucide-react';
import * as stylex from '@stylexjs/stylex';

const ICON_MAP: Record<string, LucideIcon> = {
  Star,
  Heart,
  Music,
  Moon,
  PartyPopper,
  Gamepad2,
  Briefcase,
  Home,
  Plane,
  Camera,
  Coffee,
};

interface ListIconProps {
  icon: string | null;
  color: string;
  className?: string;
}

export function ListIcon({ icon, color, className = '' }: ListIconProps) {
  const Lucide = icon && ICON_MAP[icon] ? ICON_MAP[icon] : Star;
  const isEmoji = Boolean(icon && !ICON_MAP[icon]);

  if (isEmoji) {
    return (
      <span
        className={`${stylex.props(styles.wrapper).className} ${className}`}
        style={{ color }}
        aria-hidden="true"
      >
        {icon}
      </span>
    );
  }

  return (
    <Lucide
      data-testid={`list-icon-${(icon || 'star').toLowerCase()}`}
      className={className}
      style={{ color }}
      aria-hidden="true"
    />
  );
}

const styles = stylex.create({
  wrapper: {
    alignItems: 'center',
    display: 'inline-flex',
    justifyContent: 'center',
  },
});
