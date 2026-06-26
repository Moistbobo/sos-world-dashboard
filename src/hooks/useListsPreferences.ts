import { useContext } from 'react';
import { ListsPreferencesContext } from '../contexts/ListsPreferencesContext';

export function useListsPreferences() {
  const ctx = useContext(ListsPreferencesContext);
  return ctx;
}
