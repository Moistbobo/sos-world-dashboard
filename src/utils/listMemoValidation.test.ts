import { describe, it, expect } from 'vitest';
import {
  validateListMemo,
  MAX_LIST_MEMO_LENGTH,
} from './listMemoValidation';

describe('validateListMemo', () => {
  it('accepts an empty memo', () => {
    expect(validateListMemo('')).toEqual({ valid: true });
  });

  it('accepts whitespace-only memo', () => {
    expect(validateListMemo('   ')).toEqual({ valid: true });
  });

  it('accepts a memo at the limit', () => {
    expect(validateListMemo('x'.repeat(MAX_LIST_MEMO_LENGTH))).toEqual({
      valid: true,
    });
  });

  it('rejects a memo over the limit', () => {
    expect(
      validateListMemo('x'.repeat(MAX_LIST_MEMO_LENGTH + 1)),
    ).toEqual({ valid: false, reason: 'tooLong' });
  });
});
