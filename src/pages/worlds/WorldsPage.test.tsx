import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { WorldsPage } from './WorldsPage';
import { WorldsPreferencesProvider } from '../../contexts/WorldsPreferencesContext';
import { ListsProvider } from '../../contexts/ListsContext';

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
  beforeEach(() => {
    infiniteHasNextPage = true;
    queryClient.clear();
    window.localStorage.clear();
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

  it('shows back-to-top button when scrolled past viewport height', () => {
    renderPage(<WorldsPage />);
    expect(screen.queryByLabelText(/back to top/i)).not.toBeInTheDocument();

    Object.defineProperty(window, 'scrollY', { value: window.innerHeight + 1, writable: true });
    fireEvent.scroll(window);

    expect(screen.getByLabelText(/back to top/i)).toBeInTheDocument();
  });

  it('renders mapped platform labels in list view', () => {
    window.localStorage.setItem('sos-worlds-view-mode', 'list');
    renderPage(<WorldsPage />);
    expect(screen.getByText(/Desktop, Android/)).toBeInTheDocument();
  });

  it('renders the number of results from the filtered query', () => {
    renderPage(<WorldsPage />);
    expect(screen.getByText(/Number of results: 1/i)).toBeInTheDocument();
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
});
});
