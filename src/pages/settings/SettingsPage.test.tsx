import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPage } from './SettingsPage';
import { WorldsPreferencesProvider } from '../../contexts/WorldsPreferencesContext';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <WorldsPreferencesProvider>{children}</WorldsPreferencesProvider>;
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
});
