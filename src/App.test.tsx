import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  },
];

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
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
  it('opens a world detail as an overlay and keeps the list behind it', async () => {
    window.history.pushState({}, '', '/worlds');

    const user = userEvent.setup();
    render(<App />, { wrapper: Wrapper });

    expect(screen.getByRole('heading', { name: /worlds/i })).toBeInTheDocument();
    expect(screen.getByText('Demo World')).toBeInTheDocument();

    // Click the world card's select button to open the detail overlay.
    await user.click(screen.getByRole('button', { name: /details - demo world/i }));

    // The detail should be rendered inside the overlay.
    expect(await screen.findByRole('heading', { level: 1, name: /demo world/i })).toBeInTheDocument();

    // The original list heading should still be mounted behind the overlay.
    expect(screen.getByRole('heading', { name: /worlds/i })).toBeInTheDocument();

    // The overlay container itself should exist.
    expect(document.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
  });
});
