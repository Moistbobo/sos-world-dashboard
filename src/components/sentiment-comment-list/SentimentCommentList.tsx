import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import { useCurrentUserId } from '../../hooks/useCurrentUser';
import type { Comment } from '../../types';

interface SentimentCommentListProps {
  comments: Comment[] | undefined;
}

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const year = pad(date.getFullYear() % 100);
  const weekday = weekdays[date.getDay()];
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${month}/${day}/${year}(${weekday})${hours}:${minutes}:${seconds}`;
}

function AuthorLabel({
  username,
  isCurrentUser,
}: {
  username: string;
  isCurrentUser: boolean;
}) {
  const { t } = useTranslation();
  return (
    <span
      className={`font-medium ${
        isCurrentUser
          ? 'font-bold text-indigo-600 dark:text-indigo-300'
          : 'text-slate-700 dark:text-slate-300'
      }`}
      title={isCurrentUser ? t('sentiment.comments.youIndicator') : undefined}
    >
      {username}
      {isCurrentUser && (
        <span className="ml-1 font-bold text-indigo-500 dark:text-indigo-300">
          {' '}
          {t('sentiment.comments.youIndicator')}
        </span>
      )}
    </span>
  );
}

export function SentimentCommentList({ comments }: SentimentCommentListProps) {
  const { t } = useTranslation();
  const currentUserId = useCurrentUserId();
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');

  if (!comments || comments.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{t('sentiment.comments.empty')}</p>;
  }

  const sorted = [...comments].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return order === 'desc' ? bTime - aTime : aTime - bTime;
  });

  return (
    <div className="space-y-3" data-testid="sentiment-comment-list">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
          className="btn-ghost inline-flex items-center gap-1.5 text-xs"
          aria-label={order === 'desc' ? t('sentiment.comments.newestFirst') : t('sentiment.comments.oldestFirst')}
        >
          {order === 'desc' ? <ArrowDownWideNarrow className="h-3.5 w-3.5" /> : <ArrowUpWideNarrow className="h-3.5 w-3.5" />}
          {order === 'desc' ? t('sentiment.comments.newestFirst') : t('sentiment.comments.oldestFirst')}
        </button>
      </div>
      <ul className="space-y-3">
        {sorted.map((comment) => (
          <li key={comment.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <AuthorLabel username={comment.username} isCurrentUser={comment.user_id === currentUserId} />
              <span title={formatTimestamp(comment.created_at)}>{formatTimestamp(comment.created_at)}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">
              {comment.content}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
