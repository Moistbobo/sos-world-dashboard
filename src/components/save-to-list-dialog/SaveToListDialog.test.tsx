import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListsProvider } from '../../contexts/ListsContext';
import { SaveToListDialog } from './SaveToListDialog';
import { resetListsDb, seedListsDb } from '../../test/listsDb';
import type { WorldList } from '../../types/lists';

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

beforeEach(async () => {
  window.localStorage.clear();
  await resetListsDb();
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ListsProvider>{children}</ListsProvider>;
}

async function renderDialog() {
  const result = render(
    <SaveToListDialog worldId="wrld_1" open={true} onOpenChange={vi.fn()} />,
    { wrapper: Wrapper },
  );
  await screen.findByRole('dialog', undefined, { timeout: 2000 });
  await screen.findByText(/create new list/i, undefined, { timeout: 2000 });
  return result;
}

describe('SaveToListDialog', () => {
  it('renders the overlay as a descendant of document.body', async () => {
    const { container } = await renderDialog();
    const dialog = screen.getByRole('dialog');
    expect(container).not.toContainElement(dialog);
    expect(document.body).toContainElement(dialog);
  });

  it('renders the nested create-list dialog as a descendant of document.body', async () => {
    const user = userEvent.setup();
    await renderDialog();
    await user.click(screen.getByRole('button', { name: /create new list/i }));
    const dialogs = screen.getAllByRole('dialog');
    expect(dialogs).toHaveLength(2);
    expect(document.body).toContainElement(dialogs[1]);
  });

  it('shows empty state when no lists exist', async () => {
    await renderDialog();
    expect(screen.getByText(/haven't created any lists/i)).toBeInTheDocument();
  });

  it('displays world count for each list', async () => {
    await seedListsDb([makeList('list-1', 'Favorites', { worldIds: ['wrld_0'] })]);
    await renderDialog();

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('toggles a world in a list', async () => {
    await seedListsDb([makeList('list-1', 'Favorites')]);
    const user = userEvent.setup();
    await renderDialog();

    const checkbox = screen.getByRole('checkbox', { name: /favorites/i });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('creates a new list and adds the world to it', async () => {
    const user = userEvent.setup();
    await renderDialog();
    await user.click(screen.getByRole('button', { name: /create new list/i }));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Favorites');
    await user.click(screen.getByRole('button', { name: /create list/i }));

    const checkbox = screen.getByRole('checkbox', { name: /favorites/i });
    expect(checkbox).toBeChecked();
  });

  it('shows many lists without a cap guard', async () => {
    await seedListsDb(
      Array.from({ length: 12 }, (_, i) => makeList(`list-${i}`, `List ${i}`)),
    );
    const user = userEvent.setup();
    await renderDialog();

    await user.click(screen.getByRole('button', { name: /create new list/i }));
    expect(
      screen.getByRole('textbox', { name: /name/i }),
    ).toBeInTheDocument();
  });
});
