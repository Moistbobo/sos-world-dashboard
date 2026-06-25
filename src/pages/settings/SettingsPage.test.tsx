import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPage } from './SettingsPage';
import { WorldsPreferencesProvider } from '../../contexts/WorldsPreferencesContext';
import { AnalyticsConsentProvider } from '../../contexts/AnalyticsConsentContext';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <WorldsPreferencesProvider>
      <AnalyticsConsentProvider>{children}</AnalyticsConsentProvider>
    </WorldsPreferencesProvider>
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders view mode and scroll mode settings', () => {
    render(<SettingsPage />, { wrapper: Wrapper });
    expect(screen.getByLabelText(/world view mode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/world scroll mode/i)).toBeInTheDocument();
  });

  it('persists view mode changes to localStorage', () => {
    render(<SettingsPage />, { wrapper: Wrapper });
    const viewModeSelect = screen.getByLabelText(/world view mode/i);
    fireEvent.change(viewModeSelect, { target: { value: 'list' } });
    expect(window.localStorage.getItem('sos-worlds-view-mode')).toBe('list');
  });

  it('persists scroll mode changes to localStorage', () => {
    render(<SettingsPage />, { wrapper: Wrapper });
    const scrollModeSelect = screen.getByLabelText(/world scroll mode/i);
    fireEvent.change(scrollModeSelect, { target: { value: 'pagination' } });
    expect(window.localStorage.getItem('sos-worlds-scroll-mode')).toBe('pagination');
  });

  it('renders the app version', () => {
    (globalThis as Record<string, unknown>).__APP_VERSION__ = '1.0.0';
    (globalThis as Record<string, unknown>).__APP_MODE__ = 'production';
    render(<SettingsPage />, { wrapper: Wrapper });
    expect(screen.getByTestId('app-version')).toHaveTextContent('1.0.0');
  });

  it('renders analytics consent buttons', () => {
    render(<SettingsPage />, { wrapper: Wrapper });
    expect(screen.getByRole('button', { name: /enabled/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /disabled/i })).toBeInTheDocument();
  });

  it('persists analytics consent choice to localStorage', () => {
    render(<SettingsPage />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button', { name: /enabled/i }));
    expect(window.localStorage.getItem('sos-analytics-consent')).toBe('granted');

    fireEvent.click(screen.getByRole('button', { name: /disabled/i }));
    expect(window.localStorage.getItem('sos-analytics-consent')).toBe('denied');
  });

  it('defaults analytics to disabled', () => {
    window.localStorage.removeItem('sos-analytics-consent');
    render(<SettingsPage />, { wrapper: Wrapper });
    expect(screen.getByText(/analytics is currently disabled/i)).toBeInTheDocument();
  });
});
