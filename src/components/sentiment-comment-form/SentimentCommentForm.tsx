import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { validateComment, MAX_LENGTH } from '../../utils/commentValidation';

interface SentimentCommentFormProps {
  isSubmitting: boolean;
  onSubmit: (content: string) => void;
}

export function SentimentCommentForm({ isSubmitting, onSubmit }: SentimentCommentFormProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');

  const handleChange = (value: string) => {
    setContent(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateComment(content);
    if (!result.valid) {
      return;
    }
    onSubmit(content.trim());
    setContent('');
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
        className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      />
      <div className="mt-1 flex items-start justify-between gap-2">
        <span
          className={`text-xs text-slate-500 dark:text-slate-400 ${length > MAX_LENGTH ? 'text-red-500' : ''}`}
        >
          {t('sentiment.comments.count', { count: length, max: MAX_LENGTH })}
        </span>
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="btn-primary text-sm"
        >
          {t('sentiment.comments.submit')}
        </button>
      </div>
    </form>
  );
}
