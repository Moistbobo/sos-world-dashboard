import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

let tagsFixture: { tag: string; count: number }[] = [];

vi.mock('../../hooks/useApi', () => ({
  useTags: () => ({ data: { tags: tagsFixture }, isPending: false }),
  useWorlds: () => ({
    data: { worlds: [], total: 0, limit: 6, offset: 0 },
    isPending: false,
    isError: false,
    error: null,
  }),
}));

vi.mock('../../hooks/useHealth', () => ({
  useHealth: () => ({
    data: { worldCount: 7, dbVersion: '1.2.3' },
    isPending: false,
    isError: false,
  }),
}));

vi.mock('../../hooks/useSentiment', () => ({
  useRatingsForWorldIds: () => ({
    data: undefined,
    isPending: false,
    isError: false,
    isSuccess: false,
    isFetching: false,
  }),
}));

let lastUnmount: (() => void) | null = null;

function renderPage() {
  const { unmount } = render(<DashboardPage />, { wrapper: Wrapper });
  lastUnmount = unmount;
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    queryClient.clear();
    window.localStorage.clear();
    window.history.pushState({}, '', '/');
    lastUnmount = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (lastUnmount) {
      lastUnmount();
      lastUnmount = null;
    }
    window.history.pushState({}, '', '/');
  });

  it('shows the full unique tag count on the stat card while the Top Tags panel stays at 10', () => {
    tagsFixture = Array.from({ length: 12 }, (_, i) => ({
      tag: `tag-${i + 1}`,
      count: 120 - i * 10,
    }));

    renderPage();

    expect(screen.getByText('12')).toBeInTheDocument();

    const topTagButtons = screen.getAllByRole('button', { name: /\btag-\d+\b/ });
    expect(topTagButtons).toHaveLength(10);
    expect(screen.queryByRole('button', { name: /\btag-11\b/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /\btag-12\b/ })).not.toBeInTheDocument();
  });

  it('shows the unique tag count without truncation when fewer than 10 tags exist', () => {
    tagsFixture = [
      { tag: 'chill', count: 40 },
      { tag: 'social', count: 30 },
      { tag: 'quest', count: 20 },
      { tag: 'avatar', count: 10 },
    ];

    renderPage();

    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /chill|social|quest|avatar/ })).toHaveLength(4);
  });
});
