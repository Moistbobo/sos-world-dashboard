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

  it('opens a world detail as an overlay and keeps the list behind it', async () => {
    window.history.pushState({}, '', '/worlds/wrld_demo');

    render(<App />, { wrapper: Wrapper });

    expect(screen.getByRole('heading', { name: /worlds/i })).toBeInTheDocument();

    // The detail should be rendered inside the overlay.
    expect(await screen.findByRole('heading', { level: 1, name: /demo world/i })).toBeInTheDocument();

    // The original list heading should still be mounted behind the overlay.
    expect(screen.getByRole('heading', { name: /worlds/i })).toBeInTheDocument();

    // The overlay container itself should exist.
    expect(document.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
  });

  it('locks body scrolling while the detail overlay is open', async () => {
    window.history.pushState({}, '', '/worlds/wrld_demo');

    render(<App />, { wrapper: Wrapper });

    expect(await screen.findByRole('heading', { level: 1, name: /demo world/i })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('unlocks body scrolling after the detail overlay closes', async () => {
    window.history.pushState({}, '', '/worlds');
    window.history.pushState({}, '', '/worlds/wrld_demo');

    render(<App />, { wrapper: Wrapper });

    expect(await screen.findByRole('heading', { level: 1, name: /demo world/i })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    await waitFor(() => {
      expect(document.querySelector('.fixed.inset-0.z-50')).not.toBeInTheDocument();
    });

    expect(document.body.style.overflow).toBe('');
  });

  it('closes the world detail overlay and removes it from the DOM when navigating back', async () => {
    window.history.pushState({}, '', '/worlds');
    window.history.pushState({}, '', '/worlds/wrld_demo');

    render(<App />, { wrapper: Wrapper });

    expect(await screen.findByRole('heading', { level: 1, name: /demo world/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    await waitFor(() => {
      expect(document.querySelector('.fixed.inset-0.z-50')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /worlds/i })).toBeInTheDocument();
  });
});
