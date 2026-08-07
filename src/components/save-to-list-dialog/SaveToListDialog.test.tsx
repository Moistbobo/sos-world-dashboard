import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { ListsProvider, MAX_WORLDS_PER_LIST } from '../../contexts/ListsContext';
import { SaveToListDialog } from './SaveToListDialog';
import { LISTS_STORAGE_KEY } from '../../utils/listsStorage';
import type { WorldList } from '../../types/lists';

function makeFullList(): WorldList {
  return {
    id: 'list-full',
    name: 'Full List',
    icon: null,
    color: '#4f46e5',
    worldIds: Array(MAX_WORLDS_PER_LIST).fill('wrld_0'),
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };
}

function seedLists(lists: WorldList[]) {
  window.localStorage.setItem(
    LISTS_STORAGE_KEY,
    JSON.stringify({ version: 1, lists }),
  );
}

beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(toast.error).mockClear();
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ListsProvider>{children}</ListsProvider>;
}

describe('SaveToListDialog', () => {
  it('shows empty state when no lists exist', () => {
    render(
      <SaveToListDialog worldId="wrld_1" open={true} onOpenChange={vi.fn()} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText(/haven't created any lists/i)).toBeInTheDocument();
  });

  it('displays world count and cap for each list', async () => {
    const user = userEvent.setup();
    render(
      <SaveToListDialog worldId="wrld_1" open={true} onOpenChange={vi.fn()} />,
      { wrapper: Wrapper },
    );
    await user.click(screen.getByRole('button', { name: /create new list/i }));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Favorites');
    await user.click(screen.getByRole('button', { name: /create list/i }));

    expect(screen.getByText('1/5000')).toBeInTheDocument();
  });

  it('toggles a world in a list', async () => {
    const user = userEvent.setup();
    render(
      <SaveToListDialog worldId="wrld_1" open={true} onOpenChange={vi.fn()} />,
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

  it('shows a toast when a list has reached the world cap', async () => {
    seedLists([makeFullList()]);
    const user = userEvent.setup();
    render(
      <SaveToListDialog worldId="wrld_extra" open={true} onOpenChange={vi.fn()} />,
      { wrapper: Wrapper },
    );

    const checkbox = screen.getByRole('checkbox', { name: /full list/i });
    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('5000'),
    );
  });
});
