import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
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

  it('renders a saved world using WorldCard', async () => {
    const world: World = {
      worldId: 'wrld_1',
      name: 'Saved World',
      authorName: 'Author',
      capacity: 10,
      platforms: ['pc'],
      tags: [],
      imageUrl: 'https://example.com/image.jpg',
      vrchatUrl: 'https://vrchat.com/home/world/wrld_1',
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

    expect(screen.getByAltText('Saved World')).toHaveAttribute(
      'src',
      'https://example.com/image.jpg',
    );
    expect(
      screen.getByRole('link', { name: /open in vrchat/i }),
    ).toHaveAttribute('href', 'https://vrchat.com/home/world/wrld_1');
    expect(
      screen.getByRole('button', { name: /remove world from list/i }),
    ).toBeInTheDocument();
  });

  it('removes a world from the list when the remove button is clicked', async () => {
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

    await userEvent.click(
      screen.getByRole('button', { name: /remove world from list/i }),
    );

    await waitFor(() => {
      expect(screen.queryByText('Saved World')).not.toBeInTheDocument();
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
      expect(fetchSpy).toHaveBeenLastCalledWith(ids.slice(0, 28));
    });

    expect(screen.getByText(/of 35/i)).toBeInTheDocument();
  });
});
