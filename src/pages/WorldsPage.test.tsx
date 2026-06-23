import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { WorldsPage } from './WorldsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

const mockWorlds = [
  {
    worldId: 'wrld_1',
    name: 'Test World',
    authorName: 'Tester',
    capacity: 40,
    platforms: ['PC', 'Quest'],
    tags: ['chill'],
    imageUrl: '',
    vrchatUrl: '',
    quality: 'good' as const,
    createdAt: '2024-01-01',
  },
];

let infiniteHasNextPage = true;

vi.mock('../hooks/useApi', () => ({
  useTags: () => ({ data: { tags: [] } }),
  useWorlds: () => ({
    data: { worlds: mockWorlds, total: 1, limit: 20, offset: 0 },
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useInfiniteWorlds: () => ({
    data: { pages: [{ worlds: mockWorlds, total: 1, limit: 20, offset: 0 }] },
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
    hasNextPage: infiniteHasNextPage,
    isFetchingNextPage: false,
  }),
}));

describe('WorldsPage', () => {
  beforeEach(() => {
    infiniteHasNextPage = true;
    queryClient.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the worlds page with default endless scroll mode', () => {
    render(<WorldsPage />, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { name: /worlds/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to pagination/i })).toBeInTheDocument();
  });

  it('toggles between endless scroll and pagination', () => {
    render(<WorldsPage />, { wrapper: Wrapper });
    const toggleButton = screen.getByRole('button', { name: /switch to pagination/i });
    fireEvent.click(toggleButton);
    expect(screen.getByRole('button', { name: /switch to endless scroll/i })).toBeInTheDocument();
  });

  it('renders pagination controls only in pagination mode', () => {
    render(<WorldsPage />, { wrapper: Wrapper });
    expect(screen.queryByText(/of 1/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /switch to pagination/i }));
    expect(screen.getByText(/of 1/i)).toBeInTheDocument();
  });

  it('shows back-to-top button when scrolled past viewport height', () => {
    render(<WorldsPage />, { wrapper: Wrapper });
    expect(screen.queryByLabelText(/back to top/i)).not.toBeInTheDocument();

    Object.defineProperty(window, 'scrollY', { value: window.innerHeight + 1, writable: true });
    fireEvent.scroll(window);

    expect(screen.getByLabelText(/back to top/i)).toBeInTheDocument();
  });

  it('does not render a detail overlay by default', () => {
    render(<WorldsPage />, { wrapper: Wrapper });
    expect(document.querySelector('.fixed.inset-0.z-50')).not.toBeInTheDocument();
  });
});
