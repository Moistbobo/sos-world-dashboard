import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { validateComment, MAX_LENGTH } from '../../utils/commentValidation';
import type { CommentValidationError } from '../../utils/commentValidation';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../styles/tokens.stylex';
import { shared } from '../../styles/shared';

interface SentimentCommentFormProps {
  isSubmitting: boolean;
  onSubmit: (content: string) => void;
}

const errorKeyMap: Record<CommentValidationError, string> = {
  tooLong: 'sentiment.validation.tooLong',
  noLinks: 'sentiment.validation.noLinks',
  noEmails: 'sentiment.validation.noEmails',
  noMarkup: 'sentiment.validation.noMarkup',
  noExcessWhitespace: 'sentiment.validation.noExcessWhitespace',
  empty: 'sentiment.validation.empty',
};

export function SentimentCommentForm({ isSubmitting, onSubmit }: SentimentCommentFormProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [error, setError] = useState<CommentValidationError | null>(null);

  const handleChange = (value: string) => {
    setContent(value);
    const result = validateComment(value);
    setError(result.valid || result.reason === 'empty' ? null : result.reason);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateComment(content);
    if (!result.valid) {
      setError(result.reason);
      return;
    }
    onSubmit(content.trim());
    setContent('');
    setError(null);
  };

  const length = content.trim().length;

  return (
    <form onSubmit={handleSubmit} data-testid="sentiment-comment-form">
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={t('sentiment.comments.placeholder')}
        maxLength={MAX_LENGTH + 1}
        rows={3}
        disabled={isSubmitting}
        className={stylex.props(styles.cwjdjdf).className}
      />
      <div className={stylex.props(styles.c1mtxzs9).className}>
        <div className={stylex.props(styles.c1r022bi).className}>
          {error && (
            <span className={stylex.props(styles.c10d1zjl).className}>
              {t(errorKeyMap[error])}
            </span>
          )}
          <span
            className={stylex.props(
              styles.count,
              length > MAX_LENGTH ? styles.countOver : undefined,
            ).className}
          >
            {t('sentiment.comments.count', { count: length, max: MAX_LENGTH })}
          </span>
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !content.trim() || !!error}
          className={stylex.props(shared.btnPrimary, styles.c3689rf).className}
        >
          {t('sentiment.comments.submit')}
        </button>
      </div>
    </form>
  );
}

const styles = stylex.create({
  cwjdjdf: {
    "width": "100%",
    "borderRadius": "0.5rem",
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": colors["--sos-border-slate-300-slate-600"],
    "backgroundColor": colors["--sos-bg-white-slate-800"],
    "padding": "0.75rem",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "color": colors["--sos-text-slate-900-white"],
    "::placeholder": {
      "color": "#94a3b8",
    },
    ":focus": {
      "borderColor": "#6366f1",
    },
  },
  c1mtxzs9: {
    "marginTop": "0.25rem",
    "display": "flex",
    "alignItems": "flex-start",
    "justifyContent": "space-between",
    "gap": "0.5rem",
  },
  c1r022bi: {
    "minWidth": "0",
    "flex": 1,
  },
  c10d1zjl: {
    "display": "block",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": "#ef4444",
  },
  c3689rf: {
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
  },
  count: {
    "display": "block",
    "fontSize": "0.75rem",
    "lineHeight": "1rem",
    "color": colors["--sos-text-slate-500-slate-400"],
  },
  countOver: {
    "color": "#ef4444",
  },
});
