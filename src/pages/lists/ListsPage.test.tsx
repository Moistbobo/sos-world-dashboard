import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { toast } from 'sonner';
import { ListsProvider } from '../../contexts/ListsContext';
import { ListsPage } from './ListsPage';
import * as listsImportExport from '../../utils/listsImportExport';
import { resetListsDb, seedListsDb } from '../../test/listsDb';
import type { WorldList } from '../../types/lists';

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

let mePermissions: string[] = [];
let highPriorityCount: number | undefined;

useMeMock.mockImplementation(() => ({
  data: {
    name: 'Test User',
    role: mePermissions.includes('worlds:write') ? 'curator' : 'viewer',
    permissions: mePermissions,
  },
}));

useApiQueryMock.mockImplementation(() => ({
  data:
    highPriorityCount === undefined
      ? undefined
      : { worlds: [], total: highPriorityCount, limit: 1, offset: 0 },
}));

function makeList(id: string, name: string, overrides: Partial<WorldList> = {}): WorldList {
  return {
    id,
    name,
    icon: null,
    color: '#4f46e5',
    worldIds: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const sampleList = makeList('l1', 'Favorites', { worldIds: ['wrld_1'] });

beforeEach(async () => {
  window.localStorage.clear();
  await resetListsDb();
  vi.mocked(toast.success).mockClear();
  vi.spyOn(listsImportExport, 'validateWorldIds').mockImplementation(async (ids) => ids);
  mePermissions = [];
  highPriorityCount = undefined;
  useMeMock.mockClear();
  useApiQueryMock.mockClear();
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ListsProvider>{children}</ListsProvider>
    </MemoryRouter>
  );
}

function createJsonFile(contents: object, name = 'backup.json') {
  const blob = new Blob([JSON.stringify(contents)], { type: 'application/json' });
  return new File([blob], name, { type: 'application/json' });
}

async function seedLists(count: number) {
  await seedListsDb(
    Array.from({ length: count }, (_, i) => makeList(`list-${i}`, `List ${i}`)),
  );
}

async function renderPage() {
  const result = render(<ListsPage />, { wrapper: Wrapper });
  await waitFor(() => {
    expect(document.querySelector('[aria-busy="true"]')).toBeNull();
  });
  return result;
}

describe('ListsPage', () => {
  it('shows a success toast after importing a valid file', async () => {
    const user = userEvent.setup();
    await renderPage();
    await user.click(screen.getByRole('button', { name: /^import$/i }));

    const dropZone = screen.getByText(/drag and drop/i).parentElement!;
    const file = createJsonFile({ version: 1, lists: [sampleList] });
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    await screen.findByText(/import preview/i);
    await user.click(screen.getByRole('button', { name: /import 1 list/i }));

    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining('Imported'),
    );
  });

  it('shows empty state', async () => {
    await renderPage();
    expect(screen.getByText(/no lists yet/i)).toBeInTheDocument();
  });

  it('opens the new list dialog from the empty-state button', async () => {
    const user = userEvent.setup();
    await renderPage();
    await user.click(screen.getByRole('button', { name: /create your first list/i }));
    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
  });

  it('creates a list and displays it', async () => {
    const user = userEvent.setup();
    await renderPage();
    await user.click(screen.getByRole('button', { name: /new list/i }));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Favorites');
    await user.click(screen.getByRole('button', { name: /create list/i }));
    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });

  it('deletes a list after confirmation', async () => {
    const user = userEvent.setup();
    await renderPage();
    await user.click(screen.getByRole('button', { name: /new list/i }));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Temp');
    await user.click(screen.getByRole('button', { name: /create list/i }));
    await user.click(screen.getByRole('button', { name: /delete list/i }));
    expect(screen.getByText(/delete list/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() =>
      expect(screen.queryByText('Temp')).not.toBeInTheDocument(),
    );
  });

  it('opens import dialog from header', async () => {
    const user = userEvent.setup();
    await renderPage();
    await user.click(screen.getByRole('button', { name: /^import$/i }));
    expect(screen.getByText(/transfer your lists/i)).toBeInTheDocument();
  });

  it('exports a list when its export icon is clicked', async () => {
    const user = userEvent.setup();
    vi.spyOn(listsImportExport, 'serializeLists').mockReturnValue('{}');
    vi.spyOn(listsImportExport, 'makeExportFilename').mockReturnValue(
      'sosd-favorites-1.json',
    );
    const downloadJson = vi
      .spyOn(listsImportExport, 'downloadJson')
      .mockImplementation(() => {});

    await seedListsDb([sampleList]);

    await renderPage();
    await user.click(screen.getByRole('button', { name: /export list/i }));
    expect(downloadJson).toHaveBeenCalledWith('sosd-favorites-1.json', '{}');
  });

  it('shows a list counter of the current list count', async () => {
    await seedLists(3);
    await renderPage();
    expect(screen.getByTestId('list-count')).toHaveTextContent('(3 lists)');
  });

  it('uses the singular label when there is exactly one list', async () => {
    await seedLists(1);
    await renderPage();
    expect(screen.getByTestId('list-count')).toHaveTextContent('(1 list)');
  });

  it('allows creating a list beyond the former cap', async () => {
    const user = userEvent.setup();
    await seedLists(10);
    await renderPage();
    await user.click(screen.getByRole('button', { name: /new list/i }));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Beyond');
    await user.click(screen.getByRole('button', { name: /create list/i }));
    expect(screen.getByText('Beyond')).toBeInTheDocument();
    expect(screen.getByTestId('list-count')).toHaveTextContent('(11 lists)');
  });
});

describe('ListsPage high priority card', () => {
  it('hides the card and disables the count query for viewers', async () => {
    await renderPage();
    expect(screen.queryByText('High Priority')).not.toBeInTheDocument();
    expect(
      (useApiQueryMock.mock.calls[0]?.[0] as { enabled?: boolean }).enabled,
    ).toBe(false);
  });

  it('shows the card with the world count for curators', async () => {
    mePermissions = ['worlds:read', 'worlds:write'];
    highPriorityCount = 7;
    await renderPage();
    expect(screen.getByText('High Priority')).toBeInTheDocument();
    expect(screen.getByText('7 worlds')).toBeInTheDocument();
  });

  it('navigates to the high priority page when clicked', async () => {
    const user = userEvent.setup();
    mePermissions = ['worlds:read', 'worlds:write'];
    highPriorityCount = 3;

    render(
      <MemoryRouter initialEntries={['/lists']}>
        <ListsProvider>
          <Routes>
            <Route path="/lists" element={<ListsPage />} />
            <Route path="/lists/high-priority" element={<div>HP PAGE</div>} />
          </Routes>
        </ListsProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.querySelector('[aria-busy="true"]')).toBeNull();
    });
    await user.click(screen.getByText('High Priority'));
    expect(await screen.findByText('HP PAGE')).toBeInTheDocument();
  });
});
