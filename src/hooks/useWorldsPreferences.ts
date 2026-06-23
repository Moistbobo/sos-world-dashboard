import { useContext } from 'react';
import { WorldsPreferencesContext } from '../contexts/WorldsPreferencesContext';

export function useWorldsPreferences() {
  return useContext(WorldsPreferencesContext);
}
