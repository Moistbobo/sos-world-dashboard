import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { WorldDetailPage } from './WorldDetailPage';
import * as useApi from '../../hooks/useApi';
import { ListsProvider } from '../../contexts/ListsContext';
import type { World } from '../../types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="current-location">{`${location.pathname}${location.search}`}</div>
  );
}

function Wrapper({ children, initialEntries = ['/worlds/wrld_123'] }: { children: React.ReactNode; initialEntries?: string[] }) {
  return (
    <MemoryRouter initialEntries={initialEntries} future={{ v7_startTransition: true }}>
      <QueryClientProvider client={queryClient}>
        <ListsProvider>{children}</ListsProvider>
        <LocationProbe />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const createWorld = (overrides: Partial<World> = {}): World => ({
  worldId: 'wrld_123',
  name: 'Test World',
  authorName: 'Test Author',
  imageUrl: 'https://example.com/image.png',
  tags: [],
  platforms: ['pc'],
  capacity: 42,
  quality: 'good',
  createdAt: '2024-01-01T00:00:00Z',
  internalAddDate: '2024-02-01T00:00:00Z',
  vrchatUrl: 'https://vrchat.com/home/world/wrld_123',
  ...overrides,
});

describe('WorldDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a share button that copies the VRChat URL', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    vi.spyOn(useApi, 'useWorld').mockReturnValue({
      data: createWorld(),
      isPending: false,
      isError: false,
      error: null,
      isFetching: false,
    } as ReturnType<typeof useApi.useWorld>);

    render(
      <Wrapper>
        <WorldDetailPage worldId="wrld_123" />
      </Wrapper>,
    );

    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeInTheDocument();

    await userEvent.click(shareButton);

    expect(writeText).toHaveBeenCalledWith('https://vrchat.com/home/world/wrld_123');
  });

  it('shows a background refresh indicator while data is present', () => {
    vi.spyOn(useApi, 'useWorld').mockReturnValue({
      data: createWorld(),
      isPending: false,
      isError: false,
      error: null,
      isFetching: true,
    } as ReturnType<typeof useApi.useWorld>);

    render(
      <Wrapper>
        <WorldDetailPage worldId="wrld_123" />
      </Wrapper>,
    );

    expect(screen.getByRole('heading', { name: /Test World/i })).toBeInTheDocument();
    expect(screen.getByTestId('world-detail-loading-bar')).toBeInTheDocument();
  });

  it('renders cached data and a refresh error banner when the background fetch fails', () => {
    vi.spyOn(useApi, 'useWorld').mockReturnValue({
      data: createWorld(),
      isPending: false,
      isError: true,
      error: new Error('Network error'),
      isFetching: false,
    } as ReturnType<typeof useApi.useWorld>);

    render(
      <Wrapper>
        <WorldDetailPage worldId="wrld_123" />
      </Wrapper>,
    );

    expect(screen.getByRole('heading', { name: /Test World/i })).toBeInTheDocument();
    expect(screen.getByText(/Failed to refresh world details: Network error/i)).toBeInTheDocument();
  });

  it('navigates to the worlds screen with the selected platform prefilled when a platform chip is clicked', async () => {
    vi.spyOn(useApi, 'useWorld').mockReturnValue({
      data: createWorld({ platforms: ['standalonewindows'] }),
      isPending: false,
      isError: false,
      error: null,
      isFetching: false,
    } as ReturnType<typeof useApi.useWorld>);

    render(
      <Wrapper>
        <WorldDetailPage worldId="wrld_123" />
      </Wrapper>,
    );

    const platformButton = screen.getByRole('button', { name: /Desktop/i });
    await userEvent.click(platformButton);

    expect(screen.getByTestId('current-location')).toHaveTextContent('/worlds');
    expect(screen.getByTestId('current-location')).toHaveTextContent('platform=standalonewindows');
  });

  it('navigates back when the background backdrop is clicked', async () => {
    vi.spyOn(useApi, 'useWorld').mockReturnValue({
      data: createWorld(),
      isPending: false,
      isError: false,
      error: null,
      isFetching: false,
    } as ReturnType<typeof useApi.useWorld>);

    render(
      <Wrapper initialEntries={['/worlds', '/worlds/wrld_123']}>
        <WorldDetailPage worldId="wrld_123" />
      </Wrapper>,
    );

    const backdrop = screen.getByTestId('world-detail-backdrop');
    await userEvent.click(backdrop);

    expect(screen.getByTestId('current-location')).toHaveTextContent('/worlds');
  });

  it('does not navigate back when clicking inside the world card', async () => {
    vi.spyOn(useApi, 'useWorld').mockReturnValue({
      data: createWorld(),
      isPending: false,
      isError: false,
      error: null,
      isFetching: false,
    } as ReturnType<typeof useApi.useWorld>);

    render(
      <Wrapper initialEntries={['/worlds', '/worlds/wrld_123']}>
        <WorldDetailPage worldId="wrld_123" />
      </Wrapper>,
    );

    const heading = screen.getByRole('heading', { name: /Test World/i });
    await userEvent.click(heading);

    expect(screen.getByTestId('current-location')).toHaveTextContent('/worlds/wrld_123');
  });

  it('renders a save-to-list button', () => {
    vi.spyOn(useApi, 'useWorld').mockReturnValue({
      data: createWorld(),
      isPending: false,
      isError: false,
      error: null,
      isFetching: false,
    } as ReturnType<typeof useApi.useWorld>);

    render(
      <Wrapper>
        <WorldDetailPage worldId="wrld_123" />
      </Wrapper>,
    );

    expect(screen.getByRole('button', { name: /save to list/i })).toBeInTheDocument();
  });
});
