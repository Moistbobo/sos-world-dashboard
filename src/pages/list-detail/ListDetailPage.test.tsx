import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ListsProvider } from '../../contexts/ListsContext';
import { ListDetailPage } from './ListDetailPage';
import * as client from '../../api/client';
import type { World } from '../../types';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

beforeEach(() => {
  window.localStorage.clear();
  queryClient.clear();
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ListsProvider>{children}</ListsProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ListDetailPage', () => {
  it('shows empty state for a list with no worlds', async () => {
    window.localStorage.setItem(
      'sos-world-lists',
      JSON.stringify({
        version: 1,
        lists: [
          {
            id: 'l1',
            name: 'Favorites',
            icon: null,
            color: '#4f46e5',
            worldIds: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      }),
    );

    render(
      <Wrapper>
        <Routes>
          <Route path="/" element={<ListDetailPage listId="l1" />} />
        </Routes>
      </Wrapper>,
    );
    expect(
      await screen.findByText(/no worlds in this list/i)
    ).toBeInTheDocument();
  });

  it('renders a saved world after fetching', async () => {
    const world: World = {
      worldId: 'wrld_1',
      name: 'Saved World',
      authorName: 'Author',
      capacity: 10,
      platforms: ['pc'],
      tags: [],
      imageUrl: '',
      vrchatUrl: '',
      quality: 'good',
      createdAt: '2024-01-01',
      internalAddDate: '2024-02-01',
    };
    vi.spyOn(client, 'fetchWorldsByIds').mockResolvedValue([world]);

    window.localStorage.setItem(
      'sos-world-lists',
      JSON.stringify({
        version: 1,
        lists: [
          {
            id: 'l1',
            name: 'Favorites',
            icon: null,
            color: '#4f46e5',
            worldIds: ['wrld_1'],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      }),
    );

    render(
      <Wrapper>
        <Routes>
          <Route path="/" element={<ListDetailPage listId="l1" />} />
        </Routes>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Saved World')).toBeInTheDocument();
    });
  });

  it('paginates worlds and only fetches the current page', async () => {
    const fetchSpy = vi.spyOn(client, 'fetchWorldsByIds').mockResolvedValue([]);

    const ids = Array.from({ length: 35 }, (_, i) => `wrld_${i}`);
    window.localStorage.setItem(
      'sos-world-lists',
      JSON.stringify({
        version: 1,
        lists: [
          {
            id: 'l1',
            name: 'Big List',
            icon: null,
            color: '#4f46e5',
            worldIds: ids,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      }),
    );

    render(
      <Wrapper>
        <Routes>
          <Route path="/" element={<ListDetailPage listId="l1" />} />
        </Routes>
      </Wrapper>,
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenLastCalledWith(ids.slice(0, 30));
    });

    expect(screen.getByText(/of 35/i)).toBeInTheDocument();
  });
});
