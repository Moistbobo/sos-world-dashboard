import { useMemo } from 'react';
import { getTagMeta } from '../../utils/tagTypes';
import { getEmojiForTag } from '../../utils/tagEmoji';
import * as stylex from '@stylexjs/stylex';
import { tagStyles } from '../../utils/tagStyles';

interface TagBadgeProps {
  tag: string;
  onClick?: (tag: string) => void;
  active?: boolean;
  className?: string;
  /** Show only the emoji when space is tight */
  emojiOnly?: boolean;
}

function getColorForTag(tag: string) {
  return getTagMeta(tag)?.hexColor ?? '#64748b';
}

export function TagBadge({
  tag,
  onClick,
  active,
  className = '',
  emojiOnly = false,
}: TagBadgeProps) {
  const colorHex = useMemo(() => getColorForTag(tag), [tag]);
  const emoji = useMemo(() => getEmojiForTag(tag), [tag]);

  return (
    <button
      type="button"
      onClick={onClick ? () => onClick(tag) : undefined}
      title={tag}
      className={`${stylex.props(
        styles.base,
        active ? styles.active : styles.inactive,
        onClick ? styles.clickable : styles.static,
        tagStyles(colorHex) as Parameters<typeof stylex.props>[0][number],
      ).className}${className ? ` ${className}` : ''}`}
    >
      <span className={stylex.props(styles.emoji).className}>{emoji}</span>
      {!emojiOnly && <span className={stylex.props(styles.label).className}>{tag}</span>}
    </button>
  );
}

const styles = stylex.create({
  base: {
    alignItems: 'center',
    borderRadius: '9999px',
    borderStyle: 'solid',
    borderWidth: 1,
    display: 'inline-flex',
    fontSize: '0.75rem',
    fontWeight: 500,
    minHeight: '2.75rem',
    paddingBottom: '0.375rem',
    paddingLeft: '0.75rem',
    paddingRight: '0.75rem',
    paddingTop: '0.375rem',
    transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  active: {
    boxShadow: '0 0 0 1px rgb(99 102 241 / 0.5), 0 0 0 0px #fff',
  },
  inactive: {},
  clickable: {
    cursor: 'pointer',
    ':hover': { filter: 'brightness(1.1)' },
  },
  static: {
    cursor: 'default',
  },
  emoji: {
    lineHeight: 1,
    marginRight: '0.25rem',
  },
  label: {
    maxWidth: '8rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});
