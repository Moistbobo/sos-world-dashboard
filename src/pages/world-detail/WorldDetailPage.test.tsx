import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { WorldDetailPage } from './WorldDetailPage';
import * as useApi from '../../hooks/useApi';
import type { World } from '../../types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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
});
