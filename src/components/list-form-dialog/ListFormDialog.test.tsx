import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListFormDialog } from './ListFormDialog';

beforeEach(() => {
  window.localStorage.clear();
});

describe('ListFormDialog', () => {
  it('renders create mode with empty name field', () => {
    render(<ListFormDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('');
    expect(screen.queryByRole('textbox', { name: /icon/i })).not.toBeInTheDocument();
  });

  it('submits a new list', async () => {
    const onSubmit = vi.fn();
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
          worldIds: [],
          createdAt: '',
          updatedAt: '',
        }}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Old');
  });
});
