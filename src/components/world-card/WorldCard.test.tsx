import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorldCard } from '../world-card';
import { ListsProvider } from '../../contexts/ListsContext';

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
  internalAddDate: '2024-02-01',
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ListsProvider>{children}</ListsProvider>;
}

describe('WorldCard', () => {
  it('renders world name and author', () => {
    render(<WorldCard world={mockWorld} />, { wrapper: Wrapper });
    expect(screen.getByText('Test World')).toBeInTheDocument();
    expect(screen.getByText(/by Tester/)).toBeInTheDocument();
  });

  it('renders mapped platform chips', () => {
    render(<WorldCard world={mockWorld} />, { wrapper: Wrapper });
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Android')).toBeInTheDocument();
    expect(screen.getByText('iOS')).toBeInTheDocument();
  });

  it('calls onSelect when the card is clicked', () => {
    const onSelect = vi.fn();
    render(<WorldCard world={mockWorld} onSelect={onSelect} />, { wrapper: Wrapper });
    screen.getByLabelText(/Details - Test World/).click();
    expect(onSelect).toHaveBeenCalledWith('wrld_test');
  });

  it('renders a share button that copies the VRChat URL', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<WorldCard world={mockWorld} onSelect={vi.fn()} />, { wrapper: Wrapper });

    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeInTheDocument();

    await userEvent.click(shareButton);

    expect(writeText).toHaveBeenCalledWith(mockWorld.vrchatUrl);
  });

  it('calls onTagClick when a tag is clicked', async () => {
    const onTagClick = vi.fn();
    render(
      <WorldCard world={mockWorld} onSelect={vi.fn()} onTagClick={onTagClick} />,
      { wrapper: Wrapper },
    );

    const tagButton = screen.getByTitle('chill');
    await userEvent.click(tagButton);

    expect(onTagClick).toHaveBeenCalledWith('chill');
  });

  it('does not trigger card navigation when a tag is clicked', async () => {
    const onSelect = vi.fn();
    render(
      <WorldCard world={mockWorld} onSelect={onSelect} onTagClick={vi.fn()} />,
      { wrapper: Wrapper },
    );

    const tagButton = screen.getByTitle('chill');
    await userEvent.click(tagButton);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('calls onPlatformClick when a platform chip is clicked', async () => {
    const onPlatformClick = vi.fn();
    render(
      <WorldCard world={mockWorld} onSelect={vi.fn()} onPlatformClick={onPlatformClick} />,
      { wrapper: Wrapper },
    );

    const platformButton = screen.getByTitle('Desktop');
    await userEvent.click(platformButton);

    expect(onPlatformClick).toHaveBeenCalledWith('standalonewindows');
  });

  it('does not trigger card navigation when a platform chip is clicked', async () => {
    const onSelect = vi.fn();
    render(
      <WorldCard world={mockWorld} onSelect={onSelect} onPlatformClick={vi.fn()} />,
      { wrapper: Wrapper },
    );

    const platformButton = screen.getByTitle('Desktop');
    await userEvent.click(platformButton);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('falls back to createdAt when internalAddDate is missing', () => {
    render(<WorldCard world={{ ...mockWorld, internalAddDate: undefined }} />, { wrapper: Wrapper });
    expect(
      screen.getByText(new Date('2024-01-01').toLocaleDateString()),
    ).toBeInTheDocument();
  });

  it('does not trigger card navigation when the share button is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const onSelect = vi.fn();
    render(<WorldCard world={mockWorld} onSelect={onSelect} />, { wrapper: Wrapper });

    const shareButton = screen.getByRole('button', { name: /share/i });
    await userEvent.click(shareButton);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders a save button when the world is not in any list', () => {
    render(<WorldCard world={mockWorld} onSelect={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.getByRole('button', { name: /save to list/i })).toBeInTheDocument();
  });

  it('does not trigger card navigation when the save button is clicked', async () => {
    const onSelect = vi.fn();
    render(<WorldCard world={mockWorld} onSelect={onSelect} />, { wrapper: Wrapper });
    const saveButton = screen.getByRole('button', { name: /save to list/i });
    await userEvent.click(saveButton);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders the author as a clickable button when onAuthorClick is provided', () => {
    render(
      <WorldCard world={mockWorld} onSelect={vi.fn()} onAuthorClick={vi.fn()} />,
      { wrapper: Wrapper },
    );
    const authorButton = screen.getByRole('button', { name: /by tester/i });
    expect(authorButton).toBeInTheDocument();
    expect(authorButton.tagName).toBe('BUTTON');
  });

  it('calls onAuthorClick with the author name when the author is clicked', async () => {
    const onAuthorClick = vi.fn();
    render(
      <WorldCard
        world={mockWorld}
        onSelect={vi.fn()}
        onAuthorClick={onAuthorClick}
      />,
      { wrapper: Wrapper },
    );

    await userEvent.click(screen.getByRole('button', { name: /by tester/i }));

    expect(onAuthorClick).toHaveBeenCalledWith('Tester');
  });

  it('does not trigger card navigation when the author is clicked', async () => {
    const onSelect = vi.fn();
    render(
      <WorldCard
        world={mockWorld}
        onSelect={onSelect}
        onAuthorClick={vi.fn()}
      />,
      { wrapper: Wrapper },
    );

    await userEvent.click(screen.getByRole('button', { name: /by tester/i }));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders the author as plain text when authorName is missing', () => {
    const onAuthorClick = vi.fn();
    render(
      <WorldCard
        world={{ ...mockWorld, authorName: '' }}
        onSelect={vi.fn()}
        onAuthorClick={onAuthorClick}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.queryByRole('button', { name: /by/i })).not.toBeInTheDocument();
    expect(screen.getByText(/unknown/i)).toBeInTheDocument();
  });

  it('renders the author as plain text when onAuthorClick is not provided', () => {
    render(<WorldCard world={mockWorld} onSelect={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.queryByRole('button', { name: /by tester/i })).not.toBeInTheDocument();
    expect(screen.getByText(/by tester/i)).toBeInTheDocument();
  });

  it('hides the rating bar when ratingSummary prop is not provided', () => {
    render(<WorldCard world={mockWorld} onSelect={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.queryByTestId('world-rating-bar-card')).not.toBeInTheDocument();
  });

  it('renders a filled rating bar when a summary is provided', () => {
    render(
      <WorldCard
        world={mockWorld}
        onSelect={vi.fn()}
        ratingSummary={{ worldId: 'wrld_test', good: 4, bad: 1, userRating: null }}
      />,
      { wrapper: Wrapper },
    );
    const bar = screen.getByTestId('world-rating-bar-card');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveTextContent('80%');
  });

  it('renders the empty rating bar when ratingSummary is null (no ratings for this world)', () => {
    render(
      <WorldCard world={mockWorld} onSelect={vi.fn()} ratingSummary={null} />,
      { wrapper: Wrapper },
    );
    const bar = screen.getByTestId('world-rating-bar-card');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveTextContent(/no ratings yet/i);
  });
});
