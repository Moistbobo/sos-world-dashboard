import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImportDialog } from './ImportDialog';
import * as listsImportExport from '../../utils/listsImportExport';

vi.mock('../../utils/listsImportExport', async () => {
  const actual = await vi.importActual('../../utils/listsImportExport');
  return {
    ...actual,
    validateWorldIds: vi.fn(),
  };
});

const sampleList = {
  id: 'l1',
  name: 'Favorites',
  icon: null,
  color: '#4f46e5',
  worldIds: ['wrld_1'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function setup() {
  const onOpenChange = vi.fn();
  const onImport = vi.fn();
  return {
    user: userEvent.setup(),
    onOpenChange,
    onImport,
    render: () =>
      render(
        <ImportDialog
          open
          existingLists={[]}
          onOpenChange={onOpenChange}
          onImport={onImport}
        />,
      ),
  };
}

function createJsonFile(contents: object, name = 'backup.json') {
  const blob = new Blob([JSON.stringify(contents)], {
    type: 'application/json',
  });
  return new File([blob], name, { type: 'application/json' });
}

describe('ImportDialog', () => {
  it('shows transfer screen', () => {
    setup().render();
    expect(screen.getByText(/transfer your lists/i)).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when close button clicked', async () => {
    const { user, onOpenChange, render } = setup();
    render();
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows preview after dropping a valid file', async () => {
    vi.mocked(listsImportExport.validateWorldIds).mockImplementation(
      async (ids) => ids,
    );
    const { onImport, render } = setup();
    render();
    const dropZone = screen.getByText(/drag and drop/i).parentElement!;
    const file = createJsonFile({ version: 1, lists: [sampleList] });
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });
    expect(await screen.findByText(/import preview/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /import 1 list/i }));
    expect(onImport).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: sampleList.id,
          name: sampleList.name,
          worldIds: sampleList.worldIds,
        }),
      ]),
      'backup.json',
    );
  });

  it('shows error for invalid json', async () => {
    const { render } = setup();
    render();
    const dropZone = screen.getByText(/drag and drop/i).parentElement!;
    const file = createJsonFile({ version: 1, lists: [{ id: 'bad' }] });
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });
    expect(await screen.findByText(/could not import/i)).toBeInTheDocument();
  });

  it('warns when worlds are removed after API validation', async () => {
    vi.mocked(listsImportExport.validateWorldIds).mockImplementation(
      async (ids) => ids.filter((id) => id === 'wrld_1'),
    );
    const { render } = setup();
    render();
    const dropZone = screen.getByText(/drag and drop/i).parentElement!;
    const file = createJsonFile({
      version: 1,
      lists: [{ ...sampleList, worldIds: ['wrld_1', 'wrld_deleted'] }],
    });
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });
    expect(
      await screen.findByText(/world\(s\) were not found/i),
    ).toBeInTheDocument();
  });
});
