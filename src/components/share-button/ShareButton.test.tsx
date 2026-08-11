import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { ShareButton } from './ShareButton';
import type { World } from '../../types';

const writeText = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(navigator, { clipboard: { writeText } });
});

const baseWorld: World = {
  worldId: 'wrld_abc123',
  name: 'Test World',
  authorName: 'Author',
  capacity: 16,
  platforms: ['pc'],
  tags: [],
  imageUrl: 'https://example.com/img.png',
  vrchatUrl: 'https://vrchat.com/home/world/wrld_abc123',
  quality: null,
  createdAt: '2024-01-01T00:00:00Z',
};

describe('ShareButton', () => {
  it('copies the vrchat URL to the clipboard and shows a success toast when clicked', async () => {
    writeText.mockResolvedValue(undefined);

    render(<ShareButton world={baseWorld} />);
    await userEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(baseWorld.vrchatUrl);
    expect(toast.success).toHaveBeenCalledWith('VRChat world URL copied');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows an error toast when the clipboard API rejects', async () => {
    writeText.mockRejectedValue(new Error('permission denied'));

    render(<ShareButton world={baseWorld} />);
    await userEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(writeText).toHaveBeenCalledWith(baseWorld.vrchatUrl);
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Could not copy link');
  });

  it('disables the button when vrchatUrl is empty (iconOnly)', () => {
    const worldWithoutUrl = { ...baseWorld, vrchatUrl: '' };

    render(<ShareButton world={worldWithoutUrl} iconOnly />);
    const button = screen.getByRole('button', { name: /share/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', 'No VRChat link to share');
  });

  it('disables the button when vrchatUrl is empty (labelled)', () => {
    const worldWithoutUrl = { ...baseWorld, vrchatUrl: '' };

    render(<ShareButton world={worldWithoutUrl} />);
    const button = screen.getByRole('button', { name: /share/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', 'No VRChat link to share');
  });

  it('never writes to the clipboard when vrchatUrl is empty', async () => {
    const worldWithoutUrl = { ...baseWorld, vrchatUrl: '' };

    render(<ShareButton world={worldWithoutUrl} />);
    await userEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(writeText).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });



  it('calls event.stopPropagation so the click does not propagate to ancestors', async () => {
    writeText.mockResolvedValue(undefined);

    const onParentClick = vi.fn();
    render(
      <div data-testid="parent" onClick={onParentClick}>
        <ShareButton world={baseWorld} />
      </div>,
    );

    await userEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(onParentClick).not.toHaveBeenCalled();
  });
});
