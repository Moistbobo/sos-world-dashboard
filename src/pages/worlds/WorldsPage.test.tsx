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
    fetchNextPage: vi.fn(),
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

  it('shows back-to-top button when scrolled past viewport height', () => {
    renderPage(<WorldsPage />);
    expect(screen.queryByLabelText(/back to top/i)).not.toBeInTheDocument();

    Object.defineProperty(window, 'scrollY', { value: window.innerHeight + 1, writable: true });
    fireEvent.scroll(window);

    expect(screen.getByLabelText(/back to top/i)).toBeInTheDocument();
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
    const rows = listContainer?.querySelectorAll('button.card') ?? [];
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

  it('renders quality and platform counts in the expanded filter bar', async () => {
    const user = userEvent.setup();

    renderPage(<WorldsPage />);
    await user.click(screen.getByRole('button', { name: /filters/i }));

    expect(screen.getByRole('button', { name: /Good\s*\(123\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bad\s*\(12\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Desktop\s*\(80\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Android\s*\(45\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iOS\s*\(6\)/ })).toBeInTheDocument();
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

  describe('WorldsPage capacity filter', () => {
    it('seeds capacity range from URL query params', () => {
      window.history.pushState({}, '', '/worlds?minCapacity=10&maxCapacity=40');
      renderPage(<WorldsPage />);
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      expect(screen.getByRole('spinbutton', { name: /minimum capacity/i })).toHaveValue(10);
      expect(screen.getByRole('spinbutton', { name: /maximum capacity/i })).toHaveValue(40);
    });

    it('updates URL when capacity range changes', () => {
      renderPage(<WorldsPage />);
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      const minInput = screen.getByRole('spinbutton', { name: /minimum capacity/i });
      fireEvent.change(minInput, { target: { value: '10' } });
      fireEvent.blur(minInput);
      expect(window.location.search).toContain('minCapacity=10');
    });
  });

  describe('WorldsPage platform filter', () => {
    it('seeds selected platforms from URL query params', async () => {
      window.history.pushState({}, '', '/worlds?platform=android&platform=ios');
      renderPage(<WorldsPage />);
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      expect(screen.getByTestId('platform-toggle-android')).toBeInTheDocument();
      expect(screen.getByTestId('platform-toggle-ios')).toBeInTheDocument();
      await waitFor(() =>
        expect(window.location.search).toBe('?platform=android&platform=ios')
      );
    });

    it('updates URL when platforms are selected', async () => {
      const user = userEvent.setup();
      renderPage(<WorldsPage />);
      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByTestId('platform-toggle-android'));
      expect(window.location.search).toContain('platform=android');
    });

  it('clears platform filters via Clear all', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/worlds?platform=android');
    renderPage(<WorldsPage />);
    await user.click(screen.getByRole('button', { name: /clear all/i }));
    expect(window.location.search).not.toContain('platform=android');
  });

  describe('WorldsPage date tagged filter', () => {
    it('seeds day range from URL query param', () => {
      window.history.pushState({}, '', '/worlds?dayRange=7');
      renderPage(<WorldsPage />);
      expect(screen.getByText('🏷️ Last 7 days')).toBeInTheDocument();
    });

    it('updates URL when a day range preset is selected', async () => {
      const user = userEvent.setup();
      renderPage(<WorldsPage />);
      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByTestId('day-range-preset-14'));
      expect(window.location.search).toContain('dayRange=14');
    });

    it('updates URL when a custom day range is typed', async () => {
      const user = userEvent.setup();
      renderPage(<WorldsPage />);
      await user.click(screen.getByRole('button', { name: /filters/i }));
      const input = screen.getByRole('spinbutton', { name: /custom/i });
      await user.type(input, '45');
      expect(window.location.search).toContain('dayRange=45');
    });

    it('keeps day range active when the same preset is clicked twice', async () => {
      const user = userEvent.setup();
      renderPage(<WorldsPage />);
      await user.click(screen.getByRole('button', { name: /filters/i }));
      const preset = screen.getByTestId('day-range-preset-14');

      await user.click(preset);
      expect(window.location.search).toContain('dayRange=14');

      await user.click(preset);
      expect(window.location.search).toContain('dayRange=14');
    });

    it('preserves custom input value when a different preset is selected', async () => {
      const user = userEvent.setup();
      renderPage(<WorldsPage />);
      await user.click(screen.getByRole('button', { name: /filters/i }));
      const input = screen.getByRole('spinbutton', { name: /custom/i });
      await user.type(input, '45');
      await user.click(screen.getByTestId('day-range-preset-14'));

      expect(input).toHaveValue(45);
      expect(window.location.search).toContain('dayRange=14');
    });

    it('preserves custom input value when it matches the selected preset', async () => {
      const user = userEvent.setup();
      renderPage(<WorldsPage />);
      await user.click(screen.getByRole('button', { name: /filters/i }));
      const input = screen.getByRole('spinbutton', { name: /custom/i });
      await user.type(input, '14');
      await user.click(screen.getByTestId('day-range-preset-14'));

      expect(input).toHaveValue(14);
      expect(window.location.search).toContain('dayRange=14');
    });

    it('clears day range via the remove chip button', async () => {
      const user = userEvent.setup();
      window.history.pushState({}, '', '/worlds?dayRange=7');
      renderPage(<WorldsPage />);
      await user.click(screen.getByRole('button', { name: /remove date tagged filter/i }));
      expect(window.location.search).not.toContain('dayRange=7');
    });

    it('clears day range via Clear all', async () => {
      const user = userEvent.setup();
      window.history.pushState({}, '', '/worlds?dayRange=7');
      renderPage(<WorldsPage />);
      await user.click(screen.getByRole('button', { name: /clear all/i }));
      expect(window.location.search).not.toContain('dayRange=7');
    });

    it('ignores invalid dayRange values in URL', async () => {
      window.history.pushState({}, '', '/worlds?dayRange=abc');
      renderPage(<WorldsPage />);
      expect(screen.queryByRole('button', { name: /remove date tagged filter/i })).not.toBeInTheDocument();
      await waitFor(() => {
        expect(window.location.search).not.toContain('dayRange=abc');
      });
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
});
});
