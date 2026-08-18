import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { shared } from '../../styles/shared';
import { colors } from '../../styles/tokens.stylex';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`${stylex.props(shared.card).className} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`${stylex.props(styles.header).className} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`${stylex.props(styles.content).className} ${className}`} {...props}>
      {children}
    </div>
  );
}

const styles = stylex.create({
  header: {
    borderBottomColor: colors['--sos-border-slate-200-slate-700_50'],
    borderBottomWidth: 1,
    borderStyle: 'solid',
    paddingBottom: '1rem',
    paddingLeft: '1.25rem',
    paddingRight: '1.25rem',
    paddingTop: '1rem',
  },
  content: {
    paddingBottom: '1rem',
    paddingLeft: '1.25rem',
    paddingRight: '1.25rem',
    paddingTop: '1rem',
  },
});
