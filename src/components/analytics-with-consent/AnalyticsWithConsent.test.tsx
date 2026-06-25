import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalyticsWithConsent } from './AnalyticsWithConsent';
import { AnalyticsConsentProvider } from '../../contexts/AnalyticsConsentContext';

let receivedBeforeSend: ((event: { url: string }) => unknown) | null = null;

vi.mock('@vercel/analytics/react', () => ({
  Analytics: ({ beforeSend }: { beforeSend: (event: { url: string }) => unknown }) => {
    receivedBeforeSend = beforeSend;
    return <div data-testid="vercel-analytics" />;
  },
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <AnalyticsConsentProvider>{children}</AnalyticsConsentProvider>;
}

describe('AnalyticsWithConsent', () => {
  beforeEach(() => {
    receivedBeforeSend = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('always mounts the Analytics component so beforeSend can gate events', () => {
    window.localStorage.setItem('sos-analytics-consent', 'denied');
    render(<AnalyticsWithConsent />, { wrapper: Wrapper });
    expect(screen.getByTestId('vercel-analytics')).toBeInTheDocument();
    expect(receivedBeforeSend).not.toBeNull();
  });

  it('returns null from beforeSend when consent is undecided', () => {
    window.localStorage.removeItem('sos-analytics-consent');
    render(<AnalyticsWithConsent />, { wrapper: Wrapper });
    expect(receivedBeforeSend?.({ url: '/' })).toBeNull();
  });

  it('returns null from beforeSend when consent is denied', () => {
    window.localStorage.setItem('sos-analytics-consent', 'denied');
    render(<AnalyticsWithConsent />, { wrapper: Wrapper });
    expect(receivedBeforeSend?.({ url: '/' })).toBeNull();
  });

  it('passes events through beforeSend when consent is granted', () => {
    const event = { url: '/' };
    window.localStorage.setItem('sos-analytics-consent', 'granted');
    render(<AnalyticsWithConsent />, { wrapper: Wrapper });
    expect(receivedBeforeSend?.(event)).toBe(event);
  });
});
