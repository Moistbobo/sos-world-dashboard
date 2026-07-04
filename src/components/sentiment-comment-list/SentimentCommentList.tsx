import { useTranslation } from 'react-i18next';
import type { Comment } from '../../types';

interface SentimentCommentListProps {
  comments: Comment[] | undefined;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function SentimentCommentList({ comments }: SentimentCommentListProps) {
  const { t } = useTranslation();

  if (!comments || comments.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{t('sentiment.comments.empty')}</p>;
  }

  return (
    <ul className="space-y-3" data-testid="sentiment-comment-list">
      {comments.map((comment) => (
        <li key={comment.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">{comment.username}</span>
            <span title={new Date(comment.created_at).toLocaleString()}>
              {t('sentiment.comments.postedAt', { time: formatTimeAgo(comment.created_at) })}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">
            {comment.content}
          </p>
        </li>
      ))}
    </ul>
  );
}
