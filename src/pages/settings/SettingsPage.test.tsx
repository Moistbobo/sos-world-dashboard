import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsPage } from './SettingsPage';
import { WorldsPreferencesProvider } from '../../contexts/WorldsPreferencesContext';
import i18n from '../../i18n';

let meData: { name: string; role: string; permissions: string[] } | null = null;
let meError = false;
let mePending = false;

vi.mock('../../hooks/useApi', () => ({
  useMe: () => ({
    data: meData,
    isError: meError,
    isPending: mePending,
    error: meError ? new Error('rejected') : null,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WorldsPreferencesProvider>{children}</WorldsPreferencesProvider>
    </QueryClientProvider>
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    meData = null;
    meError = false;
    mePending = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    i18n.changeLanguage('en');
    document.documentElement.lang = 'en';
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

  it('updates the html lang attribute when the language changes', () => {
    render(<SettingsPage />, { wrapper: Wrapper });
    const languageSelect = screen.getByLabelText(/language/i) as HTMLSelectElement;
    fireEvent.change(languageSelect, { target: { value: 'ja' } });
    expect(document.documentElement.lang).toBe('ja');
    expect(window.localStorage.getItem('i18nextLng')).toBe('ja');
  });

  it('sets the document title from the page name', () => {
    render(<SettingsPage />, { wrapper: Wrapper });
    expect(document.title).toBe('Settings');
  });

  it('renders the app version', () => {
    (globalThis as Record<string, unknown>).__APP_VERSION__ = '1.0.0';
    (globalThis as Record<string, unknown>).__APP_MODE__ = 'production';
    render(<SettingsPage />, { wrapper: Wrapper });
    expect(screen.getByTestId('app-version')).toHaveTextContent('1.0.0');
  });

  it('renders the API token input with its label', () => {
    render(<SettingsPage />, { wrapper: Wrapper });
    expect(screen.getByLabelText(/api token/i)).toBeInTheDocument();
    expect(screen.getByText('Using the default (build-time) token.')).toBeInTheDocument();
  });

  it('persists a typed token to localStorage', () => {
    render(<SettingsPage />, { wrapper: Wrapper });
    const input = screen.getByLabelText(/api token/i);
    fireEvent.change(input, { target: { value: '  abc123  ' } });
    expect(window.localStorage.getItem('sos-api-token')).toBe('abc123');
  });

  it('removes the stored token when the input is cleared', () => {
    window.localStorage.setItem('sos-api-token', 'abc123');
    render(<SettingsPage />, { wrapper: Wrapper });
    const input = screen.getByLabelText(/api token/i);
    fireEvent.change(input, { target: { value: '' } });
    expect(window.localStorage.getItem('sos-api-token')).toBeNull();
  });

  it('shows the custom-token status when a token is stored and useMe is pending', () => {
    window.localStorage.setItem('sos-api-token', 'abc123');
    mePending = true;
    render(<SettingsPage />, { wrapper: Wrapper });
    expect(screen.getByText('Using a custom token.')).toBeInTheDocument();
  });

  it('shows the identity line from useMe when a token is stored', () => {
    window.localStorage.setItem('sos-api-token', 'abc123');
    meData = { name: 'Curator', role: 'curator', permissions: ['worlds:write'] };
    render(<SettingsPage />, { wrapper: Wrapper });
    expect(screen.getByText('Connected as Curator (curator).')).toBeInTheDocument();
  });

  it('toggles the token visibility', () => {
    render(<SettingsPage />, { wrapper: Wrapper });
    const input = screen.getByLabelText(/api token/i);
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByLabelText('Show token'));
    expect(input).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByLabelText('Hide token'));
    expect(input).toHaveAttribute('type', 'password');
  });
});
