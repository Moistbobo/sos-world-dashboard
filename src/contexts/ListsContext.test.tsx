import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListsProvider, useLists } from './ListsContext';
import * as listsImportExport from '../utils/listsImportExport';

beforeEach(() => {
  window.localStorage.clear();
});

function TestHelper() {
  const {
    lists,
    createList,
    addWorldToList,
    isWorldInAnyList,
    exportList,
    importLists,
  } = useLists();
  return (
    <div>
      <span data-testid="count">{lists.length}</span>
      <button onClick={() => createList({ name: 'Favorites' })}>Create</button>
      <button onClick={() => addWorldToList(lists[0]?.id, 'wrld_1')}>
        Add
      </button>
      <span data-testid="saved">
        {isWorldInAnyList('wrld_1') ? 'yes' : 'no'}
      </span>
      <button
        onClick={() =>
          exportList({
            id: 'exp1',
            name: 'Exportable',
            icon: null,
            color: '#ffffff',
            worldIds: ['wrld_2'],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          })
        }
      >
        Export
      </button>
      <button
        onClick={() =>
          importLists([
            {
              id: 'imp1',
              name: 'Imported',
              icon: null,
              color: '#ffffff',
              worldIds: ['wrld_1'],
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          ])
        }
      >
        Import
      </button>
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
    expect(window.localStorage.getItem('sos-world-lists')).toContain(
      'Favorites',
    );
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

  it('exports lists', () => {
    vi.spyOn(listsImportExport, 'serializeLists').mockReturnValue('{}');
    vi.spyOn(listsImportExport, 'makeExportFilename').mockReturnValue(
      'sosd-exportable-1.json',
    );
    const downloadJson = vi
      .spyOn(listsImportExport, 'downloadJson')
      .mockImplementation(() => {});

    render(
      <ListsProvider>
        <TestHelper />
      </ListsProvider>,
    );
    fireEvent.click(screen.getByText('Create'));
    fireEvent.click(screen.getByText('Export'));
    expect(downloadJson).toHaveBeenCalledWith(
      'sosd-exportable-1.json',
      '{}',
    );
  });

  it('imports lists by id merge', () => {
    render(
      <ListsProvider>
        <TestHelper />
      </ListsProvider>,
    );
    fireEvent.click(screen.getByText('Create'));
    fireEvent.click(screen.getByText('Import'));
    expect(screen.getByTestId('count').textContent).toBe('2');
  });
});
