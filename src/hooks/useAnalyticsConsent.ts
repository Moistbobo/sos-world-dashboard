import { useContext } from 'react';
import { AnalyticsConsentContext } from '../contexts/AnalyticsConsentContext';

export function useAnalyticsConsent() {
  return useContext(AnalyticsConsentContext);
}
