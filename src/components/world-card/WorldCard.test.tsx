import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorldCard } from '../world-card';

const mockWorld = {
  worldId: 'wrld_test',
  name: 'Test World',
  authorName: 'Tester',
  capacity: 40,
  platforms: ['standalonewindows', 'android', 'ios'],
  tags: ['chill'],
  imageUrl: '',
  vrchatUrl: 'https://vrchat.com/home/world/wrld_test',
  quality: 'good' as const,
  createdAt: '2024-01-01',
};

describe('WorldCard', () => {
  it('renders world name and author', () => {
    render(<WorldCard world={mockWorld} />);
    expect(screen.getByText('Test World')).toBeInTheDocument();
    expect(screen.getByText(/by Tester/)).toBeInTheDocument();
  });

  it('renders mapped platform chips', () => {
    render(<WorldCard world={mockWorld} />);
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Android')).toBeInTheDocument();
    expect(screen.getByText('iOS')).toBeInTheDocument();
  });

  it('calls onSelect when the card is clicked', () => {
    const onSelect = vi.fn();
    render(<WorldCard world={mockWorld} onSelect={onSelect} />);
    screen.getByLabelText(/Details - Test World/).click();
    expect(onSelect).toHaveBeenCalledWith('wrld_test');
  });

  it('renders a share button that copies the VRChat URL', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<WorldCard world={mockWorld} onSelect={vi.fn()} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeInTheDocument();

    await userEvent.click(shareButton);

    expect(writeText).toHaveBeenCalledWith(mockWorld.vrchatUrl);
  });

  it('calls onTagClick when a tag is clicked', async () => {
    const onTagClick = vi.fn();
    render(
      <WorldCard world={mockWorld} onSelect={vi.fn()} onTagClick={onTagClick} />,
    );

    const tagButton = screen.getByTitle('chill');
    await userEvent.click(tagButton);

    expect(onTagClick).toHaveBeenCalledWith('chill');
  });

  it('does not trigger card navigation when a tag is clicked', async () => {
    const onSelect = vi.fn();
    render(
      <WorldCard world={mockWorld} onSelect={onSelect} onTagClick={vi.fn()} />,
    );

    const tagButton = screen.getByTitle('chill');
    await userEvent.click(tagButton);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not trigger card navigation when the share button is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const onSelect = vi.fn();
    render(<WorldCard world={mockWorld} onSelect={onSelect} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    await userEvent.click(shareButton);

    expect(onSelect).not.toHaveBeenCalled();
  });
});
