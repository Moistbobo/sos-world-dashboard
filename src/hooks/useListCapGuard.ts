import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { MAX_LISTS, useLists } from '../contexts/ListsContext';

export function useListCapGuard() {
  const { lists } = useLists();
  const { t } = useTranslation();

  return useCallback(() => {
    if (lists.length >= MAX_LISTS) {
      toast.error(t('lists.maxListsReached', { count: MAX_LISTS }));
      return false;
    }
    return true;
  }, [lists.length, t]);
}
