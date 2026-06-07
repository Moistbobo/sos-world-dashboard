import type { ReactNode } from 'react';
import { Card, CardContent } from './ui/Card';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          </div>
          {icon && (
            <div className="text-indigo-400">{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
