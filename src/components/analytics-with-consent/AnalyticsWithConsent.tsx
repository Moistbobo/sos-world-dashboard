import { Analytics } from '@vercel/analytics/react';
import { useAnalyticsConsent } from '../../hooks/useAnalyticsConsent';

export function AnalyticsWithConsent() {
  const { consent } = useAnalyticsConsent();

  return (
    <Analytics
      beforeSend={(event) => {
        if (consent !== 'granted') {
          return null;
        }
        return event;
      }}
    />
  );
}
