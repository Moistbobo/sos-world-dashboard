import { describe, expect, it } from 'vitest';
import { validateComment } from './commentValidation';
import type { CommentValidationError, CommentValidationResult } from './commentValidation';

function expectReason(result: CommentValidationResult): CommentValidationError {
  expect(result.valid).toBe(false);
  if (!result.valid) {
    return result.reason;
  }
  throw new Error('expected invalid comment validation result');
}

describe('validateComment', () => {
  it('accepts plain short text', () => {
    expect(validateComment('Great world!')).toEqual({ valid: true });
  });

  it('rejects empty comments', () => {
    expect(validateComment('').valid).toBe(false);
  });

  it('rejects comments over 256 chars', () => {
    const long = 'a'.repeat(257);
    expect(expectReason(validateComment(long))).toBe('tooLong');
  });

  it('rejects urls', () => {
    expect(expectReason(validateComment('check https://example.com'))).toBe('noLinks');
    expect(expectReason(validateComment('visit http://test.com'))).toBe('noLinks');
    expect(expectReason(validateComment('look at www.example.com'))).toBe('noLinks');
  });

  it('rejects emails', () => {
    expect(expectReason(validateComment('mail me at hi@example.com'))).toBe('noEmails');
  });

  it('rejects html or markdown tags', () => {
    expect(expectReason(validateComment('<script>bad</script>'))).toBe('noMarkup');
    expect(expectReason(validateComment('[link](url)'))).toBe('noMarkup');
  });

  it('rejects excessive whitespace/line breaks', () => {
    expect(expectReason(validateComment('hello\n\n\nworld'))).toBe('noExcessWhitespace');
  });

  it('trims leading and trailing whitespace', () => {
    expect(validateComment('  hello  ')).toEqual({ valid: true });
  });
});
