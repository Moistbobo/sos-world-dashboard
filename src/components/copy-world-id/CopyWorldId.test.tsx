import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { CopyWorldId } from './CopyWorldId';

const writeText = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(navigator, { clipboard: { writeText } });
});

describe('CopyWorldId', () => {
  it('renders the world ID text alongside a copy icon', () => {
    render(<CopyWorldId worldId="wrld_abc123" />);

    expect(screen.getByTestId('copy-world-id')).toBeInTheDocument();
    expect(screen.getByText(/ID: wrld_abc123/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Copy world ID wrld_abc123/i)).toBeInTheDocument();
  });

  it('copies the world ID to the clipboard and shows a success toast when clicked', async () => {
    writeText.mockResolvedValue(undefined);

    render(<CopyWorldId worldId="wrld_abc123" />);
    await userEvent.click(screen.getByTestId('copy-world-id'));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith('wrld_abc123');
    expect(toast.success).toHaveBeenCalledWith('World ID copied to clipboard');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows an error toast when the clipboard API rejects', async () => {
    writeText.mockRejectedValue(new Error('permission denied'));

    render(<CopyWorldId worldId="wrld_abc123" />);
    await userEvent.click(screen.getByTestId('copy-world-id'));

    expect(writeText).toHaveBeenCalledWith('wrld_abc123');
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Could not copy world ID');
  });

  it('calls event.stopPropagation so the click does not propagate to ancestors', () => {
    writeText.mockResolvedValue(undefined);

    const onParentClick = vi.fn();
    render(
      <div data-testid="parent" onClick={onParentClick}>
        <CopyWorldId worldId="wrld_abc123" />
      </div>,
    );

    return userEvent.click(screen.getByTestId('copy-world-id')).then(() => {
      expect(onParentClick).not.toHaveBeenCalled();
    });
  });

  it('applies hover and cursor-pointer styles', () => {
    render(<CopyWorldId worldId="wrld_abc123" />);

    const button = screen.getByTestId('copy-world-id');
    expect(button).toHaveClass('cursor-pointer');
    expect(button).toHaveClass('hover:text-indigo-600');
    expect(button).toHaveClass('dark:hover:text-indigo-400');
    expect(button).toHaveClass('transition-colors');
    expect(button).toHaveClass('whitespace-nowrap');
  });
});
