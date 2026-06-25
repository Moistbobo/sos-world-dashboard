import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListsProvider, useLists } from './ListsContext';

beforeEach(() => {
  window.localStorage.clear();
});

function TestHelper() {
  const { lists, createList, addWorldToList, isWorldInAnyList } = useLists();
  return (
    <div>
      <span data-testid="count">{lists.length}</span>
      <button onClick={() => createList({ name: 'Favorites' })}>Create</button>
      <button onClick={() => addWorldToList(lists[0]?.id, 'wrld_1')}>Add</button>
      <span data-testid="saved">{isWorldInAnyList('wrld_1') ? 'yes' : 'no'}</span>
    </div>
  );
}

describe('ListsContext', () => {
  it('starts empty', () => {
    render(
      <ListsProvider>
        <TestHelper />
      </ListsProvider>,
    );
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('creates a list and persists it', () => {
    render(
      <ListsProvider>
        <TestHelper />
      </ListsProvider>,
    );
    fireEvent.click(screen.getByText('Create'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(window.localStorage.getItem('sos-world-lists')).toContain('Favorites');
  });

  it('adds a world to a list', () => {
    render(
      <ListsProvider>
        <TestHelper />
      </ListsProvider>,
    );
    fireEvent.click(screen.getByText('Create'));
    fireEvent.click(screen.getByText('Add'));
    expect(screen.getByTestId('saved').textContent).toBe('yes');
  });
});
