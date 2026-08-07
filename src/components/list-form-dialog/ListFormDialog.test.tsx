import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListFormDialog } from './ListFormDialog';
import { MAX_LIST_MEMO_LENGTH } from '../../utils/listMemoValidation';

beforeEach(() => {
  window.localStorage.clear();
});

describe('ListFormDialog', () => {
  it('renders the overlay as a descendant of document.body', () => {
    const { container } = render(
      <ListFormDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} />,
    );
    const dialog = screen.getByRole('dialog');
    expect(container).not.toContainElement(dialog);
    expect(document.body).toContainElement(dialog);
  });

  it('clears the form after a successful create', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <ListFormDialog
        open={true}
        onOpenChange={onOpenChange}
        onSubmit={() => true}
      />,
    );
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Favorites');
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('');
  });

  it('keeps the form when create fails', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <ListFormDialog
        open={true}
        onOpenChange={onOpenChange}
        onSubmit={() => false}
      />,
    );
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Favorites');
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue(
      'Favorites',
    );
  });

  it('renders create mode with empty name field', () => {
    render(<ListFormDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('');
    expect(screen.queryByRole('textbox', { name: /icon/i })).not.toBeInTheDocument();
  });

  it('gives the memo textarea the same input styling as the title field', () => {
    render(<ListFormDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: /memo/i })).toHaveClass('input');
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveClass('input');
  });

  it('submits a new list', async () => {
    const onSubmit = vi.fn(() => true);
    const user = userEvent.setup();
    render(<ListFormDialog open={true} onOpenChange={vi.fn()} onSubmit={onSubmit} />);
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Favorites');
    await user.click(screen.getByRole('button', { name: /create/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Favorites' }),
    );
  });

  it('prevents submit when name is empty', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ListFormDialog open={true} onOpenChange={vi.fn()} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: /create/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('fills fields for editing', () => {
    render(
      <ListFormDialog
        open={true}
        list={{
          id: 'l1',
          name: 'Old',
          icon: null,
          color: '#ff0000',
          memo: 'Existing memo',
          worldIds: [],
          createdAt: '',
          updatedAt: '',
        }}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Old');
    expect(screen.getByRole('textbox', { name: /memo/i })).toHaveValue(
      'Existing memo',
    );
  });

  it('submits the memo with the list', async () => {
    const onSubmit = vi.fn(() => true);
    const user = userEvent.setup();
    render(<ListFormDialog open={true} onOpenChange={vi.fn()} onSubmit={onSubmit} />);
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Favorites');
    await user.type(
      screen.getByRole('textbox', { name: /memo/i }),
      'my memo',
    );
    await user.click(screen.getByRole('button', { name: /create/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Favorites', memo: 'my memo' }),
    );
  });

  it('shows a live counter', async () => {
    const user = userEvent.setup();
    render(<ListFormDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} />);
    await user.type(
      screen.getByRole('textbox', { name: /memo/i }),
      'abc',
    );
    expect(screen.getByText('3 / 512')).toBeInTheDocument();
  });

  it('blocks save when the memo is over the limit', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ListFormDialog open={true} onOpenChange={vi.fn()} onSubmit={onSubmit} />);
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Favorites');
    await user.type(
      screen.getByRole('textbox', { name: /memo/i }),
      'x'.repeat(MAX_LIST_MEMO_LENGTH + 1),
    );
    expect(screen.getByText(`${MAX_LIST_MEMO_LENGTH + 1} / 512`)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /create/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
