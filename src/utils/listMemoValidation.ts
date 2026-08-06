export type ListMemoValidationResult =
  | { valid: true }
  | { valid: false; reason: 'tooLong' };

export const MAX_LIST_MEMO_LENGTH = 512;

export function validateListMemo(content: string): ListMemoValidationResult {
  if (content.trim().length > MAX_LIST_MEMO_LENGTH) {
    return { valid: false, reason: 'tooLong' };
  }
  return { valid: true };
}
