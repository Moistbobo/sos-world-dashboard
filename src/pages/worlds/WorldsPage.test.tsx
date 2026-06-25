import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { WorldsPage } from './WorldsPage';
import { WorldsPreferencesProvider } from '../../contexts/WorldsPreferencesContext';

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
        <BrowserRouter>{children}</BrowserRouter>
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
let lastInfiniteParams: unknown;

vi.mock('../../hooks/useApi', () => ({
  useTags: () => ({ data: { tags: [] } }),
  useWorlds: () => ({
    data: { worlds: mockWorlds, total: 1, limit: 20, offset: 0 },
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useInfiniteWorlds: (params: unknown) => {
    lastInfiniteParams = params;
    return {
      data: { pages: [{ worlds: mockWorlds, total: 1, limit: 20, offset: 0 }] },
      isPending: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
      hasNextPage: infiniteHasNextPage,
      isFetchingNextPage: false,
    };
  },
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
    lastInfiniteParams = undefined;
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

  it('does not render a detail overlay by default', () => {
    renderPage(<WorldsPage />);
    expect(document.querySelector('.fixed.inset-0.z-50')).not.toBeInTheDocument();
  });

  it('renders mapped platform labels in list view', () => {
    window.localStorage.setItem('sos-worlds-view-mode', 'list');
    renderPage(<WorldsPage />);
    expect(screen.getByText(/Desktop, Android/)).toBeInTheDocument();
  });

  it('renders the detail overlay when a world id is in the URL', async () => {
    window.history.pushState({}, '', '/worlds/wrld_1');
    renderPage(<WorldsPage />);
    await waitFor(() => {
      expect(document.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
    });
  });

  it('closes the detail overlay when the backdrop is clicked', async () => {
    window.history.pushState({}, '', '/worlds/wrld_1');
    renderPage(<WorldsPage />);
    const backdrop = await waitFor(() => {
      const el = document.querySelector('.fixed.inset-0.z-50');
      expect(el).toBeInTheDocument();
      return el as HTMLElement;
    });

    fireEvent.click(backdrop);
    await waitFor(() => {
      expect(document.querySelector('.fixed.inset-0.z-50')).not.toBeInTheDocument();
    });
  });

  it('does not close the detail overlay when the modal content is clicked', async () => {
    window.history.pushState({}, '', '/worlds/wrld_1');
    renderPage(<WorldsPage />);
    await waitFor(() => {
      expect(document.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
    });

    const heading = screen.getByRole('heading', { level: 1, name: /test world/i });
    fireEvent.click(heading);
    expect(document.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
  });

  it('prefills the tag filter when navigating from a world detail tag', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/worlds/wrld_1');
    renderPage(<WorldsPage />);

    await waitFor(() => {
      expect(document.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
    });

    const overlay = document.querySelector('.fixed.inset-0.z-50') as HTMLElement;
    const tagButton = within(overlay).getByTitle('chill');
    expect(tagButton).toBeInTheDocument();

    await user.click(tagButton);

    await waitFor(() => {
      expect(window.location.search).toContain('tag=chill');
    });
    await waitFor(() => {
      expect(document.querySelector('.fixed.inset-0.z-50')).not.toBeInTheDocument();
    });

    // Active tag chip visible in the filter bar
    expect(within(screen.getByTestId('filter-bar-header')).getByText('chill')).toBeInTheDocument();

    // Active filter count badge shows 1
    expect(screen.getByRole('button', { name: /filters/i }).textContent).toContain('1');

    // The infinite query is called with the selected tag
    await waitFor(() => {
      expect((lastInfiniteParams as { tag?: string[] } | undefined)?.tag).toEqual(['chill']);
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
  });
});
