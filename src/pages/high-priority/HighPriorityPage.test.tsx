import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HighPriorityPage } from './HighPriorityPage';
import { WorldsPreferencesProvider } from '../../contexts/WorldsPreferencesContext';
import { ListsProvider } from '../../contexts/ListsContext';
import { resetListsDb } from '../../test/listsDb';
import type { PaginatedWorlds, World } from '../../types';

const { useMeMock, useApiQueryMock } = vi.hoisted(() => ({
  useMeMock: vi.fn(),
  useApiQueryMock: vi.fn(),
}));

vi.mock('../../hooks/useApi', () => ({
  useMe: () => useMeMock(),
}));

vi.mock('../../hooks/useApiToasts', () => ({
  useApiQuery: (options: unknown) => useApiQueryMock(options),
}));

function createMockWorld(overrides: Partial<World> = {}): World {
  return {
    worldId: 'wrld_1',
    name: 'Test World',
    authorName: 'Tester',
    capacity: 40,
    platforms: ['standalonewindows', 'android'],
    tags: ['chill'],
    imageUrl: '',
    vrchatUrl: '',
    quality: 'good',
    createdAt: '2024-01-01',
    internalAddDate: '2024-02-01',
    highPriority: true,
    ...overrides,
  };
}

let mePermissions: string[] = [];
let queryData: PaginatedWorlds | undefined;
let queryIsPending = false;
let queryIsError = false;
let queryError: Error | null = null;

useMeMock.mockImplementation(() => ({
  data: {
    name: 'Test User',
    role: mePermissions.includes('worlds:write') ? 'curator' : 'viewer',
    permissions: mePermissions,
  },
}));

useApiQueryMock.mockImplementation(() => ({
  data: queryData,
  isPending: queryIsPending,
  isError: queryIsError,
  error: queryError,
  refetch: vi.fn(),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <WorldsPreferencesProvider>
        <ListsProvider>{children}</ListsProvider>
      </WorldsPreferencesProvider>
    </MemoryRouter>
  );
}

function lastQueryOptions() {
  return useApiQueryMock.mock.calls[useApiQueryMock.mock.calls.length - 1][0] as {
    enabled: boolean;
    queryKey: unknown[];
  };
}

describe('HighPriorityPage', () => {
  beforeEach(async () => {
    mePermissions = [];
    queryData = undefined;
    queryIsPending = false;
    queryIsError = false;
    queryError = null;
    useMeMock.mockClear();
    useApiQueryMock.mockClear();
    window.localStorage.clear();
    await resetListsDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the curator gate and does not fetch worlds for viewers', () => {
    render(<HighPriorityPage />, { wrapper: Wrapper });

    expect(screen.getByText('Curator access required')).toBeInTheDocument();
    expect(screen.getByText(/enter a curator api token in settings/i)).toBeInTheDocument();
    expect(useApiQueryMock).toHaveBeenCalledTimes(1);
    expect(lastQueryOptions().enabled).toBe(false);
  });

  it('renders high priority worlds for curators', () => {
    mePermissions = ['worlds:read', 'worlds:write'];
    queryData = {
      worlds: [createMockWorld({ name: 'Priority World' })],
      total: 1,
      limit: 28,
      offset: 0,
    };

    render(<HighPriorityPage />, { wrapper: Wrapper });

    expect(screen.getByText('Priority World')).toBeInTheDocument();
    expect(lastQueryOptions().enabled).toBe(true);
    expect(lastQueryOptions().queryKey).toEqual(
      expect.arrayContaining(['worlds', 'high-priority']),
    );
  });

  it('renders the empty state', () => {
    mePermissions = ['worlds:write'];
    queryData = { worlds: [], total: 0, limit: 28, offset: 0 };

    render(<HighPriorityPage />, { wrapper: Wrapper });

    expect(screen.getByText('No high priority worlds yet.')).toBeInTheDocument();
  });

  it('provides a search input that updates the query after the debounce', async () => {
    const user = userEvent.setup();
    mePermissions = ['worlds:write'];
    queryData = { worlds: [], total: 0, limit: 28, offset: 0 };

    render(<HighPriorityPage />, { wrapper: Wrapper });

    const input = screen.getByRole('textbox', { name: /search high priority worlds/i });
    await user.type(input, 'quest');

    await waitFor(() => {
      const queryKey = lastQueryOptions().queryKey[2] as { search: string };
      expect(queryKey.search).toBe('quest');
    });
  });

  it('shows pagination controls and pages through results', async () => {
    const user = userEvent.setup();
    mePermissions = ['worlds:write'];
    queryData = {
      worlds: [createMockWorld(), createMockWorld({ worldId: 'wrld_2', name: 'Second' })],
      total: 60,
      limit: 28,
      offset: 0,
    };

    render(<HighPriorityPage />, { wrapper: Wrapper });

    expect(screen.getByText(/of 60/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '2' }));

    await waitFor(() => {
      const queryKey = lastQueryOptions().queryKey[2] as { offset: number };
      expect(queryKey.offset).toBe(28);
    });
  });

  it('renders the load error message', () => {
    mePermissions = ['worlds:write'];
    queryIsError = true;
    queryError = new Error('boom');

    render(<HighPriorityPage />, { wrapper: Wrapper });

    expect(
      screen.getByText(/failed to load high priority worlds: boom/i),
    ).toBeInTheDocument();
  });

  it('switches between grid and list view', () => {
    mePermissions = ['worlds:write'];
    queryData = { worlds: [createMockWorld()], total: 1, limit: 28, offset: 0 };

    render(<HighPriorityPage />, { wrapper: Wrapper });

    fireEvent.click(screen.getByRole('button', { name: /list view/i }));

    expect(document.querySelector('div[role="button"].card')).not.toBeNull();
  });
});
