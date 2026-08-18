import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useCurrentUserId } from '../../hooks/useCurrentUser';
import { formatTimestamp } from '../../utils/formatTimestamp';
import type { Comment } from '../../types';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

interface SentimentCommentListProps {
  comments: Comment[] | undefined;
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
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
      className={stylex.props(
        styles.author,
        isCurrentUser ? styles.authorCurrent : styles.authorOther,
      ).className}
      title={isCurrentUser ? t('sentiment.comments.youIndicator') : undefined}
    >
      {username}
      {isCurrentUser && (
        <span className={stylex.props(styles.c1cl81ir).className}>
          {' '}
          {t('sentiment.comments.youIndicator')}
        </span>
      )}
    </span>
  );
}

export function SentimentCommentList({
  comments,
  isLoading = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: SentimentCommentListProps) {
  const { t } = useTranslation();
  const currentUserId = useCurrentUserId();

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" data-testid="sentiment-comment-list-loading">
        <div className={stylex.props(styles.c1mwsoy2).className} />
        <div className={stylex.props(styles.c17r0rim).className} />
        <div className={stylex.props(styles.c31gkee).className} />
        <p className="sr-only">{t('sentiment.comments.loading')}</p>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return <p className={stylex.props(styles.c1xmut6z).className}>{t('sentiment.comments.empty')}</p>;
  }

  return (
    <div className="space-y-3" data-testid="sentiment-comment-list">
      <ul className="space-y-3">
        {comments.map((comment) => (
          <li key={comment.id} className={stylex.props(styles.c1quv7lu).className}>
            <div className={stylex.props(styles.ctbjdmu).className}>
              <AuthorLabel username={comment.username} isCurrentUser={comment.user_id === currentUserId} />
              <span title={formatTimestamp(comment.created_at)}>{formatTimestamp(comment.created_at)}</span>
              <span title={comment.id}>{comment.id.split('-').pop()}</span>
            </div>
            <p className={stylex.props(styles.c1v3vmcd).className}>
              {comment.content}
            </p>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className={stylex.props(shared.btnSecondary, styles.cwkwica).className}
          aria-busy={isLoadingMore}
        >
          {isLoadingMore && <Loader2 className={stylex.props(styles.c1nmg2sh).className} aria-hidden="true" />}
          {isLoadingMore ? t('sentiment.comments.loadingMore') : t('sentiment.comments.loadMore')}
        </button>
      )}
    </div>
  );
}

const styles = stylex.create({
  c1cl81ir: {
    "marginLeft": "0.25rem",
    "fontWeight": 700,
    "color": colors["--sos-text-indigo-600-indigo-300"],
  },
  c1mwsoy2: {
    "height": "1rem",
    "width": "75%",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.25rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c17r0rim: {
    "height": "1rem",
    "width": "50%",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.25rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c31gkee: {
    "height": "1rem",
    "width": "83.3333%",
    "animation": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "borderRadius": "0.25rem",
    "backgroundColor": colors["--sos-bg-slate-200-slate-700"],
  },
  c1xmut6z: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1quv7lu: {
    "borderRadius": "0.5rem",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-200-slate-700_50"],
    "padding": "0.75rem",
  },
  ctbjdmu: {
    "display": "flex",
    "alignItems": "center",
    "gap": "0.5rem",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  c1v3vmcd: {
    "marginTop": "0.25rem",
    "whiteSpace": "pre-wrap",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-800-slate-200"],
  },
  cwkwica: {
    "display": "flex",
    "width": "100%",
    "alignItems": "center",
    "justifyContent": "center",
    "gap": "0.5rem",
  },
  c1nmg2sh: {
    "height": "1rem",
    "width": "1rem",
    "animation": "spin 1s linear infinite",
  },
  author: {
    "fontWeight": 500,
  },
  authorCurrent: {
    "fontWeight": 700,
    "color": colors["--sos-text-indigo-700-indigo-300"],
  },
  authorOther: {
    "color": colors["--sos-text-slate-700-slate-300"],
  },
});
