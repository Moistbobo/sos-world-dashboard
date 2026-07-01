import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const mockWorlds = [
  {
    worldId: 'wrld_demo',
    name: 'Demo World',
    authorName: 'Demo Author',
    capacity: 40,
    platforms: ['PC', 'Quest'],
    tags: ['chill'],
    imageUrl: '',
    vrchatUrl: 'https://vrchat.com',
    quality: 'good' as const,
    createdAt: '2024-01-01',
    internalAddDate: '2024-01-01',
  },
];

import { ListsProvider } from './contexts/ListsContext';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ListsProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ListsProvider>
  );
}

vi.mock('./hooks/useApi', () => ({
  useHealth: () => ({ isPending: false, isError: false }),
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
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
  useWorld: (worldId: string | undefined) => ({
    data: worldId === 'wrld_demo' ? mockWorlds[0] : undefined,
    isPending: false,
    isError: !worldId,
    error: null,
  }),
}));

describe('App routing', () => {
  it('renders the lists page at /lists', () => {
    window.history.pushState({}, '', '/lists');

    render(<App />, { wrapper: Wrapper });

    expect(screen.getByRole('heading', { name: /my lists/i })).toBeInTheDocument();
  });

  it('navigates to a standalone world detail page', async () => {
    window.history.pushState({}, '', '/worlds/wrld_demo');

    render(<App />, { wrapper: Wrapper });

    // The detail should be rendered as a standalone page.
    expect(await screen.findByRole('heading', { level: 1, name: /demo world/i })).toBeInTheDocument();

    // The back button navigates to /worlds.
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('navigates back to the worlds list from the detail page', async () => {
    window.history.pushState({}, '', '/worlds');
    window.history.pushState({}, '', '/worlds/wrld_demo');

    render(<App />, { wrapper: Wrapper });

    expect(await screen.findByRole('heading', { level: 1, name: /demo world/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /worlds/i })).toBeInTheDocument();
    });
  });

  it('renders the list detail page at /lists/:listId', () => {
    window.history.pushState({}, '', '/lists/missing-list');

    render(<App />, { wrapper: Wrapper });

    expect(screen.getByText(/list not found/i)).toBeInTheDocument();
  });
});
