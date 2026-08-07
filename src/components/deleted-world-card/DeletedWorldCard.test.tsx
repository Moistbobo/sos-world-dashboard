import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
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

  it('copies the world ID to the clipboard and shows a success toast when clicked', async () => {
    writeText.mockResolvedValue(undefined);
    render(<DeletedWorldCard worldId="wrld_gone" onRemove={vi.fn()} />);
    await userEvent.click(
      screen.getByLabelText(/copy world id wrld_gone/i),
    );
    expect(writeText).toHaveBeenCalledWith('wrld_gone');
    expect(toast.success).toHaveBeenCalledWith('World ID copied to clipboard');
  });

  it('shows an error toast when the clipboard API rejects', async () => {
    writeText.mockRejectedValue(new Error('permission denied'));
    render(<DeletedWorldCard worldId="wrld_gone" onRemove={vi.fn()} />);
    await userEvent.click(
      screen.getByLabelText(/copy world id wrld_gone/i),
    );
    expect(toast.error).toHaveBeenCalledWith('Could not copy world ID');
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
