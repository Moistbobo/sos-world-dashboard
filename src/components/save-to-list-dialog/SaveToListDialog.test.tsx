import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListsProvider } from '../../contexts/ListsContext';
import { SaveToListDialog } from './SaveToListDialog';

beforeEach(() => {
  window.localStorage.clear();
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ListsProvider>{children}</ListsProvider>;
}

describe('SaveToListDialog', () => {
  it('shows empty state when no lists exist', () => {
    render(<SaveToListDialog worldId="wrld_1" open={true} onOpenChange={vi.fn()} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText(/haven't created any lists/i)).toBeInTheDocument();
  });

  it('displays world count and cap for each list', async () => {
    const user = userEvent.setup();
    render(<SaveToListDialog worldId="wrld_1" open={true} onOpenChange={vi.fn()} />,
      { wrapper: Wrapper },
    );
    await user.click(screen.getByRole('button', { name: /create new list/i }));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Favorites');
    await user.click(screen.getByRole('button', { name: /create list/i }));

    expect(screen.getByText('1/250')).toBeInTheDocument();
  });

  it('toggles a world in a list', async () => {
    const user = userEvent.setup();
    render(<SaveToListDialog worldId="wrld_1" open={true} onOpenChange={vi.fn()} />,
      { wrapper: Wrapper },
    );
    await user.click(screen.getByRole('button', { name: /create new list/i }));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Favorites');
    await user.click(screen.getByRole('button', { name: /create list/i }));

    const checkbox = screen.getByRole('checkbox', { name: /favorites/i });
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
