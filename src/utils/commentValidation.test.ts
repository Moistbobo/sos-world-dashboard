import { describe, expect, it } from 'vitest';
import { validateComment } from './commentValidation';

describe('validateComment', () => {
  it('accepts plain short text', () => {
    expect(validateComment('Great world!')).toEqual({ valid: true });
  });

  it('rejects empty comments', () => {
    expect(validateComment('').valid).toBe(false);
  });

  it('rejects comments over 256 chars', () => {
    const long = 'a'.repeat(257);
    const result = validateComment(long);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('tooLong');
  });

  it('rejects urls', () => {
    expect(validateComment('check https://example.com').reason).toBe('noLinks');
    expect(validateComment('visit http://test.com').reason).toBe('noLinks');
    expect(validateComment('look at www.example.com').reason).toBe('noLinks');
  });

  it('rejects emails', () => {
    expect(validateComment('mail me at hi@example.com').reason).toBe('noEmails');
  });

  it('rejects html or markdown tags', () => {
    expect(validateComment('<script>bad</script>').reason).toBe('noMarkup');
    expect(validateComment('[link](url)').reason).toBe('noMarkup');
  });

  it('rejects excessive whitespace/line breaks', () => {
    expect(validateComment('hello\n\n\nworld').reason).toBe('noExcessWhitespace');
  });

  it('trims leading and trailing whitespace', () => {
    expect(validateComment('  hello  ')).toEqual({ valid: true });
  });
});
