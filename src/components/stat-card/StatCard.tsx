import type { ReactNode } from 'react';
import { Card, CardContent } from '../ui/Card';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card className={stylex.props(styles.c2c5z).className}>
      <CardContent className={stylex.props(styles.c2c5v).className}>
        <div className={stylex.props(styles.cxc8ak4).className}>
          <div>
            <p className={stylex.props(styles.crbrs2w).className}>{label}</p>
            <p className={stylex.props(styles.cvlpvkk).className}>{value}</p>
          </div>
          {icon && (
            <div className={stylex.props(styles.c1320nzu).className}>{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const styles = stylex.create({
  c2c5z: {
    "padding": "1rem",
  },
  c2c5v: {
    "padding": "0",
  },
  cxc8ak4: {
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "space-between",
  },
  crbrs2w: {
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "fontWeight": 500,
    "color": colors["--sos-text-slate-500-slate-400"],
    "letterSpacing": "0.05em",
  },
  cvlpvkk: {
    "marginTop": "0.25rem",
    "fontSize": "1.5rem",
    "lineHeight": "2rem",
    "fontWeight": 700,
    "color": colors["--sos-text-slate-900-white"],
  },
  c1320nzu: {
    "color": colors["--sos-text-indigo-600-indigo-400"],
  },
});
