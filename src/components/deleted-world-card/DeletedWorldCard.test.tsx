import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeletedWorldCard } from './DeletedWorldCard';

const writeText = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(navigator, { clipboard: { writeText } });
});

describe('DeletedWorldCard', () => {
  it('renders the deleted-world label and the world ID', () => {
    render(<DeletedWorldCard worldId="wrld_gone" onRemove={vi.fn()} />);
    expect(screen.getByText(/world deleted from db/i)).toBeInTheDocument();
    expect(screen.getByText('wrld_gone')).toBeInTheDocument();
  });

  it('calls onRemove when the X button is clicked', async () => {
    const onRemove = vi.fn();
    render(<DeletedWorldCard worldId="wrld_gone" onRemove={onRemove} />);
    await userEvent.click(
      screen.getByRole('button', { name: /remove world from list/i }),
    );
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
