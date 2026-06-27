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
    window.confirm = vi.fn(() => true);
    render(<ListsPage />, { wrapper: Wrapper });
    await user.click(screen.getByRole('button', { name: /new list/i }));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Temp');
    await user.click(screen.getByRole('button', { name: /create list/i }));
    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.queryByText('Temp')).not.toBeInTheDocument();
  });

  it('opens import/export dialog from header', async () => {
    const user = userEvent.setup();
    render(<ListsPage />, { wrapper: Wrapper });
    await user.click(screen.getByRole('button', { name: /import \/ export/i }));
    expect(screen.getByText(/transfer your lists/i)).toBeInTheDocument();
  });

  it('opens import dialog from empty state', async () => {
    const user = userEvent.setup();
    render(<ListsPage />, { wrapper: Wrapper });
    await user.click(
      screen.getByRole('button', { name: /import lists from file/i }),
    );
    expect(screen.getByText(/transfer your lists/i)).toBeInTheDocument();
  });

  it('exports lists when export is clicked in the dialog', async () => {
    const user = userEvent.setup();
    vi.spyOn(listsImportExport, 'serializeLists').mockReturnValue('{}');
    vi.spyOn(listsImportExport, 'makeExportFilename').mockReturnValue(
      'sosd-all-lists-1.json',
    );
    const downloadJson = vi
      .spyOn(listsImportExport, 'downloadJson')
      .mockImplementation(() => {});

    render(<ListsPage />, { wrapper: Wrapper });
    await user.click(screen.getByRole('button', { name: /import \/ export/i }));
    await user.click(screen.getByRole('button', { name: /export all lists/i }));
    expect(downloadJson).toHaveBeenCalledWith('sosd-all-lists-1.json', '{}');
  });
});
