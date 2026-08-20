import { MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { RecentActivityRow } from '../../types';

export function ActivityIcon({ row }: { row: RecentActivityRow }) {
  if (row.type === 'comment') {
    return (
      <span
        aria-hidden="true"
        data-testid="activity-icon-comment"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"
      >
        <MessageSquare className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
      </span>
    );
  }
  const isGood = row.value === 'good';
  const Icon = isGood ? ThumbsUp : ThumbsDown;
  return (
    <span
      aria-hidden="true"
      data-testid={isGood ? 'activity-icon-good' : 'activity-icon-bad'}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
        isGood
          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
          : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300'
      }`}
    >
      <Icon className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
    </span>
  );
}
