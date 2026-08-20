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
let recentActivityFixture: {
  rows: Array<{
    type: 'comment' | 'rating';
    id: string;
    worldId: string;
    value?: 'good' | 'bad';
    username?: string;
    content?: string;
    createdAt: string;
    worldName: string;
  }>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} = { rows: [], isPending: false, isError: false, error: null, refetch: vi.fn() };

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
  useRecentActivity: () => recentActivityFixture,
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
    recentActivityFixture = { rows: [], isPending: false, isError: false, error: null, refetch: vi.fn() };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    if (lastUnmount) {
      lastUnmount();
      lastUnmount = null;
    }
    window.history.pushState({}, '', '/');
  });

  it('shows the full unique tag count on the stat card', () => {
    tagsFixture = Array.from({ length: 12 }, (_, i) => ({
      tag: `tag-${i + 1}`,
      count: 120 - i * 10,
    }));

    renderPage();

    expect(screen.getByText('12')).toBeInTheDocument();
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
  });

  it('renders the recent activity panel with activity rows when sentiment is enabled', () => {
    vi.stubEnv('VITE_ENABLE_COMMUNITY_SENTIMENT', 'true');
    recentActivityFixture = {
      rows: [
        {
          type: 'comment',
          id: 'c1',
          worldId: 'w1',
          username: 'Ann',
          content: 'Nice world',
          createdAt: '2024-01-03T00:00:00Z',
          worldName: 'Alpha World',
        },
      ],
      isPending: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };

    renderPage();

    expect(screen.getByText('Alpha World')).toBeInTheDocument();
  });
});
