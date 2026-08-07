import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { WorldDetailPage } from './WorldDetailPage';
import * as useApi from '../../hooks/useApi';
import { ListsProvider } from '../../contexts/ListsContext';
import { resetListsDb } from '../../test/listsDb';
import type { World } from '../../types';

vi.mock('../../components/sentiment-section', () => ({
  SentimentSection: ({ worldId }: { worldId: string }) => (
    <div data-testid="sentiment-section">Sentiment {worldId}</div>
  ),
}));

vi.mock('../../hooks/useSentiment', () => ({
  useRatings: () => ({ data: { worldId: 'w1', good: 0, bad: 0, userRating: null }, isLoading: false }),
  useInfiniteComments: () => ({ data: { pages: [] }, isLoading: false, hasNextPage: false, isFetchingNextPage: false, fetchNextPage: vi.fn() }),
  useSubmitRating: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useSubmitComment: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

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
  let scrollTo: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    window.localStorage.clear();
    await resetListsDb();
  });

  afterEach(() => {
    scrollTo.mockRestore();
  });

  it('resets scroll position to the top when entering a world detail page', () => {
    vi.spyOn(useApi, 'useWorld').mockReturnValue({
      data: createWorld(),
      isPending: false,
      isError: false,
      error: null,
      isFetching: false,
    } as ReturnType<typeof useApi.useWorld>);

    render(
      <Wrapper initialEntries={['/worlds/wrld_123']}>
        <WorldDetailPage worldId="wrld_123" />
      </Wrapper>,
    );

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('resets scroll position to the top when the world id changes', () => {
    vi.spyOn(useApi, 'useWorld').mockReturnValue({
      data: createWorld(),
      isPending: false,
      isError: false,
      error: null,
      isFetching: false,
    } as ReturnType<typeof useApi.useWorld>);

    const { rerender } = render(
      <Wrapper>
        <WorldDetailPage worldId="wrld_123" />
      </Wrapper>,
    );

    expect(scrollTo).toHaveBeenCalledTimes(1);

    rerender(
      <Wrapper>
        <WorldDetailPage worldId="wrld_456" />
      </Wrapper>,
    );

    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
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

  it('navigates to the world list when the back button is clicked on a direct link', async () => {
    vi.spyOn(useApi, 'useWorld').mockReturnValue({
      data: createWorld(),
      isPending: false,
      isError: false,
      error: null,
      isFetching: false,
    } as ReturnType<typeof useApi.useWorld>);

    render(
      <Wrapper initialEntries={['/worlds/wrld_123']}>
        <WorldDetailPage worldId="wrld_123" />
      </Wrapper>,
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    await userEvent.click(backButton);

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

  it('marks the dashboard add date with an underline tooltip', () => {
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

    const date = screen.getByTitle(/Date added to this dashboard/i);
    expect(date).toBeInTheDocument();
    expect(date).toHaveClass('underline');
    expect(date).toHaveClass('decoration-dotted');
  });

  it('renders the sentiment section when community sentiment is enabled', async () => {
    vi.stubEnv('VITE_ENABLE_COMMUNITY_SENTIMENT', 'true');
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

    expect(await screen.findByTestId('sentiment-section')).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('does not render the sentiment section when community sentiment is disabled', () => {
    vi.stubEnv('VITE_ENABLE_COMMUNITY_SENTIMENT', 'false');
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

    expect(screen.queryByTestId('sentiment-section')).not.toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('opens a full-screen lightbox when the world image is clicked', async () => {
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

    const imageButton = screen.getByRole('button', { name: /open full-size image of Test World/i });
    await userEvent.click(imageButton);

    const lightbox = screen.getByTestId('world-image-lightbox');
    expect(lightbox).toBeInTheDocument();
    expect(lightbox).toHaveAttribute('role', 'dialog');
    expect(lightbox).toHaveAttribute('aria-modal', 'true');
    expect(document.body).toHaveClass('overflow-hidden');

    const lightboxImage = within(lightbox).getByAltText(/Test World/i);
    expect(lightboxImage).toHaveClass('object-contain');
  });

  it('closes the lightbox when the backdrop or X button is clicked', async () => {
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

    await userEvent.click(screen.getByRole('button', { name: /open full-size image of Test World/i }));
    expect(screen.getByTestId('world-image-lightbox')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);

    expect(screen.queryByTestId('world-image-lightbox')).not.toBeInTheDocument();
    expect(document.body).not.toHaveClass('overflow-hidden');
  });

  it('does not open a lightbox when the world has no image', () => {
    vi.spyOn(useApi, 'useWorld').mockReturnValue({
      data: createWorld({ imageUrl: '' }),
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

    expect(screen.queryByRole('button', { name: /open full-size image/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('world-image-lightbox')).not.toBeInTheDocument();
  });

  it('closes the lightbox when Escape is pressed', async () => {
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

    await userEvent.click(screen.getByRole('button', { name: /open full-size image of Test World/i }));
    expect(screen.getByTestId('world-image-lightbox')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByTestId('world-image-lightbox')).not.toBeInTheDocument();
  });
});
