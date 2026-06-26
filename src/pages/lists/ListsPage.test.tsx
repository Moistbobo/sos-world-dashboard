import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ListsProvider } from '../../contexts/ListsContext';
import { ListsPage } from './ListsPage';

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
});
