import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

export type AnalyticsConsent = 'granted' | 'denied' | null;

interface AnalyticsConsentContextValue {
  consent: AnalyticsConsent;
  grantConsent: () => void;
  denyConsent: () => void;
  resetConsent: () => void;
  hasDecided: boolean;
  isDefaultDenied: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AnalyticsConsentContext = createContext<AnalyticsConsentContextValue>({
  consent: 'denied',
  grantConsent: () => {},
  denyConsent: () => {},
  resetConsent: () => {},
  hasDecided: false,
  isDefaultDenied: true,
});

const STORAGE_KEY = 'sos-analytics-consent';

function getInitialConsent(): AnalyticsConsent {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'granted' || saved === 'denied') return saved;
  } catch {
    // ignore storage errors
  }
  return null;
}

const DEFAULT_CONSENT: AnalyticsConsent = 'denied';

export function AnalyticsConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<AnalyticsConsent>(getInitialConsent);

  useEffect(() => {
    if (consent === null) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, consent);
    } catch {
      // ignore storage errors
    }
  }, [consent]);

  const grantConsent = useCallback(() => setConsent('granted'), []);
  const denyConsent = useCallback(() => setConsent('denied'), []);
  const resetConsent = useCallback(() => setConsent(null), []);

  const effectiveConsent = consent ?? DEFAULT_CONSENT;
  const hasDecided = consent !== null;

  const value = useMemo(
    () => ({
      consent: effectiveConsent,
      grantConsent,
      denyConsent,
      resetConsent,
      hasDecided,
      isDefaultDenied: !hasDecided,
    }),
    [effectiveConsent, grantConsent, denyConsent, resetConsent, hasDecided],
  );

  return <AnalyticsConsentContext.Provider value={value}>{children}</AnalyticsConsentContext.Provider>;
}
