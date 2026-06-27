import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ListsProvider } from '../../contexts/ListsContext';
import { ListsPage } from './ListsPage';
import * as listsImportExport from '../../utils/listsImportExport';

beforeEach(() => {
  window.localStorage.clear();
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ListsProvider>{children}</ListsProvider>
    </MemoryRouter>
  );
}

const sampleList = {
  id: 'l1',
  name: 'Favorites',
  icon: null,
  color: '#4f46e5',
  worldIds: ['wrld_1'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('ListsPage', () => {
  it('shows empty state', () => {
    render(<ListsPage />, { wrapper: Wrapper });
    expect(screen.getByText(/no lists yet/i)).toBeInTheDocument();
  });

  it('creates a list and displays it', async () => {
    const user = userEvent.setup();
    render(<ListsPage />, { wrapper: Wrapper });
    await user.click(screen.getByRole('button', { name: /new list/i }));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Favorites');
    await user.click(screen.getByRole('button', { name: /create list/i }));
    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });

  it('deletes a list after confirmation', async () => {
    const user = userEvent.setup();
    render(<ListsPage />, { wrapper: Wrapper });
    await user.click(screen.getByRole('button', { name: /new list/i }));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Temp');
    await user.click(screen.getByRole('button', { name: /create list/i }));
    await user.click(screen.getByRole('button', { name: /delete list/i }));
    expect(screen.getByText(/delete list/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(screen.queryByText('Temp')).not.toBeInTheDocument();
  });

  it('opens import dialog from header', async () => {
    const user = userEvent.setup();
    render(<ListsPage />, { wrapper: Wrapper });
    await user.click(screen.getByRole('button', { name: /^import$/i }));
    expect(screen.getByText(/transfer your lists/i)).toBeInTheDocument();
  });

  it('opens import dialog from header when lists are empty', async () => {
    const user = userEvent.setup();
    render(<ListsPage />, { wrapper: Wrapper });
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

    window.localStorage.setItem(
      'sos-world-lists',
      JSON.stringify({ version: 1, lists: [sampleList] }),
    );

    render(<ListsPage />, { wrapper: Wrapper });
    await user.click(screen.getByRole('button', { name: /export list/i }));
    expect(downloadJson).toHaveBeenCalledWith('sosd-favorites-1.json', '{}');
  });
});
