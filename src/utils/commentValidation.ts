export type CommentValidationResult =
  | { valid: true }
  | { valid: false; reason: CommentValidationError };

export type CommentValidationError =
  | 'tooLong'
  | 'noLinks'
  | 'noEmails'
  | 'noMarkup'
  | 'noExcessWhitespace'
  | 'empty';

export const MAX_LENGTH = 256;
const URL_RE = /https?:\/\/|www\./i;
const EMAIL_RE = /\S+@\S+\.\S+/i;
const MARKUP_RE = /<[^>]+>|\[[^\]]*\]\([^)]*\)|\*\*|__|`|#+/;
const EXCESS_WHITESPACE_RE = /\n{3,}|\s{4,}/;

export function validateComment(content: string): CommentValidationResult {
  const trimmed = content.trim();

  if (!trimmed) {
    return { valid: false, reason: 'empty' };
  }

  if (trimmed.length > MAX_LENGTH) {
    return { valid: false, reason: 'tooLong' };
  }

  if (URL_RE.test(trimmed)) {
    return { valid: false, reason: 'noLinks' };
  }

  if (EMAIL_RE.test(trimmed)) {
    return { valid: false, reason: 'noEmails' };
  }

  if (MARKUP_RE.test(trimmed)) {
    return { valid: false, reason: 'noMarkup' };
  }

  if (EXCESS_WHITESPACE_RE.test(trimmed)) {
    return { valid: false, reason: 'noExcessWhitespace' };
  }

  return { valid: true };
}
