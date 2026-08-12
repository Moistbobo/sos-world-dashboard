import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { WorldsPage } from './WorldsPage';
import { WorldsPreferencesProvider } from '../../contexts/WorldsPreferencesContext';
import { ListsProvider } from '../../contexts/ListsContext';
import { resetListsDb } from '../../test/listsDb';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

let lastUnmount: (() => void) | null = null;

function renderPage(ui: React.ReactElement) {
  const { unmount } = render(ui, { wrapper: Wrapper });
  lastUnmount = unmount;
  return { unmount };
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WorldsPreferencesProvider>
        <ListsProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </ListsProvider>
      </WorldsPreferencesProvider>
    </QueryClientProvider>
  );
}

const mockWorlds = [
  {
    worldId: 'wrld_1',
    name: 'Test World',
    authorName: 'Tester',
    capacity: 40,
    platforms: ['standalonewindows', 'android'],
    tags: ['chill'],
    imageUrl: '',
    vrchatUrl: '',
    quality: 'good' as const,
    createdAt: '2024-01-01',
    internalAddDate: '2024-02-01',
  },
];

let infiniteHasNextPage = true;
let infiniteIsPending = false;
let paginationIsPending = false;
const mockInfiniteFetchNextPage = vi.fn();

vi.mock('../../hooks/useApi', () => ({
  useTags: () => ({ data: { tags: [] } }),
  useMeta: () => ({
    data: {
      qualityGood: 123,
      qualityBad: 12,
      platformDesktop: 80,
      platformAndroid: 45,
      platformiOS: 6,
    },
    isPending: false,
    isError: false,
    error: null,
  }),
  useWorlds: () => ({
    data: paginationIsPending ? undefined : { worlds: mockWorlds, total: 1, limit: 20, offset: 0 },
    isPending: paginationIsPending,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useInfiniteWorlds: () => ({
    data: infiniteIsPending ? undefined : { pages: [{ worlds: mockWorlds, total: 1, limit: 20, offset: 0 }] },
    isPending: infiniteIsPending,
    isError: false,
    error: null,
    refetch: vi.fn(),
    fetchNextPage: mockInfiniteFetchNextPage,
    hasNextPage: infiniteHasNextPage,
    isFetchingNextPage: false,
  }),
  useWorld: () => ({
    data: mockWorlds[0],
    isPending: false,
    isError: false,
    error: null,
    isFetching: false,
  }),
}));

describe('WorldsPage', () => {
  beforeEach(async () => {
    infiniteHasNextPage = true;
    infiniteIsPending = false;
    paginationIsPending = false;
    queryClient.clear();
    window.localStorage.clear();
    await resetListsDb();
    window.history.pushState({}, '', '/');
    lastUnmount = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (lastUnmount) {
      lastUnmount();
      lastUnmount = null;
    }
    window.history.pushState({}, '', '/');
  });

  it('renders the worlds page with default endless scroll mode', () => {
    renderPage(<WorldsPage />);
    expect(screen.getByRole('heading', { name: /worlds/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to pagination/i })).toBeInTheDocument();
  });

  it('toggles between endless scroll and pagination', () => {
    renderPage(<WorldsPage />);
    const toggleButton = screen.getByRole('button', { name: /switch to pagination/i });
    fireEvent.click(toggleButton);
    expect(screen.getByRole('button', { name: /switch to endless scroll/i })).toBeInTheDocument();
  });

  it('persists scroll mode to localStorage when toggled', () => {
    renderPage(<WorldsPage />);
    const toggleButton = screen.getByRole('button', { name: /switch to pagination/i });
    fireEvent.click(toggleButton);
    expect(window.localStorage.getItem('sos-worlds-scroll-mode')).toBe('pagination');
  });

  it('restores scroll mode from localStorage', () => {
    window.localStorage.setItem('sos-worlds-scroll-mode', 'pagination');
    renderPage(<WorldsPage />);
    expect(screen.getByRole('button', { name: /switch to endless scroll/i })).toBeInTheDocument();
  });

  it('renders pagination controls only in pagination mode', () => {
    renderPage(<WorldsPage />);
    expect(screen.queryByText(/of 1/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /switch to pagination/i }));
    expect(screen.getByText(/of 1/i)).toBeInTheDocument();
  });

  it('throttles back-to-top visibility updates to at most one per animation frame', async () => {
    renderPage(<WorldsPage />);

    Object.defineProperty(window, 'scrollY', {
      value: window.innerHeight + 1,
      writable: true,
      configurable: true,
    });
    fireEvent.scroll(window);
    expect(screen.getByLabelText(/back to top/i)).toBeInTheDocument();

    window.scrollY = 0;
    fireEvent.scroll(window);
    expect(screen.getByLabelText(/back to top/i)).toBeInTheDocument();

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    fireEvent.scroll(window);
    expect(screen.queryByLabelText(/back to top/i)).not.toBeInTheDocument();
  });

  it('does not scroll to top when filters change in infinite scroll mode', async () => {
    const user = userEvent.setup();
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    renderPage(<WorldsPage />);
    await user.click(screen.getByRole('button', { name: /filters/i }));
    await user.click(screen.getByRole('button', { name: /Good\s*\(123\)/ }));

    expect(scrollToSpy).not.toHaveBeenCalled();

    scrollToSpy.mockRestore();
  });

  it('does not scroll to top when toggling scroll mode', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    renderPage(<WorldsPage />);
    fireEvent.click(screen.getByRole('button', { name: /switch to pagination/i }));

    expect(scrollToSpy).not.toHaveBeenCalled();

    scrollToSpy.mockRestore();
  });

  it('renders mapped platform labels in list view', () => {
    window.localStorage.setItem('sos-worlds-view-mode', 'list');
    renderPage(<WorldsPage />);
    expect(screen.getByText(/Desktop, Android/)).toBeInTheDocument();
  });

  it('constrains the list container to the available width so rows cannot overflow', () => {
    window.localStorage.setItem('sos-worlds-view-mode', 'list');
    renderPage(<WorldsPage />);
    const listContainer = document.querySelector('.relative.w-full.min-w-0');
    expect(listContainer).not.toBeNull();
    const rows = listContainer?.querySelectorAll('[role="button"].card') ?? [];
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
      expect(row).toHaveClass('min-w-0');
    });
  });

  it('renders the number of results from the filtered query', () => {
    renderPage(<WorldsPage />);
    expect(screen.getByText(/Number of results:/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('keeps the number of results label visible while count is loading', () => {
    infiniteIsPending = true;
    renderPage(<WorldsPage />);
    expect(screen.getByText(/Number of results:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/loading result count/i)).toBeInTheDocument();
    infiniteIsPending = false;
  });

  it('navigates to world detail when a card is selected', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/worlds');
    renderPage(<WorldsPage />);

    const worldCard = screen.getByRole('button', { name: /details - test world/i });
    expect(worldCard).toBeInTheDocument();

    await user.click(worldCard);
    await waitFor(() => {
      expect(window.location.pathname).toBe('/worlds/wrld_1');
    });
  });

  describe('WorldsPage author filter', () => {
    it('seeds the search input from the ?search= URL param', () => {
      window.history.pushState({}, '', '/worlds?search=Tester');
      renderPage(<WorldsPage />);
      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
      expect(searchInput.value).toBe('Tester');
    });

    it('fills the search input and syncs URL when the author is clicked', async () => {
      const user = userEvent.setup();
      window.history.pushState({}, '', '/worlds');
      renderPage(<WorldsPage />);

      const authorButton = screen.getByRole('button', { name: /by tester/i });
      await user.click(authorButton);

      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
      expect(searchInput.value).toBe('Tester');
      await waitFor(() => {
        expect(window.location.search).toContain('search=Tester');
      });
    });

    it('replaces the existing search when a new author is clicked', async () => {
      const user = userEvent.setup();
      window.history.pushState({}, '', '/worlds?search=quest');
      renderPage(<WorldsPage />);

      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
      expect(searchInput.value).toBe('quest');

      await user.click(screen.getByRole('button', { name: /by tester/i }));

      expect(searchInput.value).toBe('Tester');
      await waitFor(() => {
        expect(window.location.search).toContain('search=Tester');
        expect(window.location.search).not.toContain('quest');
      });
    });

    it('preserves other URL filters when an author is clicked', async () => {
      const user = userEvent.setup();
      window.history.pushState({}, '', '/worlds?tag=chill');
      renderPage(<WorldsPage />);

      await user.click(screen.getByRole('button', { name: /by tester/i }));

      await waitFor(() => {
        expect(window.location.search).toContain('tag=chill');
        expect(window.location.search).toContain('search=Tester');
      });
    });

    it('wires the author click in the list view', async () => {
      const user = userEvent.setup();
      window.localStorage.setItem('sos-worlds-view-mode', 'list');
      window.history.pushState({}, '', '/worlds');
      renderPage(<WorldsPage />);

      const authorSpan = screen.getByLabelText(/by tester/i);
      await user.click(authorSpan);

      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
      expect(searchInput.value).toBe('Tester');
    });

    it('clears the search param from the URL when the input is emptied', async () => {
      const user = userEvent.setup();
      window.history.pushState({}, '', '/worlds?search=Tester');
      renderPage(<WorldsPage />);
      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
      await user.clear(searchInput);
      await waitFor(() => {
        expect(window.location.search).not.toContain('search=Tester');
      });
    });
  });

  describe('WorldsPage infinite scroll prefetch', () => {
    it('calls fetchNextPage when the virtualized range is at the end of the loaded data', () => {
      mockInfiniteFetchNextPage.mockClear();
      infiniteHasNextPage = true;

      renderPage(<WorldsPage />);

      // The default mock only has one world, so the virtualized range already
      // covers the end of the loaded data. The prefetch effect should fire
      // and request the next page.
      expect(mockInfiniteFetchNextPage).toHaveBeenCalled();
    });

    it('does not call fetchNextPage when there is no next page', () => {
      mockInfiniteFetchNextPage.mockClear();
      infiniteHasNextPage = false;

      renderPage(<WorldsPage />);

      expect(mockInfiniteFetchNextPage).not.toHaveBeenCalled();
    });
  });
});
