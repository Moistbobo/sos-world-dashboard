import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyticsConsentBanner } from './AnalyticsConsentBanner';
import { AnalyticsConsentProvider } from '../../contexts/AnalyticsConsentContext';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <AnalyticsConsentProvider>{children}</AnalyticsConsentProvider>;
}

describe('AnalyticsConsentBanner', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders by default', () => {
    render(<AnalyticsConsentBanner />, { wrapper: Wrapper });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('hides after accepting and persists granted consent', async () => {
    render(<AnalyticsConsentBanner />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(window.localStorage.getItem('sos-analytics-consent')).toBe('granted');
  });

  it('hides after denying and persists denied consent', async () => {
    render(<AnalyticsConsentBanner />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button', { name: /no thanks/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(window.localStorage.getItem('sos-analytics-consent')).toBe('denied');
  });

  it('does not close when clicking the backdrop', () => {
    render(<AnalyticsConsentBanner />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('dialog'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(window.localStorage.getItem('sos-analytics-consent')).toBeNull();
  });

  it('does not close when clicking inside the modal content', () => {
    render(<AnalyticsConsentBanner />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText(/Help us improve SOS Dashboard/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
